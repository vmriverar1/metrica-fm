/**
 * Utilities for handling form inputs safely
 */

/**
 * Safely parses a number input value, handling edge cases like empty strings,
 * partial decimal inputs, and invalid values.
 * 
 * @param value - The input value from e.target.value
 * @param fallback - Value to return if input is empty (default: 0)
 * @returns The parsed number or fallback value
 */
export const parseNumberInput = (value: string, fallback: number = 0): number => {
  // Handle empty string
  if (value === '' || value === undefined || value === null) {
    return fallback;
  }

  // Handle partial decimal inputs like "1." or ".5"
  if (value === '.' || value === '-') {
    return fallback;
  }

  // Convert to number
  const parsed = Number(value);
  
  // Check if it's a valid number
  if (isNaN(parsed)) {
    return fallback;
  }

  return parsed;
};

/**
 * Creates a safe number input handler for React components
 * 
 * @param onChange - Function to call with the parsed number
 * @param fallback - Fallback value for empty inputs
 * @returns Input change handler
 */
export const createNumberInputHandler = (
  onChange: (value: number) => void, 
  fallback: number = 0
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedValue = parseNumberInput(inputValue, fallback);
    onChange(parsedValue);
  };
};

/**
 * Formats a number for display, removing unnecessary trailing zeros
 * 
 * @param value - Number to format
 * @param decimals - Maximum decimal places (default: 2)
 * @returns Formatted string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  
  return value.toFixed(decimals).replace(/\.?0+$/, '');
};

/**
 * Validates if a string represents a valid number (including decimals)
 * 
 * @param value - String to validate
 * @returns True if valid number
 */
export const isValidNumber = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Allow partial inputs during typing
  if (value === '.' || value === '-' || value === '-.') return true;
  
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

/**
 * Clamps a number within specified bounds
 * 
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clampNumber = (value: number, min?: number, max?: number): number => {
  let result = value;
  
  if (min !== undefined && result < min) {
    result = min;
  }
  
  if (max !== undefined && result > max) {
    result = max;
  }
  
  return result;
};

/**
 * Safe number input props for React inputs
 */
export interface SafeNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  fallback?: number;
}

/**
 * Creates props for a safe number input
 */
export const getSafeNumberInputProps = ({
  value,
  onChange,
  min,
  max,
  step = 'any',
  fallback = 0
}: SafeNumberInputProps) => ({
  type: 'number' as const,
  value: value || fallback,
  min,
  max,
  step,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let parsedValue = parseNumberInput(inputValue, fallback);
    
    // Apply bounds
    if (min !== undefined || max !== undefined) {
      parsedValue = clampNumber(parsedValue, min, max);
    }
    
    onChange(parsedValue);
  }
});