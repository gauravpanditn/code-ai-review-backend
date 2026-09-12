type ChatJob = {
    repositoryId: string;
    question: string;
};

export const chatJobs = new Map<string, ChatJob>();