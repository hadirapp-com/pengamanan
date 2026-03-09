export const configs = {
  key: { tableName: "configs", columnName: "key", dataType: "text" },
  value: { tableName: "configs", columnName: "value", dataType: "text" },
  description: { tableName: "configs", columnName: "description", dataType: "text" },
  createdAt: { tableName: "configs", columnName: "created_at", dataType: "timestamp" },
  updatedAt: { tableName: "configs", columnName: "updated_at", dataType: "timestamp" },
} as const;

// Types based on API response
export type Config = {
  key: string;
  value: any;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConfigInput = {
  key: string;
  value: any;
  description?: string;
};

export type ConfigUpdate = {
  value?: any;
  description?: string;
};

// Validation schemas
export const configFormSchema = {
  key: "",
  value: "",
  description: "",
} as const;

// Helper to format value for display
export const formatConfigValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

// Helper to parse value from input
export const parseConfigValue = (input: string): any => {
  if (!input || input.trim() === "") {
    return null;
  }

  // Try to parse as JSON first
  if (input.startsWith("{") || input.startsWith("[")) {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }

  // Try to parse as number
  if (!isNaN(Number(input)) && input.trim() !== "") {
    return Number(input);
  }

  // Try to parse as boolean
  if (input.toLowerCase() === "true") {
    return true;
  }
  if (input.toLowerCase() === "false") {
    return false;
  }

  // Return as string
  return input;
};
