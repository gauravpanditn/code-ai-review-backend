import { Router } from "express";
import { createChatController, streamChatController } from "../controller/chat.controller.js";



const router = Router();

router.post("/", createChatController);
router.get(
    "/stream/:chatId",
    streamChatController
);


export default router;