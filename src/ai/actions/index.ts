
import { inngest } from "../../inngest/client.js";
import { getPullRequestDiff } from "../../lib/github.js";
import { prisma } from "../../lib/primsa.js";


export async function reviewPullRequest(owner:string,repo:string,prNumber:number) {
   try {
     const repository = await prisma.repositary.findFirst({
    where:{
        owner,
        name:repo
    },
    include:{
        user:{
            include:{
                accounts:{
                    where:{
                        providerId:"github"
                    }
                }
            }
        }
    }
})

const githubAccount=repository?.user.accounts[0];
if(!githubAccount?.accessToken){
    throw new Error("Unauthorized")
}

const token:any=githubAccount?.accessToken;
const {title}=await getPullRequestDiff(token,owner,repo,prNumber);

await inngest.send({
    name:"pr.review-connected",
    data:{
        owner,
        repo,
        prNumber,
        userId:repository?.user.id
    }
})
return {
    success:true,
    message:"Review Quened"
}
   } catch (error) {
     try {
        const repository = await prisma.repositary.findFirst({
  where:{owner , name:repo}
})

if(repository){
  await prisma.review.create({
    data:{
      repositoryId:repository.id,
      prNumber,
      prTitle:"Failed to fetch PR",
      prUrl:`https://github.com/${owner}/${repo}/pull/${prNumber}`,
      review:`Error: ${error  instanceof Error ? error.message : "Unknown Error"}`,
      status:"failed"
    }
  })
}
     } catch (error) {
        console.log(error);
        
     }
   }

}

export async function solveIssue(
    owner: string,
    repo: string,
    issueNumber: number
) {
    return await inngest.send({
        name: "issue.solve-requested",
        data: {
            owner,
            repo,
            issueNumber,
        },
    });
}