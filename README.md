## Key Decisions and Trade-offs

My main UX improvement is a bulk status update action that lets the user set a selected batch of alerts to a specific status. This is because SOC analysts often receive alert floods where many alerts come in with the same root cause, and are often resolved or updated in status all at once as the problem is addressed.

I also felt that SOC analysts would want a activity log or status history so they can see an audit trail of previous alerts and how their status changes over time. I instructed the agent to reflect this in the SQL schema as a sample.

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

I used a Cursor agent workspace with an initial Next.js project. I gave the agent the key requirements and also asked it to build itself a tool for generating mock JSON data for testing. I also instructed the agent to use a specialized tool to explore the project structure so it can understand the current state of the project.

I prompted it to first generate an implementation plan, then reviewed its checklist and task list before proceeding.

### Where I overrode or steered

- The agent defaulted to a modal drawer, which I changed to a split-pane after considering the analyst workflow.
- I instructed the agent to also implement a bulk status update feature
- I steered the agent to create the status history SQL schema

## Production Improvements

For production, the controller and SQL schema would need additional improvements. Authentication should be addressed with a real auth server. I would also implement getter endpoints for alerts and for the alert status history, and rate limiting to protect servers from overloading.

In production, I would also synthesize complete test cases and include them in the agent's test loop. These can be unit tests for features, and code coverage tests to ensure that everything the agent built works as intended.

I would also install agent rulesets for code brevity. In my research, the open source project [ponytail](https://github.com/DietrichGebert/ponytail) looks very promising. It enforces agents to use libraries, dependencies, and existing code where possible instead of constantly building net new code. This minimizes the impact footprint of the agent while still completing its task, making the output easier to maintain, debug, more token friendly, and faster. This is much more relevant in a real production scenario where we constantly improve upon a single product or service.