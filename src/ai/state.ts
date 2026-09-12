import { Annotation } from "@langchain/langgraph";

export const ReviewStateAnnotation = Annotation.Root({
  title: Annotation<string>(),
  description: Annotation<string>(),
  diff: Annotation<string>(),
  context: Annotation<{
    path: string;
    content: string;
  }[]>(),
  walkthrough: Annotation<string>(),
  summary: Annotation<string>(),
  strengths: Annotation<string>(),
  issues: Annotation<string>(),
  security: Annotation<string>(),
  architecture: Annotation<string>(),
  risk: Annotation<string>(),

  finalReview: Annotation<string>(),
});

export type ReviewState = typeof ReviewStateAnnotation.State;