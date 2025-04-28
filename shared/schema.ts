import { pgTable, text, serial, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Student model based on the JSONL data structure
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  index_number: text("index_number").notNull().unique(),
  name: text("name").notNull(),
  z_score: text("z_score").notNull(),
  district_rank: text("district_rank").notNull(),
  island_rank: text("island_rank").notNull(),
  nic_number: text("nic_number").notNull(),
  subjects: jsonb("subjects").notNull(),
});

// Create insert schema for student record validation
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

// User model (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types for database operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Search response type for suggestions
export type SearchSuggestion = {
  index_number: string;
  name: string;
};
