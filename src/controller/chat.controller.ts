import type {
    Request,
    Response,
} from "express";

import {
    createChatService,
    streamChatService,
} from "../service/chat.service.js";


// POST /chat
export const createChatController = (
    req: Request,
    res: Response
) => {

    try {

        const {
            repositoryId,
            question,
        } = req.body;


        if (
            !repositoryId ||
            !question?.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "repositoryId and question are required",
            });

        }


        const chatId =
            createChatService(
                repositoryId,
                question.trim()
            );


        return res.status(201).json({
            success: true,
            chatId,
        });


    } catch (error) {

        console.error(
            "Create chat error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to create chat",
        });

    }
};


// GET /chat/stream/:chatId
export const streamChatController = async (
    req: Request,
    res: Response
) => {

    const {
        chatId,
    } = req.params;

    if (!chatId || Array.isArray(chatId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid chatId",
        });
    }

    

    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.setHeader(
        "X-Accel-Buffering",
        "no"
    );


    res.flushHeaders();


    try {

        await streamChatService(
            chatId,
            res
        );

    } catch (error) {

        console.error(
            "Stream controller error:",
            error
        );


        if (!res.writableEnded) {

            res.write(
                `data: ${JSON.stringify({
                    error:
                        "Failed to stream response",
                })}\n\n`
            );

            res.end();

        }

    }
};