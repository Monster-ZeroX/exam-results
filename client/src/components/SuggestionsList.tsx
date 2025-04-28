import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { SearchSuggestion } from "@shared/schema";
import { getInitials } from "@/lib/utils";

interface SuggestionsListProps {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: Error | null;
  hasResults: boolean;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
}

export default function SuggestionsList({ 
  suggestions, 
  isLoading, 
  error, 
  hasResults, 
  onSelectSuggestion 
}: SuggestionsListProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
    optionRefs.current = suggestions.map(() => null);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!hasResults) return;

      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prevIndex => {
          const newIndex = prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0;
          scrollOptionIntoView(newIndex);
          return newIndex;
        });
      }
      // Up arrow
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prevIndex => {
          const newIndex = prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1;
          scrollOptionIntoView(newIndex);
          return newIndex;
        });
      }
      // Enter key
      else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        onSelectSuggestion(suggestions[activeIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, suggestions, hasResults, onSelectSuggestion]);

  // Scroll the active option into view
  const scrollOptionIntoView = (index: number) => {
    const option = optionRefs.current[index];
    if (option && listRef.current) {
      option.scrollIntoView({ block: 'nearest' });
    }
  };

  // Generate background colors for avatars
  const getAvatarColor = (index: number) => {
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-indigo-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  return (
    <div 
      className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden" 
      role="listbox"
      aria-label="Search suggestions"
    >
      <ul 
        ref={listRef}
        className="max-h-60 overflow-y-auto py-1 text-base" 
        role="presentation"
      >
        {/* Loading state */}
        {isLoading && (
          <div>
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-2 flex items-center space-x-2 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <li className="py-10 text-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Error fetching suggestions</p>
            <p className="text-sm mt-1">Please try again</p>
          </li>
        )}

        {/* No results state */}
        {!isLoading && !error && suggestions.length === 0 && (
          <li className="py-10 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No students found</p>
            <p className="text-sm mt-1">Try using different keywords</p>
          </li>
        )}

        {/* Suggestion items */}
        {!isLoading && !error && suggestions.map((suggestion, index) => (
          <li
            key={suggestion.index_number}
            ref={el => optionRefs.current[index] = el}
            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 ${
              activeIndex === index ? 'bg-gray-100' : ''
            }`}
            role="option"
            tabIndex={-1}
            aria-selected={activeIndex === index}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-8 w-8 ${getAvatarColor(index)} text-white rounded-full flex items-center justify-center`}>
                <span className="text-sm font-medium">{getInitials(suggestion.name)}</span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                <div className="text-xs text-gray-500">Index: {suggestion.index_number}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
