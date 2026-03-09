import { QrCode } from "lucide-react";
import { Link } from "react-router";

export default function SimpleFooter() {
  return (
    <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5" style={{ color: '#00469b' }} />
        <span className="font-bold text-sm">Pokayoke</span>
      </div>
      <p className="text-xs text-gray-600 sm:ml-4 text-center sm:text-left">
        ©2025 Pokayoke. Internal Application | powered by hadirapp.com
      </p>
      <nav className="sm:ml-auto flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
        <Link to="/dokumentasi" className="text-xs hover:underline underline-offset-4" style={{ color: '#00469b' }}>
          Dokumentasi
        </Link>
        <Link to="https://wa.me/6281320706982" className="text-xs hover:underline underline-offset-4" style={{ color: '#00469b' }}>
          Support
        </Link>
      </nav>
    </footer>
  );
}
