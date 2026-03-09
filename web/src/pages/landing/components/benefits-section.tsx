import { Database, Smartphone, Shield, Zap } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Smartphone,
      title: "Integrasi Mobile Scanner",
      description: "Terintegrasi langsung dengan aplikasi mobile Pokayoke scanner untuk monitoring real-time.",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Database,
      title: "Data Management Terpusat",
      description: "Semua data dari mobile scanner tersimpan dan terkelola dalam satu sistem yang terpusat.",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Shield,
      title: "Keamanan Data",
      description: "Sistem keamanan yang kuat dengan autentikasi multi-user dan enkripsi data.",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Performa Optimal",
      description: "Interface yang responsif dan cepat untuk barcode system dan pokayoke optimal.",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <section id="manfaat" className="w-full py-8 md:py-16 lg:py-24 xl:py-32 bg-gray-50 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Mengapa Pokayoke HadirApp?
            </h2>
            <p className="max-w-[900px] text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed">
              Platform Pokayoke HadirApp yang dirancang khusus untuk mendukung operasional mobile scanner, baik untuk system pokayoke maupun Barcode system. 
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-8 md:py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="grid gap-4 md:gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex items-start gap-3 md:gap-4">
                    <div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg ${benefit.bgColor} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 md:h-6 md:w-6 ${benefit.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-center order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg transform -rotate-3"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">Mobile Scanner</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scans Today</span>
                    <span className="font-semibold text-green-600">+156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold text-blue-600">99.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 