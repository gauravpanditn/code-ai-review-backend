
import { Octokit } from "octokit";

import type { Request } from "express";
import { prisma } from "./primsa.js";
import "dotenv/config.js"
export const getGithubToken = async (
  userId: string
) => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
  });
  

  if (!account?.accessToken) {
    throw new Error(
      "No GitHub access token found"
    );
  }

  return account.accessToken;
};



// interface ContributionData {
//   user: {
//     contributionCollection: {
//       contributionCalendar: {
//         totalContributions: number;
//         weeks: {
//           contributionDays: {
//             contributionCount: number;
//             date: string;
//             color: string;
//           }[];
//         }[];
//       };
//     };
//   };
// }

export async function fetchUserContribution(
  token: string,
  username: string
) {
  const octokit = new Octokit({
    auth: token,
  });

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: any = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    throw error;
  }
}

export const getRepositories=async(userId:string, page:number=1,perPage:number=10)=>{
  const token=await getGithubToken(userId);
  const octokit=new Octokit({auth:token});
  const {data}=await octokit.rest.repos.listForAuthenticatedUser({
    sort:"updated",
    direction:"desc",
    visibility:"all",
    per_page:perPage,
    page:page

  })
  return data;

}

export const createWebhook=async(userId:string,owner:string,repo:string)=>{
  const token=await getGithubToken(userId);
  const octokit=new Octokit({auth:token});
  const webhookUrl=`${process.env.PUBLIC_APP_URL}/api/webhooks/github`
  const{data:hooks}=await octokit.rest.repos.listWebhooks({
    owner,
    repo
  })
  const existingHook=hooks.find(hook=>hook.config.url===webhookUrl)
  if(existingHook)
    return existingHook;
  const {data}=await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config:{
      url:webhookUrl,
      content_type:"json"
    },
    events:["pull_request"]
  })
  return data;
}

export const deleteWebhok = async (
  userId:string,
  owner: string,
  repo: string
) => {
  const token = await getGithubToken(userId);

  const octokit = new Octokit({
    auth: token,
  });

  const webhookUrl =
    `${process.env.PUBLIC_APP_URL}/api/webhooks/github`;

  console.log("Searching URL:", webhookUrl);

  const { data: hooks } =
    await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

  console.log(
    "All hooks:",
    hooks.map((h) => ({
      id: h.id,
      url: h.config.url,
    }))
  );

  const hookToDelete = hooks.find(
    (hook) => hook.config.url === webhookUrl
  );

  console.log(
    "Hook found:",
    hookToDelete
  );

  if (hookToDelete) {
    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookToDelete.id,
    });

    console.log("Webhook deleted");

    return true;
  }

  console.log(
    "No matching webhook found"
  );

  return false;
};

export const getRepoFileContents = async (
  token: string,
  repo: string,
  owner: string,
  path: string = ""
): Promise<{ path: string; content: string }[]> => {
  const octokit = new Octokit({
    auth: token,
  });

  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  // Single file
  if (!Array.isArray(data)) {
    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }

    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of data) {
    if (item.type === "file") {
      const { data: fileData } =
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });

      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        // Skip binary files
        if (
          !item.path.match(
            /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|exe|dll)$/i
          )
        ) {
          files.push({
            path: item.path,
            content: Buffer.from(
              fileData.content,
              "base64"
            ).toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents(
        token,
        repo,
        owner,
        item.path
      );

      files = files.concat(subFiles);
    }
  }

  return files;
};

export  async function getPullRequestDiff(token:string,owner:string,repo:string,prNumber:number) {
  const octokit = new Octokit({auth:token});

const {data:pr} = await octokit.rest.pulls.get({
  owner,
  repo,
  pull_number:prNumber
})

const {data:diff} = await octokit.rest.pulls.get({
  owner,
  repo,
  pull_number:prNumber,
  mediaType:{
      format:"diff"
  }
})

return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
}
  
}
export async function postReviewComment(
    token:string,
    owner:string,
    repo:string,
    prNumber:number,
    review:string
) {
    const octokit = new Octokit({auth:token});

    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number:prNumber,
        body: `## 🤖 AI Code Review\n\n${review}\n\n---\n*Powered by CodeHorse*`
    })
}