I used Cursor Agents throughout. I delegated the initial file and folder scaffolding, the TypeScript type definitions (Alert, AlertStatus, State, Action union), the reducer skeleton, and the mock JSON generation.
I also used it to generate the ASP.NET controller stub and SQL schema.

Where I overrode or steered: Agent defaulted to a modal drawer, which I changed to a split-pane after thinking through the analyst workflow so a user can easily see list + details simultaneously.

My UX improvement is a bulk status update action that lets the user set a selected batch of alerts to a specific status. This is because SOC analysts often receive alert floods where many alerts come in with the same
root cause, and are often resolved or updated in status all at once as the problem is addressed.