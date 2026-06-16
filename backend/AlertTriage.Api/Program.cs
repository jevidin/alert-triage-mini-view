using System.Data;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var connectionString = builder.Configuration.GetConnectionString("AlertsDb")
    ?? throw new InvalidOperationException("Connection string 'AlertsDb' not configured.");

app.MapPatch("/api/alerts/{id:guid}/status", async (
    Guid id,
    UpdateStatusRequest request,
    HttpContext httpContext) =>
{
    if (!AlertEnums.TryParseStatus(request.Status, out var newStatus))
    {
        return Results.BadRequest(new { error = "Invalid status value." });
    }

    var changedBy = httpContext.Request.Headers["X-Analyst-Id"].FirstOrDefault()
        ?? "system";

    byte[]? expectedRowVersion = null;
    if (!string.IsNullOrWhiteSpace(request.ExpectedRowVersion))
    {
        try
        {
            expectedRowVersion = Convert.FromBase64String(request.ExpectedRowVersion);
        }
        catch (FormatException)
        {
            return Results.BadRequest(new { error = "Invalid expectedRowVersion encoding." });
        }
    }

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

    byte oldStatus;
    byte[] rowVersion;

    await using (var selectCmd = new SqlCommand(
        "SELECT Status, RowVersion FROM Alerts WHERE Id = @Id",
        connection,
        transaction))
    {
        selectCmd.Parameters.Add("@Id", SqlDbType.UniqueIdentifier).Value = id;
        await using var reader = await selectCmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            await transaction.RollbackAsync();
            return Results.NotFound();
        }

        oldStatus = reader.GetByte(0);
        rowVersion = (byte[])reader[1];
    }

    if (expectedRowVersion is not null &&
        !rowVersion.SequenceEqual(expectedRowVersion))
    {
        await transaction.RollbackAsync();
        return Results.Conflict(new
        {
            error = "Alert was modified by another user. Refresh and retry.",
            currentRowVersion = Convert.ToBase64String(rowVersion),
        });
    }

    await using (var updateCmd = new SqlCommand(
        """
        UPDATE Alerts
        SET Status = @Status, UpdatedAt = SYSDATETIMEOFFSET()
        WHERE Id = @Id AND RowVersion = @RowVersion
        """,
        connection,
        transaction))
    {
        updateCmd.Parameters.Add("@Status", SqlDbType.TinyInt).Value = newStatus;
        updateCmd.Parameters.Add("@Id", SqlDbType.UniqueIdentifier).Value = id;
        updateCmd.Parameters.Add("@RowVersion", SqlDbType.Timestamp).Value = rowVersion;

        var rows = await updateCmd.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            await transaction.RollbackAsync();
            return Results.Conflict(new { error = "Concurrent update detected." });
        }
    }

    await using (var historyCmd = new SqlCommand(
        """
        INSERT INTO AlertStatusHistory (AlertId, OldStatus, NewStatus, ChangedBy)
        VALUES (@AlertId, @OldStatus, @NewStatus, @ChangedBy)
        """,
        connection,
        transaction))
    {
        historyCmd.Parameters.Add("@AlertId", SqlDbType.UniqueIdentifier).Value = id;
        historyCmd.Parameters.Add("@OldStatus", SqlDbType.TinyInt).Value = oldStatus;
        historyCmd.Parameters.Add("@NewStatus", SqlDbType.TinyInt).Value = newStatus;
        historyCmd.Parameters.Add("@ChangedBy", SqlDbType.NVarChar, 200).Value = changedBy;
        await historyCmd.ExecuteNonQueryAsync();
    }

    AlertDto alert;
    await using (var fetchCmd = new SqlCommand(
        """
        SELECT Id, Title, Severity, Status, Source, Assignee, CreatedAt, UpdatedAt, RowVersion
        FROM Alerts WHERE Id = @Id
        """,
        connection,
        transaction))
    {
        fetchCmd.Parameters.Add("@Id", SqlDbType.UniqueIdentifier).Value = id;
        await using var reader = await fetchCmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            await transaction.RollbackAsync();
            return Results.NotFound();
        }

        alert = MapAlert(reader);
    }

    await transaction.CommitAsync();
    return Results.Ok(alert);
});

