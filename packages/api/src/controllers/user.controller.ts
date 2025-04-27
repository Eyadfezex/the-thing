import { Request, Response } from "express";
import * as userService from "../services/user.service";
import jwt from "jsonwebtoken";

/**
 * Retrieves a user by their ID from the access token
 * @param req Express request object containing the access token in cookies
 * @param res Express response object
 * @returns {Promise<Response>} Returns a Promise that resolves to:
 * - 200 and user object if found
 * - 401 if token is invalid
 * - 500 for server errors
 * @throws {jwt.JsonWebTokenError} When token is invalid or expired
 */
export async function getUserByIdController(req: Request, res: Response) {
  try {
    const { userId } = (req as any).user;
    const user = await userService.getUserById(userId);

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates a user's information
 * @param req Express request object containing:
 *  - user.userId: ID of the authenticated user from JWT token
 *  - body: Partial user data to update
 * @param res Express response object
 * @returns {Promise<Response>} Returns a Promise that resolves to:
 * - 200 and updated user object if successful
 * - 404 if user not found
 * - 500 for server errors
 */
export async function updateUserController(req: Request, res: Response) {
  try {
    const { userId } = (req as any).user;
    const partialData = req.body;

    const user = await userService.updateUser(userId, partialData);
    res.status(200).json(user);
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Deletes a user by their ID
 * @param req Express request object containing:
 *  - user.userId: ID of the authenticated user from JWT token
 * @param res Express response object
 * @returns {Promise<Response>} Returns a Promise that resolves to:
 * - 200 with success message if deleted
 * - 404 if user not found
 * - 500 for server errors
 */
export async function deleteUserController(req: Request, res: Response) {
  try {
    const { userId } = (req as any).user;

    await userService.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
