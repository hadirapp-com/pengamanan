import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  ArrowRight,
  RefreshCw,
  SquareUser,
  Printer,
} from "lucide-react";
import { useQueryService } from "@/lib/react-query";
import { customerEndpoint, partsEndpoint } from "@/config/endpoints";
import UiContainer from "@/components/ui/layout/ui-container";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function ProductionDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: partsData, isLoading: partsLoading } = useQueryService(
    partsEndpoint.root,
    { limit: 1 },
    { queryKey: ["dashboard-parts"] }
  );

  const { data: customerData, isLoading: customerLoading } = useQueryService(
    customerEndpoint.root,
    { limit: 1 },
    { queryKey: ["dashboard-customers"] }
  );

  const totalParts = partsData?.pagination?.total || 0;
  const totalCustomers = customerData?.pagination?.total || 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-parts"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-customers"] });
  };

  const productionQuickActions = [
    {
      title: "View Parts",
      description: "Browse and manage parts",
      icon: Package,
      onClick: () => navigate("/app/parts"),
    },
    {
      title: "Print History",
      description: "View print records",
      icon: Printer,
      onClick: () => navigate("/app/parts-print-history"),
    },
  ];

  return (
    <UiContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Production Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome to your production dashboard. Quick access to parts and
              printing tools.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={partsLoading || customerLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                partsLoading || customerLoading ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            onClick={() => navigate("/app/parts")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Parts
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partsLoading ? "..." : totalParts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All parts in the system
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            onClick={() => navigate("/app/customer")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50">
                <SquareUser className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerLoading ? "..." : totalCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {productionQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
                onClick={action.onClick}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Status</span>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-600 font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Sync</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </UiContainer>
  );
}
