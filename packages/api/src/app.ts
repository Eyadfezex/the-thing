import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "../generated/prisma";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import chatRouter from "./routes/chat.route";
import authRouter from "./routes/auth.route";
import { swaggerOptions } from "./config/swagger.config";
import { AppError } from "./utils/handleError";
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// --- Middlewares ---
app.use(cors()); // Handle cross-origin
app.use(express.json()); // Parse JSON body
app.use(cookieParser());
app.use(morgan("dev")); // HTTP request logger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use("/api", chatRouter);
app.use("/api/auth", authRouter);
// --- Health Check ---
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get("/", (_req, res) => {
  res.send("🧠 AI Backend is running!");
});

// --- 🛠 Global Error Handler ---
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
      success: false,
      message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
});

export default app;
