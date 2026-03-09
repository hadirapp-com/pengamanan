import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function SimpleHeader() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <Link to="/" className="flex items-center justify-center">
        <QrCode className="h-6 w-6" style={{ color: '#00469b' }} />
        <span className="ml-2 text-lg font-bold text-gray-900">Pokayoke</span>
      </Link>

      <nav className="ml-auto hidden md:flex gap-6">
        <Link
          to="/dokumentasi"
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: '#00469b' }}
        >
          Dokumentasi
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {isClient && isHydrated && isAuthenticated ? (
          <Link to="/app">
            <Button size="sm" style={{ backgroundColor: '#00469b' }}>
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="sm" style={{ backgroundColor: '#00469b' }}>
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
