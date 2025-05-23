import { eq, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  students, 
  type Student, 
  type InsertStudent,
  users, 
  type User, 
  type InsertUser,
  type SearchSuggestion
} from "@shared/schema";

// Extended storage interface with student-related methods
export interface IStorage {
  // User methods (keeping the existing ones)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student methods
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentByIndex(indexNumber: string): Promise<Student | undefined>;
  searchStudentsByName(query: string, limit?: number): Promise<SearchSuggestion[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Student methods implementation
  async createStudent(student: InsertStudent): Promise<Student> {
    const [result] = await db
      .insert(students)
      .values(student)
      .returning();
    return result;
  }

  async getStudentByIndex(indexNumber: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.index_number, indexNumber));
    return student || undefined;
  }

  async searchStudentsByName(query: string, limit: number = 20): Promise<SearchSuggestion[]> {
    // Split the query into individual words for flexible search
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length >= 2);
    
    if (searchTerms.length === 0) {
      return [];
    }
    
    // Build a dynamic query using SQL
    // This will search for each word separately and combine the results
    let whereClause = sql``;
    
    // For each search term, create a condition and join with OR
    searchTerms.forEach((term, index) => {
      if (index === 0) {
        whereClause = sql`${students.name} ILIKE ${'%' + term + '%'}`;
      } else {
        whereClause = sql`${whereClause} AND ${students.name} ILIKE ${'%' + term + '%'}`;
      }
    });
    
    const results = await db
      .select({
        index_number: students.index_number,
        name: students.name,
      })
      .from(students)
      .where(whereClause)
      .limit(limit);
    
    return results;
  }
}

export const storage = new DatabaseStorage();
