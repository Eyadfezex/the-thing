import { Router } from "express";
import { chatHandler } from "../controllers/chat.controller";

/**
 * Express Router for handling chat-related endpoints
 */
const router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Stream chat responses from Gemini AI
 *     description: Handles chat message streaming with Google's Gemini 1.5 Flash AI model
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *               id:
 *                 type: string
 *                 description: Optional chat session identifier
 *     responses:
 *       200:
 *         description: Server-sent events stream of AI responses
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       504:
 *         description: AI response timeout after 25 seconds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: AI response timeout
 *       500:
 *         description: AI-related error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: AI error
 */
router.post("/chat", chatHandler);

export default router;
