import { Button } from "@/components/ui/button";
import { QrCode, Menu, Home } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function LandingHeader() {
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
    <header className="px-4 lg:px-6 h-14 md:h-16 flex items-center border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <Link to="/" className="flex items-center justify-center">
        <QrCode className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
        <span className="ml-2 text-lg md:text-xl font-bold text-gray-900">Pokayoke</span>
      </Link>
      <nav className="ml-auto hidden md:flex gap-4 lg:gap-6">
        <button 
          onClick={() => scrollToSection('fitur')}
          className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
        >
          Fitur
        </button>
        <button 
          onClick={() => scrollToSection('manfaat')}
          className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
        >
          Manfaat
        </button>
        <button 
          onClick={() => scrollToSection('demo')}
          className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
        >
          Demo
        </button>
        <button 
          onClick={() => scrollToSection('kontak')}
          className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer"
        >
          Kontak
        </button>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {isClient && isHydrated && isAuthenticated ? (
          <Link to="/app">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Login
            </Button>
          </Link>
        )}
        <Button variant="outline" size="icon" className="md:hidden bg-transparent border-gray-300">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
} 