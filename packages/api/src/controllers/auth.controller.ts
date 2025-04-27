import { Request, Response } from "express";
import {
  AuthenticationError,
  refreshAccessToken,
  registerUser,
  signIn,
} from "../services/auth.service";
import redis from "../redis"; // Import your redis client

const safeUser = (result: any) => {
  return {
    user: result.user,
  };
};

/**
 * Authenticates user login attempt and creates session
 * @param req - Express request containing email and password in request body
 * @param res - Express response object
 * @returns User data JSON response and sets HTTP-only access and refresh token cookies
 */
export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await signIn({ email, password });
    if (result) {
      // Set token as HTTP-only cookie
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.json(safeUser(result));
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates new user account and initializes authentication session
 * @param req - Express request containing name, email and password in request body
 * @param res - Express response object
 * @returns New user data JSON response and sets HTTP-only access and refresh token cookies
 */
export async function registerController(req: Request, res: Response) {
  const { name, email, password } = req.body;

  try {
    const result = await registerUser({ name, email, password });

    if (result) {
      // Set token as HTTP-only cookies
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", // Uncomment in production
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure cookie for production
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      // Send the safe user object in the response
      res.json({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      });

      return;
    } else {
      // If something goes wrong and no result is returned
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error: unknown) {
    // Specific error handling
    if (error instanceof AuthenticationError) {
      // Authentication-specific error (e.g., "Email already registered")
      res.status(400).json({ error: (error as AuthenticationError).message });
    } else if (error instanceof Error) {
      // General errors (e.g., database error, etc.)
      res.status(500).json({ error: `Registration failed: ${error.message}` });
    } else {
      // Catch any other errors that do not fall under known types
      res.status(500).json({ error: "Registration failed: Unknown error" });
    }
  }
}

/**
 * Generates new access token using provided refresh token
 * @param req - Express request containing refresh token in cookies
 * @param res - Express response object
 * @returns Success message JSON response and sets new HTTP-only access and refresh token cookies
 */
export async function refreshTokenController(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token not found" });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // Set new access token as HTTP-only cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Set new refresh token
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Terminates user session and clears authentication cookies
 * @param req - Express request object containing accessToken and refreshToken in cookies
 * @param res - Express response object
 * @returns
 *  - 200 JSON response with success message after clearing cookies and blacklisting tokens
 *  - 401 JSON response if no authentication tokens are found in cookies
 *  - 500 JSON response if server error occurs during logout process
 * @description
 * This controller handles user logout by:
 * 1. Checking for existing authentication tokens in cookies
 * 2. Clearing both access and refresh token cookies with secure settings
 * 3. Blacklisting the tokens in Redis to prevent reuse:
 *    - Access token blacklisted for 1 hour
 *    - Refresh token blacklisted for 7 days
 */
export async function logoutController(req: Request, res: Response) {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // Return early if no tokens found
    if (!accessToken && !refreshToken) {
      res.status(401).json({ error: "No authentication tokens found" });
      return;
    }

    // Clear cookies with same settings as when they were set
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    // Blacklist both tokens if they exist
    const blacklistPromises = [];
    if (accessToken) {
      blacklistPromises.push(
        redis.set(`bl_${accessToken}`, "true", "EX", 60 * 60)
      );
    }
    if (refreshToken) {
      blacklistPromises.push(
        redis.set(`bl_${refreshToken}`, "true", "EX", 7 * 24 * 60 * 60)
      );
    }

    // Wait for both tokens to be blacklisted
    await Promise.all(blacklistPromises);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
