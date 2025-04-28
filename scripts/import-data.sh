#!/bin/bash
# Script to import data into the database

# Check if the data file exists
if [ ! -f "data/allresults.jsonl" ]; then
  echo "Error: data/allresults.jsonl file doesn't exist"
  echo "Please place the data file in the data directory"
  exit 1
fi

# Wait for the database and app to be ready
echo "Waiting for services to be ready..."
sleep 10

# Import the data
echo "Importing data into the database..."
docker-compose exec -T app node -e "
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { db } = require('./server/db');
const { students } = require('./shared/schema');

async function importData() {
  console.log('Starting data import...');
  
  const filePath = path.join(__dirname, 'data', 'allresults.jsonl');
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let count = 0;
  let batch = [];
  
  for await (const line of rl) {
    if (!line.trim()) continue;
    
    try {
      const record = JSON.parse(line);
      
      // Transform the record to match our schema
      const student = {
        index_number: record.index_number,
        name: record.name,
        z_score: record.z_score || '',
        district_rank: record.district_rank || '',
        island_rank: record.island_rank || '',
        nic_number: record.nic_number || '',
        subjects: record.subjects || {}
      };
      
      batch.push(student);
      count++;
      
      // Process in batches of 1000
      if (batch.length >= 1000) {
        try {
          await db.insert(students).values(batch).onConflictDoNothing();
          console.log(\`Imported \${count} records...\`);
          batch = [];
        } catch (err) {
          console.error('Error inserting batch:', err);
        }
      }
    } catch (err) {
      console.error('Error processing line:', err);
    }
  }
  
  // Insert any remaining records
  if (batch.length > 0) {
    try {
      await db.insert(students).values(batch).onConflictDoNothing();
    } catch (err) {
      console.error('Error inserting final batch:', err);
    }
  }
  
  console.log(\`Import completed. Total records: \${count}\`);
}

importData().then(() => {
  console.log('Import script finished');
  process.exit(0);
}).catch(err => {
  console.error('Import script failed:', err);
  process.exit(1);
});
"

echo "Import script execution complete."