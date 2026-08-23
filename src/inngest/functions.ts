import { indexCodebase } from "../ai/rag.js";
import { inngest } from "./client.js";
import { prisma } from "../lib/primsa.js";
import { getRepoFileContents } from "../lib/github.js";

export const indexRepo:any = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repository.connected" }],
  },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No GitHub access token found");
      }

      return getRepoFileContents(
        account.accessToken,
        repo,
        owner
      );
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files);
    });
  
    

    

    return {
      success: true,
      filesIndexed: files.length,
    };
  }
);

