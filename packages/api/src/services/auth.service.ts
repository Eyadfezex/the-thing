import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from "../config/auth.config";

/**
 * Custom error class for handling authentication-related errors
 * Used to distinguish authentication failures from other types of errors
 */
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Registers a new user in the system
 * @param userData Object containing user registration details
 * @param userData.name User's display name (must be unique)
 * @param userData.email User's email address (must be unique)
 * @param userData.password User's password in plain text (will be hashed before storage)
 * @returns {Promise<{accessToken: string, refreshToken: string, user: {id: string, name: string, email: string}}>}
 * Object containing JWT tokens (access and refresh) and basic user data
 * @throws ValidationError if required fields are missing, empty, or contain only whitespace
 * @throws AuthenticationError if user with same email or username already exists
 * @throws Error for any database operations or other unexpected errors
 */
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const { name, email, password } = userData;

    // Check if a user with the provided email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });

    if (existingUser) {
      throw new AuthenticationError(
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user
      .create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
        },
      })
      .catch((error) => {
        throw new Error(`Database error: ${error.message}`);
      });

    // Generate new refresh token with longer expiry
    const refreshToken = jwt.sign(
      { userId: newUser.id, tokenType: "refresh" },
      JWT_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN, // Refresh token valid for 7 days
      }
    );

    const accessToken = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    return { accessToken, refreshToken, user: safeUser };
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(
      `Registration failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Signs in an existing user with their credentials
 * @param credentials Object containing user sign in credentials
 * @param credentials.email User's email address (case-insensitive)
 * @param credentials.password User's password in plain text
 * @returns {Promise<{accessToken: string, refreshToken: string, user: {id: string, name: string, email: string}}>}
 * Object containing JWT tokens (access and refresh) and basic user data
 * @throws ValidationError if email or password are missing, empty, or contain only whitespace
 * @throws AuthenticationError if user is not found or password is incorrect
 * @throws Error for any database operations or other unexpected errors
 */
export const signIn = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user
      .findUnique({
        where: { email: email.toLowerCase() },
      })
      .catch((error) => {
        throw new Error(`Database error: ${error.message}`);
      });

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      user.passwordHash || ""
    );

    if (!isValidPassword) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate new refresh token with longer expiry
    const refreshToken = jwt.sign(
      { userId: user.id, tokenType: "refresh" },
      JWT_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN, // Refresh token valid for 7 days
      }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    return { accessToken, refreshToken, user: safeUser };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(
      `Authentication failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Refreshes an existing JWT access token and generates a new refresh token
 * @param token Current JWT refresh token to verify and use for generating new tokens
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Object containing new access and refresh tokens
 * @throws AuthenticationError if token is invalid, expired, or the associated user no longer exists
 * @throws Error for any database operations or other unexpected errors
 * @remarks This function should be called before the access token expires to maintain continuous authentication
 */
export const refreshAccessToken = async (token: string) => {
  try {
    // Verify the existing token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      tokenType: string;
    };

    // Get fresh user data
    const user = await prisma.user
      .findUnique({
        where: { id: decoded.userId },
      })
      .catch((error) => {
        throw new Error(`Database error: ${error.message}`);
      });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Generate new refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, tokenType: "refresh" },
      JWT_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN, // Refresh token valid for 7 days
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError("Invalid refresh token");
    }
    throw new Error(
      `Token refresh failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
