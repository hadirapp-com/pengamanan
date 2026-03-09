import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Package,
  Building2,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Truck,
  SquareUser,
} from "lucide-react";
import { useQueryService } from "@/lib/react-query";
import {
  userEndpoint,
  deliveryEndpoint,
  customerEndpoint,
} from "@/config/endpoints";
import UiContainer from "@/components/ui/layout/ui-container";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch counts for dashboard statistics
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQueryService(
    userEndpoint.root,
    { limit: 1 }, // Just get pagination info
    { queryKey: ["dashboard-users"] }
  );

  const {
    data: deliveryData,
    isLoading: deliveryLoading,
    error: deliveryError,
  } = useQueryService(
    deliveryEndpoint.root,
    { limit: 1 }, // Just get pagination info
    { queryKey: ["dashboard-deliveries"] }
  );

  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError,
  } = useQueryService(
    customerEndpoint.root,
    { limit: 1 }, // Just get pagination info
    { queryKey: ["dashboard-customers"] }
  );

  // Extract total counts from pagination
  const totalUsers = userData?.pagination?.total || 0;
  const totalDeliveries = deliveryData?.pagination?.total || 0;
  const totalCustomers = customerData?.pagination?.total || 0;

  // Check if any queries have errors
  const hasErrors = userError || deliveryError || customerError;

  const getStatValue = (loading: boolean, value: number, error: unknown) => {
    if (loading) return "...";
    if (error) return "Error";
    return value.toLocaleString();
  };

  const handleRefresh = () => {
    // Invalidate and refetch all dashboard queries
    queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-customers"] });
  };

  const stats = [
    {
      title: "Total Users",
      value: getStatValue(userLoading, totalUsers, userError),
      description: "Registered users in the system",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => navigate("/app/user"),
      hasError: !!userError,
    },
    {
      title: "Total Deliveries",
      value: getStatValue(deliveryLoading, totalDeliveries, deliveryError),
      description: "Total delivery records",
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => navigate("/app/delivery"),
      hasError: !!deliveryError,
    },
    {
      title: "Total Customers",
      value: getStatValue(customerLoading, totalCustomers, customerError),
      description: "Active customers",
      icon: SquareUser,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => navigate("/app/customer"),
      hasError: !!customerError,
    },
    {
      title: "Recent Activity",
      value: "Active",
      description: "System status",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const quickActions = [
    {
      title: "View Deliveries",
      icon: Package,
      onClick: () => navigate("/app/delivery"),
    },
    {
      title: "Manage Customers",
      icon: Building2,
      onClick: () => navigate("/app/customer"),
    },
    {
      title: "User Management",
      icon: Users,
      onClick: () => navigate("/app/user"),
    },
  ];

  return (
    <UiContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your Pokayoke management dashboard. Here's an overview
              of your system.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={userLoading || deliveryLoading || customerLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                userLoading || deliveryLoading || customerLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Error Alert */}
        {hasErrors && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">
                  Some data could not be loaded. Please refresh the page or try
                  again later.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`hover:shadow-md transition-shadow ${
                  stat.onClick ? "cursor-pointer hover:bg-muted/50" : ""
                } ${stat.hasError ? "border-red-200 bg-red-50" : ""}`}
                onClick={stat.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      stat.hasError ? "text-red-600" : ""
                    }`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.title}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={action.onClick}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{action.title}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>Current system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-green-600 font-medium">
                  Online
                </span>
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

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Recent Updates</CardTitle>
              <CardDescription>Latest system changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">Column Toggle Feature</div>
                <div className="text-muted-foreground">
                  Added column visibility controls
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Import Functionality</div>
                <div className="text-muted-foreground">
                  Enhanced file import system
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Dashboard Overview</div>
                <div className="text-muted-foreground">
                  New statistics dashboard
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              System activity and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Chart visualization coming soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Activity charts and analytics will be displayed here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UiContainer>
  );
}
