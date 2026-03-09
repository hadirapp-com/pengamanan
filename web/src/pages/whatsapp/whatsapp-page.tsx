import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";
import UiContainer from "@/components/ui/layout/ui-container";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  LucidePhone,
} from "lucide-react";

interface WhatsAppStatusResponse {
  status: number;
  code: string;
  message: string;
  results: {
    is_connected: boolean;
    is_logged_in: boolean;
    device_id: string;
  };
}

interface SendMessageResponse {
  code: string;
  message: string;
  results: {
    verified_name: string;
    status: string;
    picture_id: string;
    devices: Array<{
      User: string;
      Agent: number;
      Device: string;
      Server: string;
      AD: boolean;
    }>;
  };
}

export function WhatsAppPage() {
  const [sendLoading, setSendLoading] = useState(false);

  const [messageForm, setMessageForm] = useState({
    phone: "",
    message: "",
    device_id: "",
    reply_message_id: "",
    is_forwarded: false,
    duration: 0,
    mentions: [] as string[],
  });

  // Fetch WhatsApp status from API
  const {
    data: status,
    isLoading: statusLoading,
    refetch: checkStatus,
  } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<WhatsAppStatusResponse>("/whatsapp/status");
      return response.data.results;
    },
    retry: false,
  });

  const getWhatsappNumber = (jid: string) => {
    if (!jid) return "";
    return jid.split(":")[0];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status?.is_connected || !status?.is_logged_in) {
      toast.error("WhatsApp is not connected. Please check the status.");
      return;
    }

    if (!messageForm.phone.trim() || !messageForm.message.trim()) {
      toast.error("Phone and message are required");
      return;
    }

    setSendLoading(true);

    try {
      const payload = {
        phone: messageForm.phone,
        message: messageForm.message,
        device_id: messageForm.device_id,
        ...(messageForm.reply_message_id && {
          reply_message_id: messageForm.reply_message_id,
        }),
        is_forwarded: messageForm.is_forwarded,
        duration: messageForm.duration,
        ...(messageForm.mentions.length > 0 && {
          mentions: messageForm.mentions,
        }),
      };

      const response = await axiosInstance.post<SendMessageResponse>(
        "/whatsapp/send-message",
        payload,
      );

      const data = response.data;

      if (data.code === "SUCCESS") {
        toast.success("Message sent successfully!");
        setMessageForm({
          phone: "",
          message: "",
          device_id: "",
          reply_message_id: "",
          is_forwarded: false,
          duration: 86400,
          mentions: [],
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <UiContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between space-y-">
          <div className="flex flex-col items-start gap-2">
            <h2 className="lg:text-xl text-lg font-semibold tracking-tight">
              WhatsApp Management
            </h2>
            <p>Monitor WhatsApp connection status and send test messages</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkStatus()}
            disabled={statusLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${statusLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh Status</span>
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Current WhatsApp service connection information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      Connection Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {status.is_connected ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {status.is_connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      Login Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {status.is_logged_in ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {status.is_logged_in ? "Logged In" : "Not Logged In"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      Phone Number
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {status.is_logged_in ? (
                        <>
                          <LucidePhone className="h-4 w-4 text-green-600" />
                          {getWhatsappNumber(status.device_id)}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Send Message Card */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
            <CardDescription>
              Send a test message to verify WhatsApp functionality
              {(!status?.is_connected || !status?.is_logged_in) && (
                <span className="text-orange-600 block mt-1">
                  ⚠️ WhatsApp must be connected and logged in to send messages
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="e.g., 6289685028129"
                  value={messageForm.phone}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, phone: e.target.value })
                  }
                  disabled={!status?.is_connected || !status?.is_logged_in}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter phone number with country code
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      message: e.target.value,
                    })
                  }
                  disabled={!status?.is_connected || !status?.is_logged_in}
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reply_message_id">
                  Reply to Message ID (Optional)
                </Label>
                <Input
                  id="reply_message_id"
                  type="text"
                  placeholder="e.g., 3EB089B9D6ADD58153C561"
                  value={messageForm.reply_message_id}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      reply_message_id: e.target.value,
                    })
                  }
                  disabled={!status?.is_connected || !status?.is_logged_in}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={messageForm.duration.toString()}
                  onValueChange={(value) =>
                    setMessageForm({
                      ...messageForm,
                      duration: parseInt(value),
                    })
                  }
                  disabled={!status?.is_connected || !status?.is_logged_in}
                >
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No expiry</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                    <SelectItem value="604800">7 days</SelectItem>
                    <SelectItem value="7776000">90 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Message expiration duration (default: 24 hours)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_forwarded"
                  checked={messageForm.is_forwarded}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      is_forwarded: e.target.checked,
                    })
                  }
                  disabled={!status?.is_connected || !status?.is_logged_in}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_forwarded" className="cursor-pointer">
                  Mark as forwarded
                </Label>
              </div>

              <Button
                type="submit"
                disabled={
                  sendLoading || !status?.is_connected || !status?.is_logged_in
                }
                className="w-full"
              >
                {sendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UiContainer>
  );
}
