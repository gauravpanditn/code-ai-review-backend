import type { Response } from "express";
import { randomUUID } from "crypto";

import {
    generateChatResponse,
    retrieveContext,
} from "../ai/rag.js";

import {
    chatJobs,
} from "../store/chatJob.js";



export const createChatService = (
    repositoryId: string,
    question: string
) => {

    const chatId = randomUUID();

    chatJobs.set(chatId, {
        repositoryId,
        question,
    });

    console.log(
        "Chat job created:",
        chatId
    );

    return chatId;
};




export const streamChatService = async (
    chatId: string,
    res: Response
) => {

    const job = chatJobs.get(chatId);



    if (!job) {

        res.write(
            `data: ${JSON.stringify({
                error: "Chat not found",
            })}\n\n`
        );

        res.end();

        return;
    }


    const {
        repositoryId,
        question,
    } = job;




    let buffer = "";




    const interval = setInterval(() => {

        if (!buffer) {
            return;
        }


        const chunk = buffer;

        buffer = "";


        console.log(
            "SSE chunk:",
            chunk
        );


        res.write(
            `data: ${JSON.stringify(chunk)}\n\n`
        );

    }, 50);


    try {



        const context =
            await retrieveContext(
                question,
                repositoryId,
                5
            );


        console.log(
            "Retrieved chunks:",
            context.length
        );




        const stream =
            await generateChatResponse(
                question,
                context
            );




        for await (const chunk of stream) {

            buffer += chunk;

        }




        if (buffer) {

            res.write(
                `data: ${JSON.stringify(buffer)}\n\n`
            );

            buffer = "";

        }




        res.write(
            "data: [DONE]\n\n"
        );


    } catch (error) {

        console.error(
            "Chat stream error:",
            error
        );


        res.write(
            `data: ${JSON.stringify({
                error:
                    "Failed to generate response",
            })}\n\n`
        );


    } finally {

        clearInterval(interval);

        chatJobs.delete(chatId);


        if (!res.writableEnded) {
            res.end();
        }

    }
};