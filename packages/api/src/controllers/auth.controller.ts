import { Request, Response } from "express";
import {
  refreshAccessToken,
  registerUser,
  signIn,
} from "../services/auth.service";

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
      // Set token as HTTP-only cookie
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result) {
      res.status(401).json({ error: "Invalid refresh token" });
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
 * @param req - Express request object
 * @param res - Express response object
 * @returns Success message JSON response after clearing auth token cookie
 */
export async function logoutController(req: Request, res: Response) {
  try {
    // Clear the auth token cookie
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
