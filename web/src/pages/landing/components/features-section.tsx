import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Building2, Users, BarChart3, FileText, Settings } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Barcode System",
      description: "Kelola semua data pengiriman dari mobile scanner. Import permintaan/ integrasi Melalui API dengan system sumber dan monitor status delivery secara real-time, hasil scan dapat dikirim ERP, melengkapi keterbatasan ERP dalam mengimplementasikan Barcode System dalam pengiriman dan penerimaan barang.",
      color: "text-blue-600",
      items: [
        "Import data dari file Order/ Integrasi API",
        "Filter & search advanced",
        "Column visibility toggle"
      ]
    },
    {
      icon: Building2,
      title: "Pokayoke Multi Customer",
      description: "Pokayoke hadir app dapat mengidentifikasi Shipping label (Barcode/ QR Code) banyak konsumen.",
      color: "text-green-600",
      items: [
        "Master data perkonsumen",
        "Dapat mengidentifikasi shipping card HPM, Hino, ADM, Toyota, MMKI, Hyundai, dan yang lainnya",
        "History Scan"
      ]
    },
    {
      icon: Users,
      title: "User Management",
      description: "Kelola user dan admin yang mengakses sistem. Kontrol akses dan permissions untuk setiap user.",
      color: "text-purple-600",
      items: [
        "Role-based access",
        "User activity logs",
        "Secure authentication"
      ]
    },
    {
      icon: BarChart3,
      title: "Traceability Analytics",
      description: "System dapat membuat label QR dengan Traceability data yang kuat, sehingga report yang kami sediakan merupakan data yang dapat di-tracking dengan baik dan disajikan sesuai kebutuhan.",
      color: "text-orange-600",
      items: [
        "Label Maker",
        "Quick navigation",
        " Dynamic & Strong Data QR Code"
      ]
    },
    {
      icon: FileText,
      title: "Data Import/Export",
      description: "Import data delivery dari file txt/ excel/ xml dan export laporan untuk analisis lebih lanjut.",
      color: "text-red-600",
      items: [
        "Bulk import delivery",
        "Multiple file formats",
        "Data validation"
      ]
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Konfigurasi sistem dan pengaturan untuk mengoptimalkan performa admin panel.",
      color: "text-indigo-600",
      items: [
        "API configuration",
        "Database management",
        "Security settings"
      ]
    }
  ];

  return (
    <section id="fitur" className="w-full py-8 md:py-16 lg:py-24 xl:py-32 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Fitur Pokayoke HadirApp
            </h2>
            <p className="max-w-[900px] text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed">
              Semua yang Anda butuhkan untuk mengelola dan memantau aktivitas Pokayoke mobile scanner & Barcode System Warehouse
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-4 md:gap-6 py-8 md:py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="relative overflow-hidden h-full">
                <CardHeader className="pb-3 md:pb-4">
                  <Icon className={`h-8 w-8 md:h-10 md:w-10 ${feature.color}`} />
                  <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-xs md:text-sm text-gray-600">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
} 