app.MapPatch("/api/alerts/bulk-status", async (
    BulkUpdateStatusRequest request,
    HttpContext httpContext) =>
{
    if (request.Ids is null || request.Ids.Count == 0)
    {
        return Results.BadRequest(new { error = "At least one alert id is required." });
    }

    if (request.Ids.Count > 100)
    {
        return Results.BadRequest(new { error = "Maximum batch size is 100 alerts." });
    }

    if (!AlertEnums.TryParseStatus(request.Status, out var newStatus))
    {
        return Results.BadRequest(new { error = "Invalid status value." });
    }

    var changedBy = httpContext.Request.Headers["X-Analyst-Id"].FirstOrDefault()
        ?? "system";

    var updated = 0;

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    foreach (var id in request.Ids)
    {
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

        byte oldStatus;
        byte[] rowVersion;

        await using (var selectCmd = new SqlCommand(
            "SELECT Status, RowVersion FROM Alerts WHERE Id = @Id",
            connection,
            transaction))
        {
            selectCmd.Parameters.Add("@Id", SqlDbType.UniqueIdentifier).Value = id;
            await using var reader = await selectCmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await transaction.RollbackAsync();
                continue;
            }

            oldStatus = reader.GetByte(0);
            rowVersion = (byte[])reader[1];
        }

        if (oldStatus == newStatus)
        {
            await transaction.RollbackAsync();
            continue;
        }

        await using (var updateCmd = new SqlCommand(
            """
            UPDATE Alerts
            SET Status = @Status, UpdatedAt = SYSDATETIMEOFFSET()
            WHERE Id = @Id AND RowVersion = @RowVersion
            """,
            connection,
            transaction))
        {
            updateCmd.Parameters.Add("@Status", SqlDbType.TinyInt).Value = newStatus;
            updateCmd.Parameters.Add("@Id", SqlDbType.UniqueIdentifier).Value = id;
            updateCmd.Parameters.Add("@RowVersion", SqlDbType.Timestamp).Value = rowVersion;

            var rows = await updateCmd.ExecuteNonQueryAsync();
            if (rows == 0)
            {
                await transaction.RollbackAsync();
                continue;
            }
        }

        await using (var historyCmd = new SqlCommand(
            """
            INSERT INTO AlertStatusHistory (AlertId, OldStatus, NewStatus, ChangedBy)
            VALUES (@AlertId, @OldStatus, @NewStatus, @ChangedBy)
            """,
            connection,
            transaction))
        {
            historyCmd.Parameters.Add("@AlertId", SqlDbType.UniqueIdentifier).Value = id;
            historyCmd.Parameters.Add("@OldStatus", SqlDbType.TinyInt).Value = oldStatus;
            historyCmd.Parameters.Add("@NewStatus", SqlDbType.TinyInt).Value = newStatus;
            historyCmd.Parameters.Add("@ChangedBy", SqlDbType.NVarChar, 200).Value = changedBy;
            await historyCmd.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        updated++;
    }

    return Results.Ok(new { updated, requested = request.Ids.Count });
});

app.Run();

static AlertDto MapAlert(SqlDataReader reader)
{
    return new AlertDto(
        reader.GetGuid(0),
        reader.GetString(1),
        AlertEnums.ToSeverity(reader.GetByte(2)),
        AlertEnums.ToStatus(reader.GetByte(3)),
        reader.GetString(4),
        reader.IsDBNull(5) ? null : reader.GetString(5),
        reader.GetDateTimeOffset(6),
        reader.GetDateTimeOffset(7),
        Convert.ToBase64String((byte[])reader[8]));
}

record UpdateStatusRequest(string Status, string? ExpectedRowVersion);

record BulkUpdateStatusRequest(List<Guid> Ids, string Status);

record AlertDto(
    Guid Id,
    string Title,
    string Severity,
    string Status,
    string Source,
    string? Assignee,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string RowVersion);

static class AlertEnums
{
  private static readonly Dictionary<string, byte> StatusMap = new(StringComparer.OrdinalIgnoreCase)
  {
      ["New"] = 1,
      ["In Progress"] = 2,
      ["Resolved"] = 3,
      ["False Positive"] = 4,
  };

  private static readonly Dictionary<byte, string> StatusNames = StatusMap
      .ToDictionary(kvp => kvp.Value, kvp => kvp.Key);

  private static readonly Dictionary<string, byte> SeverityMap = new(StringComparer.OrdinalIgnoreCase)
  {
      ["Critical"] = 1,
      ["High"] = 2,
      ["Medium"] = 3,
      ["Low"] = 4,
  };

  private static readonly Dictionary<byte, string> SeverityNames = SeverityMap
      .ToDictionary(kvp => kvp.Value, kvp => kvp.Key);

  public static bool TryParseStatus(string value, out byte status) =>
      StatusMap.TryGetValue(value, out status);

  public static string ToStatus(byte value) =>
      StatusNames.GetValueOrDefault(value, "New");

  public static string ToSeverity(byte value) =>
      SeverityNames.GetValueOrDefault(value, "Low");
}
