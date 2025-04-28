import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // API endpoint to search students by name
  apiRouter.get("/search", async (req: Request, res: Response) => {
    try {
      const querySchema = z.object({
        q: z.string().min(1).max(100),
        limit: z.coerce.number().optional().default(20),
      });
      
      const { q, limit } = querySchema.parse(req.query);
      
      const results = await storage.searchStudentsByName(q, limit);
      
      res.json({ results });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ error: "An error occurred while searching students" });
      }
    }
  });
  
  // API endpoint to get student details by index number
  apiRouter.get("/students/:indexNumber", async (req: Request, res: Response) => {
    try {
      const { indexNumber } = req.params;
      
      const student = await storage.getStudentByIndex(indexNumber);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json({ student });
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ error: "An error occurred while fetching student details" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
