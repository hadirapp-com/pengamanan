import type { ValidationErrorItem } from "@/types/error";
import type { UseFormSetError, Path } from "react-hook-form";

/**
 * Handles validation errors from server and sets them on the form
 * @param errors - Array of validation error items from server
 * @param setError - React Hook Form's setError function
 * 
 * @example
 * ```typescript
 * // Server response example:
 * {
 *   "message": "validation_error",
 *   "error": [
 *     {
 *       "origin": "string",
 *       "code": "too_small",
 *       "minimum": 6,
 *       "inclusive": true,
 *       "path": ["password"],
 *       "message": "Password must be at least 6 characters"
 *     }
 *   ]
 * }
 * 
 * // Usage in form:
 * onError: (error: AxiosError<{ message: string }>) => {
 *   const validationErrors = extractValidationErrors(error.response?.data);
 *   
 *   if (validationErrors) {
 *     handleValidationErrors(validationErrors, setError);
 *     toast.error("Please fix the validation errors below");
 *   } else {
 *     toast.error(error.response?.data.message ?? "An error occurred");
 *   }
 * }
 * ```
 */
export const handleValidationErrors = <T extends Record<string, unknown>>(
  errors: ValidationErrorItem[],
  setError: UseFormSetError<T>
) => {
  errors.forEach((error) => {
    // Get the field name from the path array
    const fieldName = error.path[0];
    
    if (fieldName && typeof fieldName === 'string') {
      setError(fieldName as Path<T>, {
        type: "server",
        message: error.message,
      });
    }
  });
};

/**
 * Checks if the error response contains validation errors
 * @param error - The error response from the server
 * @returns true if it's a validation error, false otherwise
 */
export const isValidationError = (error: unknown): error is { message: "validation_error"; error: ValidationErrorItem[] } => {
  return typeof error === 'object' && error !== null && 'message' in error && error.message === "validation_error" && 'error' in error && Array.isArray(error.error);
};

/**
 * Extracts validation errors from an API error response
 * @param error - The error response from the server
 * @returns Array of validation errors or null if not a validation error
 */
export const extractValidationErrors = (error: unknown): ValidationErrorItem[] | null => {
  if (isValidationError(error)) {
    return error.error;
  }
  
  // Handle case where error might be nested in response data
  if (typeof error === 'object' && error !== null && 'response' in error && 
      typeof error.response === 'object' && error.response !== null && 'data' in error.response &&
      isValidationError(error.response.data)) {
    return error.response.data.error;
  }
  
  return null;
}; 