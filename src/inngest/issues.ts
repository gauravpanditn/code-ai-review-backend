import { inngest } from "./client.js";

export const solveGithubIssue:any = inngest.createFunction(
    {
        id: "solve-github-issue",
        triggers: [
            {
                event: "issue.solve-requested",
            },
        ],
    },

    async ({ event, step }) => {
        const {
            owner,
            repo,
            issueNumber,
        } = event.data;

        await step.run(
            "fetch-issue",
            async () => {
                console.log(
                    `Fetching issue #${issueNumber}`
                );
            }
        );

        await step.run(
            "create-sandbox",
            async () => {
                console.log(
                    "Creating E2B sandbox"
                );
            }
        );

        await step.run(
            "clone-repository",
            async () => {
                console.log(
                    `Cloning ${owner}/${repo}`
                );
            }
        );

        await step.run(
            "solve-issue",
            async () => {
                console.log(
                    `AI solving issue #${issueNumber}`
                );
            }
        );

        await step.run(
            "run-tests",
            async () => {
                console.log("Running tests");
            }
        );

        await step.run(
            "create-pr",
            async () => {
                console.log("Creating PR");
            }
        );

        return {
            success: true,
        };
    }
);