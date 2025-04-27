import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.config";
import { prisma } from "../lib/prisma";
import redis from "../redis";

/**
 * Middleware to authenticate JWT tokens in requests
 *
 * This middleware validates JWT tokens from either:
 * 1. The Authorization header in the format "Bearer <token>"
 * 2. A cookie named "accessToken" as fallback
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns void
 *
 * @throws 401 Unauthorized - When no token is provided
 * @throws 401 Unauthorized - When the token is invalid or expired
 *
 * On successful validation:
 * - Decoded token payload is attached to request object as req.user
 * - Request continues to next middleware/handler
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check Authorization cookies
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Middleware to check if user has required role
 *
 * @param requiredRole - Role required to access the route
 * @returns Middleware function
 *
 * @throws 403 Forbidden - When user doesn't have required role
 */
export function checkRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(403).json({ error: "No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as any;
      const role = decoded.role;

      if (!role) {
        res.status(403).json({ error: "No role information found" });
        return;
      }

      if (!allowedRoles.includes(role)) {
        res.status(403).json({
          error: `Required role: ${allowedRoles.join(
            ", "
          )}, User role: ${role}`,
        });
        return;
      }

      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  };
}

/**
 * Middleware to check if a JWT token has been blacklisted
 *
 * This middleware checks if an access token has been explicitly invalidated
 * by checking against a Redis blacklist store.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns void
 *
 * @throws 401 Unauthorized - When no token is provided
 * @throws 401 Unauthorized - When token is found in blacklist
 * @throws 500 Internal Server Error - On Redis errors
 *
 * On successful validation:
 * - Request continues to next middleware/handler if token is not blacklisted
 */
export const checkBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Assuming you stored the token inside a cookie called 'accessToken'
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`bl_${accessToken}`);

    if (isBlacklisted) {
      res.status(401).json({ message: "Unauthorized: Token is blacklisted" });
      return;
    }

    next(); // Token is good, go ahead
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
