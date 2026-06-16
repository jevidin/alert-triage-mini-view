## Key Decisions and Trade-offs

My main UX improvement is a bulk status update action that lets the user set a selected batch of alerts to a specific status. This is because SOC analysts often receive alert floods where many alerts come in with the same root cause, and are often resolved or updated in status all at once as the problem is addressed.

The agent initially defaulted to a modal drawer for the alert details view. I overrode this and changed it to a split-pane after thinking through the analyst workflow, allowing users to see the alert list and details simultaneously.

## AI Coding Agent Usage

I used Cursor Agents throughout.

### What I delegated

I delegated:
- Initial file and folder scaffolding
- TypeScript type definitions (`Alert`, `AlertStatus`, `State`, `Action` union)
- Reducer skeleton
- Mock JSON generation

I also used it to generate:
- The ASP.NET controller stub
- SQL schema (see `backend/` folder)

### Agent setup and workflow

I used a Cursor agent workspace with an initial Next.js project. I prompted it with the key requirements and also asked it to build itself a tool for generating mock JSON data for testing.

I prompted it to first generate an implementation plan, then reviewed its checklist and task list before proceeding.

### Where I overrode or steered

The agent defaulted to a modal drawer, which I changed to a split-pane after considering the analyst workflow.

## Production Improvements

For production, the controller and SQL schema would need additional improvements. Authentication should be addressed with a real auth server. I would also implement getter endpoints and rate limiting to protect servers from overloading.

I would put more emphasis on complete test cases and include them in the agent's test loop.

I would also install rulesets for code brevity. A recent open source project, [ponytail](https://github.com/DietrichGebert/ponytail), looks very promising. It enforces agents to use libraries, dependencies, and existing code where possible instead of constantly building net new code. This minimizes the impact footprint of the agent while still completing its task, making the output easier to maintain, debug, more token friendly, and faster.