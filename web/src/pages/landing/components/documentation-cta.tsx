import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function DocumentationCTA() {
  return (
    <section id="dokumentasi" className="w-full py-16 md:py-24" style={{ backgroundColor: '#00469b' }}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="p-4 bg-white/20 rounded-full">
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
            Butuh Panduan?
          </h2>

          <p className="text-blue-50 md:text-xl">
            Pelajari cara menggunakan sistem Pokayoke, mulai dari login, manajemen parts,
            monitoring scan, hingga konfigurasi sistem. Dokumentasi lengkap tersedia untuk membantu Anda.
          </p>

          <Link to="/dokumentasi">
            <Button size="lg" variant="secondary" className="mt-4">
              Lihat Dokumentasi
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
