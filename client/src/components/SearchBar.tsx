import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SuggestionsList from "./SuggestionsList";
import { SearchSuggestion } from "@shared/schema";
import { debounce } from "@/lib/utils";

interface SearchBarProps {
  onSelectStudent: (student: SearchSuggestion) => void;
}

export default function SearchBar({ onSelectStudent }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const debouncedSearch = debounce((term: string) => {
    if (term.length >= 2) {
      setShowSuggestions(true);
      setShowAllResults(false); // Reset to default limit when typing
    } else {
      setShowSuggestions(false);
    }
  }, 300);

  // Search query using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/search", searchTerm, showAllResults],
    enabled: searchTerm.length >= 2,
    queryFn: async () => {
      // Add the 'all' parameter when showAllResults is true
      const url = `/api/search?q=${encodeURIComponent(searchTerm)}${showAllResults ? '&all=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      return res.json();
    }
  });

  const suggestions: SearchSuggestion[] = data?.results || [];
  const hasResults = suggestions.length > 0;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    onSelectStudent(suggestion);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    setShowAllResults(false);
  };
  
  // Handle form submission (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      setShowAllResults(true);
      setShowSuggestions(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <div className="relative max-w-2xl mx-auto mb-10" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
          placeholder="Type a student name... (Press Enter for more results)"
          aria-label="Search for a student"
          aria-controls="search-suggestions"
          value={searchTerm}
          onChange={handleInputChange}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {searchTerm && (
            <button 
              type="button"
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {isLoading && (
            <div className="ml-2">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <SuggestionsList 
          suggestions={suggestions} 
          isLoading={isLoading}
          error={error}
          hasResults={hasResults}
          onSelectSuggestion={handleSelectSuggestion}
        />
      )}
    </div>
  );
}
