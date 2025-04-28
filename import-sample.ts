import { db } from './server/db';
import { students } from './shared/schema';

async function importSampleData() {
  try {
    console.log('Importing sample student data...');
    
    // Sample student data from the JSONL file
    const sampleStudents = [
      {
        index_number: "1000012",
        name: "MOHOMED RISHVAN FATHIMA RUMANA",
        z_score: "1.0128",
        district_rank: "1968",
        island_rank: "10177",
        nic_number: "200564002042",
        subjects: { "ECONOMICS": "B", "BUSINESS STUDIES": "C", "ACCOUNTING": "A", "GENERAL ENGLISH": "A" }
      },
      {
        index_number: "1000020",
        name: "MOHOMED HUSSAIN FATHIMA HAMRA",
        z_score: "0.4756",
        district_rank: "3428",
        island_rank: "19336",
        nic_number: "200567501829",
        subjects: { "ECONOMICS": "B", "BUSINESS STUDIES": "C", "ACCOUNTING": "C", "GENERAL ENGLISH": "C" }
      },
      {
        index_number: "1000039",
        name: "MOHAMED FAIROOZ ZAINAB",
        z_score: "-0.4218",
        district_rank: "6045",
        island_rank: "36073",
        nic_number: "200572400453",
        subjects: { "ECONOMICS": "S", "BUSINESS STUDIES": "S", "ACCOUNTING": "S", "GENERAL ENGLISH": "C" }
      },
      {
        index_number: "1000047",
        name: "UDAYACHANDRAN SHIVONI",
        z_score: "-",
        district_rank: "-",
        island_rank: "-",
        nic_number: "200575602841",
        subjects: { "ECONOMICS": "F", "BUSINESS STUDIES": "F", "ACCOUNTING": "F", "GENERAL ENGLISH": "S" }
      },
      {
        index_number: "1000055",
        name: "MOHOMMED ISMAIL FATHIMA SUMAIYA",
        z_score: "0.5801",
        district_rank: "1610",
        island_rank: "27233",
        nic_number: "200577400456",
        subjects: { "GEOGRAPHY": "C", "COMMUNI. & MEDIA STUDIES": "C", "SINHALA": "B", "GENERAL ENGLISH": "S" }
      },
      {
        index_number: "1000101",
        name: "MANOKARAN LALANI",
        z_score: "-0.6127",
        district_rank: "-",
        island_rank: "-",
        nic_number: "200568400317",
        subjects: { "GEOGRAPHY": "S", "COMMUNI. & MEDIA STUDIES": "S", "SINHALA": "F", "GENERAL ENGLISH": "F" }
      },
      {
        index_number: "1000098",
        name: "ALAWATHUGE PABODHI BUDDHINI KARUNARATHNA",
        z_score: "0.1837",
        district_rank: "2403",
        island_rank: "39920",
        nic_number: "200572203753",
        subjects: { "GEOGRAPHY": "C", "COMMUNI. & MEDIA STUDIES": "S", "SINHALA": "C", "GENERAL ENGLISH": "S" }
      }
    ];
    
    // Use a transaction to insert all records
    await db.transaction(async (tx) => {
      for (const student of sampleStudents) {
        await tx.insert(students)
          .values(student)
          .onConflictDoUpdate({
            target: students.index_number,
            set: {
              name: student.name,
              z_score: student.z_score,
              district_rank: student.district_rank,
              island_rank: student.island_rank,
              nic_number: student.nic_number,
              subjects: student.subjects
            }
          });
      }
    });
    
    console.log(`Successfully imported ${sampleStudents.length} sample students`);
  } catch (error) {
    console.error('Error importing sample data:', error);
    throw error;
  }
}

// Run the import function
importSampleData().then(() => {
  console.log('Sample data import completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Sample data import failed:', error);
  process.exit(1);
});