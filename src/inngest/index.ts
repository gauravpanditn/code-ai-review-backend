import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { indexRepo } from "./functions.js";
import { generateReview } from "./review.js";


export const inngestHandler = serve({
  client: inngest,
  functions: [indexRepo,generateReview],

});