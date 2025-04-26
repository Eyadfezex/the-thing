const PORT = process.env.PORT || 3001;

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Backend API",
      version: "1.0.0",
      description: "API documentation for the AI Backend",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};
