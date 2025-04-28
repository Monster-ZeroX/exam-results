import { Pool } from 'pg';
import fs from 'fs';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Get database connection string from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create database client
const pool = new Pool({ connectionString: databaseUrl });

// Function to connect to the database
async function connectToDatabase() {
  const client = await pool.connect();
  console.log('Connected to the database');
  return client;
}

// Function to create the students table if it doesn't exist
async function createStudentsTable(client) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        index_number VARCHAR(20) NOT NULL UNIQUE,
        name TEXT NOT NULL,
        z_score TEXT NOT NULL,
        district_rank TEXT NOT NULL,
        island_rank TEXT NOT NULL,
        nic_number VARCHAR(20) NOT NULL,
        subjects JSONB NOT NULL
      );
    `);
    console.log('Students table created or already exists');
    
    // Install the pg_trgm extension if it doesn't exist
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);
    console.log('pg_trgm extension created or already exists');
    
    // Create index for fast text search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING gin (name gin_trgm_ops);
    `);
    console.log('Text search index created or already exists');
  } catch (error) {
    console.error('Error creating students table:', error);
    throw error;
  }
}

// Function to process the JSONL file and insert data into the database
async function importData(client, filePath) {
  console.log(`Importing data from ${filePath}`);
  
  let totalRecords = 0;
  let successfulInserts = 0;
  let failedInserts = 0;
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  
  console.log('Starting import...');
  
  for await (const line of rl) {
    try {
      totalRecords++;
      
      // Parse the JSON line
      const studentData = JSON.parse(line);
      
      // Transform data to match our schema
      const transformedData = {
        index_number: studentData['Index Number'],
        name: studentData['Name'],
        z_score: studentData['Z-Score'] || '-',
        district_rank: studentData['District Rank'] || '-',
        island_rank: studentData['Island Rank'] || '-',
        nic_number: studentData['NIC Number'] || '-', 
        subjects: studentData['Subjects'] || {}
      };
      
      // Insert data with conflict handling (update on conflict)
      const query = `
        INSERT INTO students 
          (index_number, name, z_score, district_rank, island_rank, nic_number, subjects)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (index_number) DO UPDATE SET
          name = EXCLUDED.name,
          z_score = EXCLUDED.z_score,
          district_rank = EXCLUDED.district_rank,
          island_rank = EXCLUDED.island_rank,
          nic_number = EXCLUDED.nic_number,
          subjects = EXCLUDED.subjects
        RETURNING id;
      `;
      
      const values = [
        transformedData.index_number,
        transformedData.name,
        transformedData.z_score,
        transformedData.district_rank,
        transformedData.island_rank,
        transformedData.nic_number,
        JSON.stringify(transformedData.subjects)
      ];
      
      await client.query(query, values);
      successfulInserts++;
      
      // Log progress every 10000 records
      if (totalRecords % 10000 === 0) {
        console.log(`Processed ${totalRecords} records (${successfulInserts} successful, ${failedInserts} failed)`);
      }
    } catch (error) {
      failedInserts++;
      console.error(`Error importing record #${totalRecords}:`, error);
    }
  }
  
  console.log(`Import completed. Total: ${totalRecords}, Successful: ${successfulInserts}, Failed: ${failedInserts}`);
}

// Main function
async function main() {
  let client;
  
  try {
    const filePath = path.resolve('./data/allresults.jsonl');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Connect to the database
    client = await connectToDatabase();
    
    // Create the students table if it doesn't exist
    await createStudentsTable(client);
    
    // Import data from the JSONL file
    await importData(client, filePath);
    
    console.log('Data import successful');
  } catch (error) {
    console.error('Data import failed:', error);
    process.exit(1);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // End the pool
    await pool.end();
  }
}

// Run the main function
main();