import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function SimpleHero() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <QrCode className="h-14 w-14" style={{ color: '#00469b' }} />
            <span className="text-4xl md:text-5xl font-bold text-gray-900">Pokayoke</span>
          </div>

          <Badge
            className="text-sm px-4 py-2"
            style={{ backgroundColor: '#dbeafe', color: '#00469b' }}
          >
            Quality Control & Barcode Scanner System
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Sistem Manajemen Gudang &{' '}
            <span style={{ color: '#00469b' }}>Quality Control</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Aplikasi internal untuk mengelola barcode/QR label, monitoring scan real-time,
            tracking pengiriman, dan log scanner. Mendukung multi-customer (HPM & MMKI).
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isClient && isHydrated && isAuthenticated ? (
              <Link to="/app" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base"
                  style={{ backgroundColor: '#00469b' }}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base"
                  style={{ backgroundColor: '#00469b' }}
                >
                  Login
                </Button>
              </Link>
            )}

            <Link to="/dokumentasi" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-base"
              >
                Dokumentasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
