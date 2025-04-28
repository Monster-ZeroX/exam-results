import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce function for search input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Get initials from a name
export function getInitials(name: string): string {
  if (!name) return '';
  
  // Split the name by spaces and get first and last words
  const nameParts = name.split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) return '';
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  
  // Get first letter of first and last parts
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  
  return (firstInitial + lastInitial).toUpperCase();
}

// Function to get color for avatar based on name
export function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
  ];
  
  // Simple hash function to get consistent color for the same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get a positive index within the range of colors
  const index = Math.abs(hash % colors.length);
  
  return colors[index];
}
