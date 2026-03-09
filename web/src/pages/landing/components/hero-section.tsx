import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, Home } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration is complete on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="w-full py-8 md:py-16 lg:py-24 xl:py-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <Badge className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs md:text-sm">
                Admin Panel untuk Mobile Scanner
              </Badge>
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none">
                Kelola Data <span className="text-blue-600">Pokayoke Scanner</span> dengan Mudah
              </h1>
              <p className="max-w-[600px] text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed">
                Platform pokayoke & barcode system yang powerful untuk mengelola data, penerimaan barang, pergerakan barang dan pengiriman barang, customer, dan user dari aplikasi mobile 
                Pokayoke scanner. Monitor dan kontrol semua aktivitas scanning dari satu dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              {isClient && isHydrated && isAuthenticated ? (
                <Link to="/app">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                    Login Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="text-sm md:text-base bg-transparent"
                onClick={() => scrollToSection('demo')}
              >
                Lihat Demo
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                <span>Multi-user access</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center mt-6 lg:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg transform rotate-3"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <QrCode className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">Pokayoke HadirApp</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Deliveries</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Customers</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today's Scans</span>
                    <span className="font-semibold text-green-600">156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 