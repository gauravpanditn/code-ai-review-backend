import { google } from "@ai-sdk/google";
import { embed, generateText, streamText } from "ai";
import { pineconeIndex } from "../lib/pinecone.js";
import "dotenv/config";

export async function generateEmbedding(text: string) {
    const { embedding } = await embed({
        model: google.embeddingModel("gemini-embedding-001"),
        value: text,
    });

    return embedding;
}

export async function indexCodebase(
    repoId: string,
    files: { path: string; content: string }[]
) {
    

    const vectors = [];

    for (const file of files) {
        const content = `File: ${file.path}\n\n${file.content}`;

        const truncatedContent = content.slice(0, 8000);

        try {
            const embedding = await generateEmbedding(
                truncatedContent
            );

            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, "_")}`,

                values: embedding,

                metadata: {
                    repoId,
                    path: file.path,
                    content: truncatedContent,
                },
            });

           
        } catch (e) {
            console.error(
                ` Failed to embed ${file.path}:`,
                e
            );
        }
    }

    if (vectors.length > 0) {
        const batchSize = 100;

        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(
                i,
                i + batchSize
            );

            await pineconeIndex.upsert({
                records: batch,
            });

            
        }
    }

    console.log("✅ Indexing complete");
}

export async function retrieveContext(
    query: string,
    repoId: string,
    topK: number = 5
) {
    

    const embedding = await generateEmbedding(query);

   

    const results = await pineconeIndex.query({
        vector: embedding,

        filter: {
            repoId: {
                $eq: repoId,
            },
        },

        topK,

        includeMetadata: true,
    });


    console.log(
        results.matches.map((match) => ({
            score: match.score,
            repoId: match.metadata?.repoId,
            path: match.metadata?.path,
        }))
    );

    const context = results.matches
        .map((match) => ({
            path: match.metadata?.path as string,
            content: match.metadata?.content as string,
        }))
        .filter((item) => item.content);

    
    return context;
}

export async function generateChatResponse(
    question: string,
    context: {
        path: string;
        content: string;
    }[]
) {
    const repositoryContext = context
        .map(
            (item) => `
File: ${item.path}

${item.content}
`
        )
        .join("\n\n");

    console.log(
        "🤖 Generating AI response..."
    );

    const result = streamText({
        model: google("gemini-3.6-flash"),

        system: `
You are an AI coding assistant for a GitHub repository.

Your job is to answer the user's questions about the repository
like a helpful AI chat assistant.

Rules:
- Answer naturally and conversationally.
- Be concise and direct.
- Do not produce a report unless the user asks for one.
- Do not unnecessarily create headings or bullet lists.
- Use repository context as your primary source.
- Only state information supported by the provided context.
- Do not invent files, technologies, versions, or functionality.
- Mention file names when they are useful to explain the answer.
- If the context is insufficient, say that you don't have enough
  information from the indexed repository.
- If the user asks a simple question, give a simple answer.
- If the user asks for an explanation, explain it clearly.
- If the user asks for code, provide code.
- Do not use Markdown links.
`,

        prompt: `
Repository context:

${repositoryContext}

User question:

${question}
`,
    });

    return result.textStream;
}