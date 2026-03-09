import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function CTASection() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration is complete on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="w-full py-8 md:py-16 lg:py-24 xl:py-32 bg-blue-600 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl text-white">
              Pokayoke? atau Barcode/ QR Code System untuk melengkapi ERP?
            </h2>
            <p className="max-w-full text-blue-100 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed">
              Pokayoke HadirApp dapat menjadi tools Pokayoke untuk memastikan
              barang yang dikirim sesuai dengan permintaan konsumen juga
              Pokayoke ini dapat menjadi pelengkap ERP untuk mengimplementasikan
              Barcode System untuk memantau pergerakan barang, baik incoming,
              movement dan delivery.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-[400px]:flex-row">
            {isClient && isHydrated && isAuthenticated ? (
              <Link to="/app">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-sm md:text-base"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-sm md:text-base"
                >
                  Login Admin
                </Button>
              </Link>
            )}
            <Link to="https://wa.me/6281320706982?text=hi%20saya%20tertarik%20dengan%20Pokayoke%20HadirApp">
              <Button
                variant="outline"
                size="lg"
                className="text-blue-600 border-white hover:bg-white hover:text-blue-600 text-sm md:text-base"
              >
                Whatsapp Kami
              </Button>
            </Link>
          </div>
          <p className="text-xs md:text-sm text-blue-100">
            Pokayoke • Barcode System • Akses real-time • Multi-user • Secure
            authentication
          </p>
        </div>
      </div>
    </section>
  );
}
