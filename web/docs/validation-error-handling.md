# Validation Error Handling

This document explains how to handle server-side validation errors in forms using the built-in error handling utilities.

## Overview

The validation error handling system provides a consistent way to handle server-side validation errors and display them on form fields. It supports the standard validation error format returned by the server.

## Server Error Format

The server returns validation errors in the following format:

```json
{
  "message": "validation_error",
  "error": [
    {
      "origin": "string",
      "code": "too_small",
      "minimum": 6,
      "inclusive": true,
      "path": ["password"],
      "message": "Password must be at least 6 characters"
    },
    {
      "origin": "string", 
      "code": "invalid_string",
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

## TypeScript Types

The error types are defined in `src/types/error.ts`:

```typescript
export type ValidationErrorItem = {
  origin: string;
  code: string;
  minimum?: number;
  maximum?: number;
  inclusive?: boolean;
  path: string[];
  message: string;
};

export type ValidationErrorResponse = {
  message: "validation_error";
  error: ValidationErrorItem[];
};

export type ApiErrorResponse = {
  message: string;
  error?: ValidationErrorItem[];
};
```

## Usage

### 1. Import the utilities

```typescript
import { extractValidationErrors, handleValidationErrors } from "@/lib/error-handler";
```

### 2. Set up your form with setError

```typescript
const {
  handleSubmit,
  control,
  reset,
  setValue,
  setError, // Make sure to include setError
  formState: { errors },
} = useForm<YourFormType>({
  resolver: zodResolver(yourFormSchema),
});
```

### 3. Handle errors in your mutation

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (data: YourFormType) =>
    axiosInstance<{ message: string }>({ method, data, url }),
  onSuccess: (response) => {
    toast.success(response?.data.message ?? "Success!");
    reset();
    navigate(-1);
  },
  onError: (error: AxiosError<{ message: string }>) => {
    // Check if it's a validation error
    const validationErrors = extractValidationErrors(error.response?.data);
    
    if (validationErrors) {
      // Handle validation errors by setting them on the form
      handleValidationErrors(validationErrors, setError);
      toast.error("Please fix the validation errors below");
    } else {
      // Handle general errors
      toast.error(error.response?.data.message ?? "An error occurred");
    }
  },
});
```

## Complete Example

Here's a complete example of a form component with validation error handling:

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { axiosInstance } from "@/lib/api";
import { extractValidationErrors, handleValidationErrors } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UserForm {
  username: string;
  password: string;
  email: string;
}

const UserFormComponent = () => {
  const form = useForm<UserForm>({
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
    resolver: zodResolver(userFormSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = form;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserForm) =>
      axiosInstance<{ message: string }>({ 
        method: "POST", 
        data, 
        url: "/api/users" 
      }),
    onSuccess: (response) => {
      toast.success(response?.data.message ?? "User created successfully!");
      reset();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const validationErrors = extractValidationErrors(error.response?.data);
      
      if (validationErrors) {
        handleValidationErrors(validationErrors, setError);
        toast.error("Please fix the validation errors below");
      } else {
        toast.error(error.response?.data.message ?? "Failed to create user");
      }
    },
  });

  const onSubmit = (data: UserForm) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage>{errors.username?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage>{errors.password?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage>{errors.email?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
};
```

## How It Works

1. **Error Detection**: The `extractValidationErrors` function checks if the server response contains validation errors by looking for the `"validation_error"` message and an array of error items.

2. **Field Mapping**: The `handleValidationErrors` function maps each validation error to the corresponding form field using the `path` array from the error response.

3. **Form Integration**: Validation errors are set on the form using React Hook Form's `setError` function, which automatically displays them in the form's error messages.

4. **User Feedback**: A toast notification informs the user that there are validation errors to fix.

## Benefits

- **Consistent Error Handling**: All forms use the same error handling pattern
- **Type Safety**: Full TypeScript support with proper type definitions
- **User Experience**: Clear error messages displayed directly on form fields
- **Reusable**: Easy to implement in any form component
- **Maintainable**: Centralized error handling logic

## Error Codes

The system supports various validation error codes that might be returned by the server:

- `too_small` - Field value is too small (with `minimum` and `inclusive` properties)
- `too_big` - Field value is too large (with `maximum` and `inclusive` properties)
- `invalid_string` - Invalid string format (e.g., email, URL)
- `invalid_type` - Wrong data type
- `custom` - Custom validation error

Each error includes a human-readable `message` that will be displayed to the user. 