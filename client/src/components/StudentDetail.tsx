import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";

interface StudentDetailProps {
  indexNumber: string | null;
}

export default function StudentDetail({ indexNumber }: StudentDetailProps) {
  // Fetch student data when index number is provided
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/students", indexNumber],
    enabled: !!indexNumber,
    queryFn: async () => {
      if (!indexNumber) return null;
      const res = await fetch(`/api/students/${indexNumber}`);
      if (!res.ok) {
        throw new Error("Failed to fetch student details");
      }
      return res.json();
    }
  });

  const student: Student | undefined = data?.student;
  
  // Get badge color based on grade
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'S':
        return 'bg-purple-100 text-purple-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Initial empty state
  if (!indexNumber) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Search for student records</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Enter a student's name in the search box above to view their detailed examination results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="animate-pulse flex justify-center mb-4">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
            </div>
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Unable to load student details</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-4">
              There was a problem fetching the requested student information.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If student not found
  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Student not found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find a student with the provided information. Please try searching again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loaded student detail view
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div>
        <div className="bg-gradient-to-r from-primary to-secondary px-4 py-5 sm:p-6 text-white">
          <div className="md:flex md:justify-between md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <div className="mt-1 flex flex-col md:flex-row md:items-center text-sm md:space-x-4">
                <div className="mb-1 md:mb-0">
                  <span className="font-medium">Index Number:</span>
                  <span className="ml-1">{student.index_number}</span>
                </div>
                <div>
                  <span className="font-medium">NIC:</span>
                  <span className="ml-1">{student.nic_number}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                <span className="font-medium mr-1">Z-Score:</span>
                <span>{student.z_score}</span>
              </div>
              <div className="mt-2 text-sm grid grid-cols-2 gap-x-4">
                <div>
                  <span className="font-medium">District Rank:</span>
                  <span className="ml-1">{student.district_rank}</span>
                </div>
                <div>
                  <span className="font-medium">Island Rank:</span>
                  <span className="ml-1">{student.island_rank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(student.subjects as Record<string, string>).map(([subject, grade], i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBadgeColor(grade)}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
