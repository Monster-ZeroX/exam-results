// API utilities for making requests to the backend

// Type for the search response
interface SearchResponse {
  results: {
    index_number: string;
    name: string;
  }[];
}

// Type for the student detail response
interface StudentDetailResponse {
  student: {
    id: number;
    index_number: string;
    name: string;
    z_score: string;
    district_rank: string;
    island_rank: string;
    nic_number: string;
    subjects: Record<string, string>;
  };
}

// Search students by name
export async function searchStudents(query: string): Promise<SearchResponse> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Get student details by index number
export async function getStudentByIndex(indexNumber: string): Promise<StudentDetailResponse> {
  const response = await fetch(`/api/students/${indexNumber}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch student: ${response.statusText}`);
  }
  
  return response.json();
}
