import type{ Request, Response } from "express";
import { reviewPullRequest } from "../ai/actions/index.js";

export const githubWebhookController = async (
  req: Request,
  res: Response
) => {
  try {
    

    const event = req.headers["x-github-event"];

   if (event === "ping") {
      return res.status(200).json({
        message: "Pong",
      });
    }
if(event === "pull_request"){
    const action = req.body.action;
    const repo = req.body.repository.full_name;
    const prNumber = req.body.number;
    
    const [owner , repoName]= repo.split("/")

    if(action === "opened" || action === "synchronize"){
       console.log("Reviewing");
       
        reviewPullRequest(owner , repoName , prNumber)
        .then(()=>console.log(`Review completed for ${repo} #${prNumber}`))
        .catch((error)=>console.log(`Review failed for ${repo} #${prNumber}`))
    }

}
    

    return res.status(200).json({
      success: true,
      message: "Event Processed",
    });

    

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};