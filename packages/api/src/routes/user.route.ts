import { Router } from "express";
import {
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found successfully
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       404:
 *         description: User not found
 */
router.get("/", authenticateToken, getUserByIdController);

/**
 * @swagger
 * /api/user:
 *   patch:
 *     summary: Update a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.patch("/", authenticateToken, updateUserController);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/", authenticateToken, deleteUserController);

export default router;
