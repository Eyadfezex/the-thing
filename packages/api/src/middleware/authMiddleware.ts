import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.config";
import { prisma } from "../lib/prisma";

/**
 * Middleware to authenticate JWT tokens in requests
 *
 * This middleware validates JWT tokens from either:
 * 1. The Authorization header in the format "Bearer <token>"
 * 2. A cookie named "token" as fallback
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
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
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
export function checkRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(403).json({ error: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as any;
      const role = decoded.role;

      if (!role) {
        return res.status(403).json({ error: "No role information found" });
      }

      if (role !== requiredRole) {
        return res.status(403).json({
          error: `Required role: ${requiredRole}, User role: ${role}`,
        });
      }

      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
  };
}
