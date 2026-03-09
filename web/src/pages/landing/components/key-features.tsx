import { Badge } from "@/components/ui/badge";
import { Printer, Barcode, Activity } from "lucide-react";

const features = [
  {
    icon: Barcode,
    title: "Barcode & QR Label",
    description: "Cetak dan kelola label barcode/QR untuk tracking part dan barang",
  },
  {
    icon: Activity,
    title: "Monitoring Scan Real-time",
    description: "Pantau aktivitas scanner, lot tracking, dan status pengiriman secara langsung",
  },
  {
    icon: Printer,
    title: "Multi-Customer Support",
    description: "Dukung multiple customer: HPM, Hino, Toyota, MMKI, Hyundai, ADM, dan lainnya",
  },
];

export default function KeyFeatures() {
  return (
    <section id="fitur" className="w-full py-16 md:py-24 bg-white ">
      <div className="container px-4 md:px-6 w-full">
        <div className="text-center mb-12">
          <Badge
            className="mb-4 px-4 py-2"
            style={{ backgroundColor: '#dbeafe', color: '#00469b' }}
          >
            Fitur Utama
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-gray-600 md:text-xl max-w-2xl mx-auto">
            Sistem lengkap untuk manajemen quality control dan barcode scanning di gudang
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow"
            >
              <div className="p-3 rounded-full" style={{ backgroundColor: '#dbeafe' }}>
                <feature.icon className="h-6 w-6" style={{ color: '#00469b' }} />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
