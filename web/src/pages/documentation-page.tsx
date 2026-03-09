import { QrCode, Home, Barcode, Activity, Users, Settings, FileText, Shield, ScrollText, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">Pokayoke</span>
          </Link>
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-600 rounded-full">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold md:text-5xl">Dokumentasi Pokayoke</h1>
            <p className="text-gray-600 md:text-xl">
              Panduan lengkap untuk menggunakan Sistem Quality Control & Barcode Scanner
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container px-4 md:px-6 py-12 max-w-4xl">
        {/* Table of Contents */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Daftar Isi</h2>
          <nav className="grid gap-2 md:grid-cols-2">
            <a href="#pengenalan" className="text-blue-600 hover:underline">1. Pengenalan</a>
            <a href="#fitur" className="text-blue-600 hover:underline">2. Fitur Utama</a>
            <a href="#login" className="text-blue-600 hover:underline">3. Cara Login</a>
            <a href="#dashboard" className="text-blue-600 hover:underline">4. Dashboard</a>
            <a href="#master-label" className="text-blue-600 hover:underline">5. Master Data Label</a>
            <a href="#master-pokayoke" className="text-blue-600 hover:underline">6. Master Data Pokayoke</a>
            <a href="#scan-monitoring" className="text-blue-600 hover:underline">7. Scan Monitoring</a>
            <a href="#log-scanner" className="text-blue-600 hover:underline">8. Log Scanner</a>
          </nav>
        </div>

        {/* Section 1: Pengenalan */}
        <section id="pengenalan" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            1. Pengenalan
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Pokayoke</strong> adalah sistem Quality Control & Barcode Scanner untuk manajemen gudang.
              Aplikasi ini membantu mengelola:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Barcode/QR label printing dan tracking</li>
              <li>Monitoring aktivitas scanner secara real-time</li>
              <li>Manajemen data pengiriman (delivery)</li>
              <li>Tracking lot dan part number</li>
              <li>Multi-customer support (HPM, Hino, Toyota, MMKI, Hyundai, ADM, dll)</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Fitur Utama */}
        <section id="fitur" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            2. Fitur Utama
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg mb-1">Barcode & QR Label Management</h3>
              <p className="text-gray-600">Cetak dan kelola label barcode/QR untuk tracking part dan barang</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg mb-1">Real-time Scan Monitoring</h3>
              <p className="text-gray-600">Pantau aktivitas scanner, lot tracking, dan status pengiriman secara langsung</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg mb-1">Multi-Customer Support</h3>
              <p className="text-gray-600">Dukung multiple customer dengan filtering dan management terpisah</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg mb-1">Import/Export Data</h3>
              <p className="text-gray-600">Import data dari CSV/TXT/Excel dan export laporan dengan mudah</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg mb-1">Role-Based Access Control</h3>
              <p className="text-gray-600">Kelola hak akses user berdasarkan role (Admin, Sales, Supervisor, User)</p>
            </div>
          </div>
        </section>

        {/* Section 3: Cara Login */}
        <section id="login" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            3. Cara Login
          </h2>
          <div className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Buka halaman <Link to="/login" className="text-blue-600 hover:underline">Login</Link></li>
              <li>Masukkan <strong>Username</strong> dan <strong>Password</strong> Anda</li>
              <li>Klik tombol <strong>Login</strong></li>
              <li>Setelah berhasil, Anda akan diarahkan ke Dashboard</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Jika mengalami masalah login, hubungi administrator sistem Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Dashboard */}
        <section id="dashboard" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            4. Dashboard
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Dashboard memberikan overview statistik sistem:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Total Users:</strong> Jumlah user yang terdaftar</li>
              <li><strong>Total Deliveries:</strong> Jumlah data pengiriman</li>
              <li><strong>Total Customers:</strong> Jumlah customer aktif</li>
              <li><strong>Quick Actions:</strong> Akses cepat ke fitur utama</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Master Data Label */}
        <section id="master-label" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Barcode className="h-6 w-6 text-blue-600" />
            5. Master Data Label (Parts)
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700">Kelola master data parts untuk label:</p>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Parts List</h4>
                <p className="text-sm text-gray-600">Lihat dan kelola semua parts dengan fitur search dan filter</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Import Parts</h4>
                <p className="text-sm text-gray-600">Import data parts dari file Excel</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Print History</h4>
                <p className="text-sm text-gray-600">Lihat riwayat pencetakan label</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Label Design</h4>
                <p className="text-sm text-gray-600">Konfigurasi desain label</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Master Data Pokayoke */}
        <section id="master-pokayoke" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-blue-600" />
            6. Master Data Pokayoke (Delivery)
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>Kelola data pengiriman dan pokayoke:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Delivery List:</strong> Kelola semua data pengiriman</li>
              <li><strong>Filter per Customer:</strong> Lihat data per customer (HPM, MMKI, dll)</li>
              <li><strong>Import Data:</strong> Import dari CSV/TXT/Excel</li>
              <li><strong>Revision Management:</strong> Kelola revisi data</li>
              <li><strong>Lot Tracking:</strong> Track lot dan statusnya</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Scan Monitoring */}
        <section id="scan-monitoring" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            7. Scan Monitoring
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>Pantau aktivitas scanner secara real-time:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Real-time Updates:</strong> Lihat scan yang terjadi secara langsung</li>
              <li><strong>Lot Status:</strong> Track status lot (Open, In Progress, Completed)</li>
              <li><strong>Preparation vs Delivery:</strong> Bandingkan scan preparation dan delivery</li>
              <li><strong>Lock/Unlock Lots:</strong> Kontrol lot yang bisa di-scan</li>
              <li><strong>Filtering:</strong> Filter berdasarkan tanggal, status, dan customer</li>
            </ul>
          </div>
        </section>

        {/* Section 8: Log Scanner */}
        <section id="log-scanner" className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            8. Log Scanner
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>Lihat semua riwayat scan:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Complete Log:</strong> Semua aktivitas scanner tercatat</li>
              <li><strong>Match/Mismatch Status:</strong> Lihat status kecocokan scan</li>
              <li><strong>Filtering:</strong> Filter berdasarkan customer, lot, dan tanggal</li>
              <li><strong>Export:</strong> Export log untuk analisis lebih lanjut</li>
            </ul>
          </div>
        </section>

        {/* Section 9: Customer & User Management */}
        <section className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            9. Customer & User Management
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Customer Management</h3>
              <p className="text-gray-600">Kelola data customer dan alias (HPM, MMKI, dll)</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">User Management</h3>
              <p className="text-gray-600">Kelola user dengan role-based access control (Admin, Sales, Supervisor, User)</p>
            </div>
          </div>
        </section>

        {/* Section 10: System Configuration */}
        <section className="bg-white rounded-lg border p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            10. Konfigurasi Sistem
          </h2>
          <p className="text-gray-700">
            Atur konfigurasi sistem melalui menu Config. Pengaturan mencakup parameter sistem
            dan konfigurasi API.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-blue-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Siap Menggunakan Pokayoke?</h3>
          <p className="text-blue-50 mb-6">Login sekarang untuk mulai mengelola sistem Anda</p>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Login ke Dashboard
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container px-4 md:px-6 text-center text-sm text-gray-600">
          <p>©2025 Pokayoke. Internal Application | powered by hadirapp.com</p>
          <p className="mt-2">
            Butuh bantuan? <a href="https://wa.me/6281320706982" className="text-blue-600 hover:underline">Hubungi Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
