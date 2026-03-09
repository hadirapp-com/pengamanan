import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function DemoSection() {
  const testimonials = [
    {
      text: "Pokayoke HadirApp sangat membantu tim kami untuk memastikan barang yang dikirim memiliki kesesuaian dengan permintaan pelanggan. System memiliki interface yang clean dan fitur yang lengkap.",
      name: "Budi Santoso",
      role: "Warehouse Manager, PT Logistik Jaya"
    },
    {
      text: "Integrasi dengan mobile scanner sangat smooth. Data real-time dan dashboard yang informatif.",
      name: "Sari Wijaya",
      role: "Operations Director, CV Maju Bersama"
    },
    {
      text: "Fitur import/export data sangat membantu, label maker juga dapat membantu dalam membuat data QR Code yang unik",
      name: "Ahmad Rahman",
      role: "IT Manager, PT Distribusi Prima"
    }
  ];

  return (
    <section id="demo" className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lihat Pokayoke Admin dalam Aksi</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Platform Pokayoke/ Barcode system yang powerful untuk menjadi tools team warehouse
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-4 md:gap-6 py-8 md:py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className={`h-full ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-full">
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 