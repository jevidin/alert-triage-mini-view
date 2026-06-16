-- Alert Triage schema (SQL Server)

CREATE TABLE Alerts (
    Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title         NVARCHAR(500)  NOT NULL,
    Severity      TINYINT        NOT NULL,  -- 1=Critical, 2=High, 3=Medium, 4=Low
    Status        TINYINT        NOT NULL DEFAULT 1,  -- 1=New, 2=In Progress, 3=Resolved, 4=False Positive
    Source        NVARCHAR(100)  NOT NULL,
    Assignee      NVARCHAR(200)  NULL,
    CreatedAt     DATETIMEOFFSET NOT NULL,
    UpdatedAt     DATETIMEOFFSET NOT NULL,
    RowVersion    ROWVERSION     NOT NULL
);

CREATE TABLE AlertStatusHistory (
    Id         BIGINT IDENTITY PRIMARY KEY,
    AlertId    UNIQUEIDENTIFIER NOT NULL REFERENCES Alerts(Id),
    OldStatus  TINYINT NOT NULL,
    NewStatus  TINYINT NOT NULL,
    ChangedBy  NVARCHAR(200) NOT NULL,
    ChangedAt  DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_Alerts_Status_Severity_CreatedAt
    ON Alerts (Status, Severity, CreatedAt DESC);

CREATE INDEX IX_AlertStatusHistory_AlertId
    ON AlertStatusHistory (AlertId, ChangedAt DESC);
