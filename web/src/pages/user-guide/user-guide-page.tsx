import { useState } from "react";
import { FileText, Video, Play, ExternalLink } from "lucide-react";
import UiContainer from "@/components/ui/layout/ui-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Types for user guide data
interface UserGuideItem {
  title: string;
  link: string;
  fileType: "pdf" | "video";
}

interface ConfigResponse {
  result: {
    id: string;
    key: string;
    value: UserGuideItem[] | string;
    description: string;
    allow_delete: boolean;
  };
}

export default function UserGuidePage() {
  const [selectedItem, setSelectedItem] = useState<UserGuideItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch user guides from config API
  const { data: configData, isLoading } = useQuery({
    queryKey: ["config", "USER_GUIDE"],
    queryFn: async () => {
      const response = await axiosInstance.get<ConfigResponse>(
        "/configs/USER_GUIDE"
      );
      return response.data;
    },
  });

  // Extract user guide items from config
  const userGuides: UserGuideItem[] = (() => {
    if (!configData?.result) return [];

    const value = configData.result.value;

    // Handle if value is a string (JSON stringified)
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }

    // Handle if value is already an array
    if (Array.isArray(value)) {
      return value;
    }

    return [];
  })();

  const handleItemClick = (item: UserGuideItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Stop video when modal closes
    setTimeout(() => setSelectedItem(null), 100);
  };

  const handleOpenInNewTab = () => {
    if (selectedItem?.link) {
      window.open(selectedItem.link, "_blank");
    }
  };

  return (
    <UiContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between space-y-">
          <div className="flex flex-col items-start gap-2">
            <h2 className="lg:text-xl text-lg font-semibold tracking-tight">
              User Guide
            </h2>
            <p>
              Browse through our collection of video tutorials and documentation
              to help you get started.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading user guides...</div>
          </div>
        ) : userGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No user guides available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              User guides will appear here once they are added by the
              administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {userGuides.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.fileType === "video" ? (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.fileType === "video"
                        ? "Video Tutorial"
                        : "PDF Document"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.fileType === "video" ? (
                    <Play className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing video or PDF */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-[100vw] max-h-[90vh] w-full h-full flex flex-col sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {selectedItem?.fileType === "video" ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={selectedItem.link}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="h-[70vh] bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={selectedItem?.link}
                  className="w-full h-full border-0"
                  title={selectedItem?.title}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleOpenInNewTab}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </UiContainer>
  );
}
