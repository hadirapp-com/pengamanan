import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { ContentfulStatusCode } from "hono/utils/http-status";

const whatsapp = new Hono();

// Get WhatsApp service URL and basic auth from environment variables
const WHATSAPP_SERVICE = process.env.WHATSAPP_SERVICE || "http://localhost:3001";
const WHATSAPP_BASIC_AUTH = process.env.WHATSAPP_BASIC_AUTH || "";

// Apply auth middleware to all routes
whatsapp.use("*", authMiddleware);

// GET /whatsapp/status - Get WhatsApp connection status
// Accessible by all authenticated users
whatsapp.get("/status", async (c) => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add basic auth if configured
    if (WHATSAPP_BASIC_AUTH) {
      headers["Authorization"] = `Basic ${WHATSAPP_BASIC_AUTH}`;
    }

    const response = await fetch(`${WHATSAPP_SERVICE}/app/status`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return c.json(
        { error: "Failed to connect to WhatsApp service" },
        response.status as ContentfulStatusCode
      );
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching WhatsApp status:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /whatsapp/devices/:device_id - Get device information
// Accessible by all authenticated users
whatsapp.get("/devices/:device_id", async (c) => {
  try {
    const deviceId = c.req.param("device_id");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add basic auth if configured
    if (WHATSAPP_BASIC_AUTH) {
      headers["Authorization"] = `Basic ${WHATSAPP_BASIC_AUTH}`;
      headers["X-Device-Id"] = deviceId
    }

    const response = await fetch(
      `${WHATSAPP_SERVICE}/devices/${deviceId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      return c.json(
        { error: "Failed to fetch device information" },
        response.status as ContentfulStatusCode
      );
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching device information:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Schema for sending messages
const sendMessageSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message is required"),
  reply_message_id: z.string().optional(),
  is_forwarded: z.boolean().optional().default(false),
  duration: z
    .number()
    .int()
    .nonnegative()
    .refine((val) => [0, 86400, 604800, 7776000].includes(val), {
      message:
        "Duration must be one of: 0 (no expiry), 86400 (24h), 604800 (7d), 7776000 (90d)",
    })
    .optional()
    .default(0),
  mentions: z.array(z.string()).optional().default([]),
});

// POST /whatsapp/send-message - Send a WhatsApp message
// Only accessible by admin role
whatsapp.post(
  "/send-message",
  roleValidationMiddleware(["admin"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const validatedData = sendMessageSchema.parse(body);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add basic auth if configured
      if (WHATSAPP_BASIC_AUTH) {
        headers["Authorization"] = `Basic ${WHATSAPP_BASIC_AUTH}`;
      }

      // Add x-device-id header for v8
      // headers["x-device-id"] = validatedData.device_id;

      const payload = {
        phone: validatedData.phone,
        message: validatedData.message,
        ...(validatedData.reply_message_id && {
          reply_message_id: validatedData.reply_message_id,
        }),
        is_forwarded: validatedData.is_forwarded,
        duration: validatedData.duration,
        ...(validatedData.mentions && validatedData.mentions.length > 0 && {
          mentions: validatedData.mentions,
        }),
      };

      const response = await fetch(`${WHATSAPP_SERVICE}/send/message`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return c.json(
          { error: "Failed to send message via WhatsApp service" },
          response.status as ContentfulStatusCode
        );
      }

      const data = await response.json();
      return c.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: error.issues[0].message }, 400);
      }
      console.error("Error sending WhatsApp message:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export { whatsapp };
