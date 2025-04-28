import { createReadStream } from 'fs';
import { readFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { db } from './server/db';
import { students } from './shared/schema';

async function importData() {
  try {
    console.log('Starting data import process...');
    
    // Path to the JSONL file
    const filePath = './attached_assets/allresults.jsonl';
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    
    let totalRecords = 0;
    let successfulInserts = 0;
    let failedInserts = 0;
    
    console.log('Processing data...');
    
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
        
        // Insert the record into the database
        await db.insert(students)
          .values(transformedData)
          .onConflictDoUpdate({
            target: students.index_number,
            set: {
              name: transformedData.name,
              z_score: transformedData.z_score,
              district_rank: transformedData.district_rank,
              island_rank: transformedData.island_rank,
              nic_number: transformedData.nic_number,
              subjects: transformedData.subjects
            }
          });
        
        successfulInserts++;
        
        // Log progress every 100 records
        if (totalRecords % 100 === 0) {
          console.log(`Processed ${totalRecords} records (${successfulInserts} successful, ${failedInserts} failed)`);
        }
      } catch (error) {
        failedInserts++;
        console.error(`Error importing record #${totalRecords}:`, error);
      }
    }
    
    console.log(`Import completed. Total: ${totalRecords}, Successful: ${successfulInserts}, Failed: ${failedInserts}`);
  } catch (error) {
    console.error('Error during data import:', error);
  }
}

// Run the import function
importData().then(() => {
  console.log('Import process finished');
  process.exit(0);
}).catch((error) => {
  console.error('Import process failed:', error);
  process.exit(1);
});