import { QrCode } from "lucide-react";
import { Link } from "react-router";

export default function LandingFooter() {
  return (
    <footer
      id="kontak"
      className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"
    >
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        <span className="font-bold text-sm md:text-base">Pokayoke</span>
      </div>
      <p className="text-xs md:text-sm text-gray-600 sm:ml-4 text-center sm:text-left">
        ©2025 Pokayoke. Admin Panel untuk Mobile Scanner | power by hadirapp.com.
      </p>
      <nav className="sm:ml-auto flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
        <Link to="#" className="text-xs md:text-sm hover:underline underline-offset-4 text-gray-600">
          Dokumentasi
        </Link>
        <Link to="https://wa.me/6281320706982?text=saya%20membutuhkan%20bantuak%20Pokayoke%20HadirApp" className="text-xs md:text-sm hover:underline underline-offset-4 text-gray-600">
          Support
        </Link>
        <Link to="https://wa.me/6281320706982?text=hi%20saya%20tertarik%20dengan%20Pokayoke%20HadirApp" className="text-xs md:text-sm hover:underline underline-offset-4 text-gray-600">
          Kontak
        </Link>
      </nav>
    </footer>
  );
} 