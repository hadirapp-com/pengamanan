# PANDUAN PENGGUNAAN APLIKASI
## Sistem Pengamanan Lebaran Blok F RT 024

---

**Versi:** 1.0
**Tanggal:** Maret 2026
**Target Pengguna:** Admin Sistem

---

## 📋 DAFTAR ISI

1. [Pengantar](#1-pengantar)
2. [Login ke Dashboard](#2-login-ke-dashboard)
3. [Dashboard](#3-dashboard)
4. [Manajemen Pengguna](#4-manajemen-pengguna)
5. [Manajemen Petugas Jaga](#5-manajemen-petugas-jaga)
6. [Manajemen Pos Jaga](#6-manajemen-pos-jaga)
7. [Manajemen QR Code](#7-manajemen-qr-code)
8. [Manajemen Pengumuman](#8-manajemen-pengumuman)
9. [Lihat Riwayat Scan](#9-lihat-riwayat-scan)
10. [Pengaturan Konfigurasi](#10-pengaturan-konfigurasi)
11. [FAQ](#11-faq)

---

## 1. PENGANTAR

Selamat datang di Panduan Penggunaan Aplikasi Sistem Pengamanan Lebaran Blok F RT 024.

Aplikasi ini dirancang untuk memudahkan pengelolaan keamanan Lebaran di lingkungan Blok F RT 024 dengan menggunakan sistem QR Code.

### Fitur Utama:

✅ **Manajemen QR Code** - Buat QR code untuk setiap rumah/blok
✅ **Manajemen Petugas** - Kelola data petugas jaga
✅ **Manajemen Pos** - Kelola pos-pos jaga
✅ **Pengumuman** - Buat dan kirim pengumuman ke petugas
✅ **Monitoring Real-time** - Pantau scan masuk/keluar
✅ **Laporan** - Export laporan dalam format Excel

### Akses Aplikasi

🌐 **URL Dashboard Admin:**
https://blokf.hadirapp.com

---

## 2. LOGIN KE DASHBOARD

### Langkah-langkah Login:

1. Buka browser dan kunjungi: **https://blokf.hadirapp.com**

2. Halaman login akan muncul

3. Masukkan kredensial:
   - **Username:** `superadmin` atau `admin`
   - **Password:** `admin123`

4. Klik tombol **"Login"**

5. Setelah berhasil login, Anda akan diarahkan ke Dashboard

### Ganti Password (Disarankan)

Untuk keamanan, disarankan mengganti password setelah login pertama:

1. Klik nama user di pojok kanan atas
2. Pilih **"Logout"** (nanti akan ada fitur ganti password)

---

## 3. DASHBOARD

Dashboard adalah halaman utama yang menampilkan ringkasan aktivitas pengamanan.

### Komponen Dashboard:

```
┌────────────────────────────────────────────────────────┐
│  DASHBOARD PENGAMANAN LEBARAN                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 STATISTIK HARI INI                                 │
│  ┌─────────┬─────────┬─────────┬─────────┐             │
│  │ Total   │ Masuk   │ Keluar  │ Unik    │             │
│  │ Scan    │         │         │         │             │
│  │ 150     │ 80      │ 70      │ 45      │             │
│  └─────────┴─────────┴─────────┴─────────┘             │
│                                                        │
│  📈 AKTIVITAS SCAN TERBARU                             │
│  ┌─────────────────────────────────────────┐           │
│  │ 13 Maret 2026, 18:30                    │           │
│  │ Block A-101 - Masuk                     │           │
│  │ Petugas: Bpk. Ahmad - Pos 1 Utama       │           │
│  └─────────────────────────────────────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Informasi yang Ditampilkan:

1. **Statistik Hari Ini**
   - Total Scan: Jumlah semua scan hari ini
   - Masuk: Jumlah scan masuk
   - Keluar: Jumlah scan keluar
   - Unik: Jumlah QR unik yang discan

2. **Aktivitas Scan Terbaru**
   - 10 scan terakhir secara real-time
   - Menampilkan waktu, QR, petugas, dan pos

---

## 4. MANAJEMEN PENGGUNA

Menu ini digunakan untuk mengelola akun admin yang memiliki akses ke dashboard.

### Mengakses Menu Users:

1. Klik menu **"Users"** di sidebar kiri
2. Daftar semua pengguna akan ditampilkan

### Membuat User Baru:

1. Klik tombol **"+ Tambah User"** di pojok kanan atas

2. Isi form:
   ```
   Username: admin2
   Password: password123
   Role: Admin
   ```

3. Klik **"Simpan"**

### Role Pengguna:

| Role | Keterangan |
|------|------------|
| **Superadmin** | Akses penuh termasuk manajemen user |
| **Admin** | Akses terbatas, tidak bisa manajemen user |

### Mengedit User:

1. Klik tombol **icon edit** (✏️) pada baris user yang ingin diubah
2. Ubah data yang diperlukan
3. Klik **"Simpan"**

### Menghapus User:

1. Klik tombol **icon hapus** (🗑️)
2. Konfirmasi penghapusan

⚠️ **Catatan:** User yang dihapus akan dihapus secara *soft delete* (masih ada di database tapi tidak aktif)

---

## 5. MANAJEMEN PETUGAS JAGA

Menu ini untuk mengelola data petugas jaga yang akan bertugas.

### Mengakses Menu Petugas:

1. Klik menu **"Petugas"** di sidebar kiri

### Membuat Petugas Baru:

1. Klik tombol **"+ Tambah Petugas"**

2. Isi form dengan lengkap:
   ```
   Nama: Bpk. Ahmad Subarjo
   NIK: 1234567890123456
   No HP: 081234567890
   ```

3. Klik **"Simpan"**

### Data yang Diperlukan:

| Field | Keterangan | Format |
|-------|------------|--------|
| **Nama** | Nama lengkap petugas | Teks |
| **NIK** | Nomor Induk Kependudukan | 16 digit angka |
| **No HP** | Nomor handphone | 10-15 digit angka |

### Mengedit Petugas:

1. Klik icon edit (✏️) pada petugas yang dipilih
2. Ubah data
3. Klik **"Simpan"**

### Menghapus Petugas:

⚠️ **Hati-hati:** Petugas yang dihapus tidak bisa digunakan untuk scan.

---

## 6. MANAJEMEN POS JAGA

Menu ini untuk mengelola lokasi pos jaga.

### Mengakses Menu Pos:

1. Klik menu **"Pos"** di sidebar kiri

### Membuat Pos Baru:

1. Klik tombol **"+ Tambah Pos"**

2. Isi form:
   ```
   Nama: Pos 1 Utara
   Lokasi: Gerbang Utara Blok F
   ```

3. Klik **"Simpan"**

### Contoh Penamaan Pos:

- "Pos 1 Utara" - Gerbang utara
- "Pos 2 Timur" - Gerbang timur
- "Pos 3 Selatan" - Gerbang selatan
- "Pos Pusat" - Pos di tengah lingkungan

### Mengedit/Menghapus Pos:

Sama seperti menu Petugas, gunakan tombol edit atau hapus.

---

## 7. MANAJEMEN QR CODE

Menu ini untuk membuat dan mengelola QR code untuk setiap rumah/blok.

### Mengakses Menu QR:

1. Klik menu **"QR"** di sidebar kiri

### Membuat QR Code Baru:

1. Klik tombol **"+ Buat QR"**

2. Isi form:
   ```
   Nama: Block A-101
   Penanggung Jawab: Bpk. Ahmad
   Berlaku Dari: 2026-03-10
   Berlaku Sampai: 2026-04-10
   ```

3. Klik **"Simpan & Generate QR"**

4. QR Code akan dibuat otomatis dengan format UUID

### Format Penamaan QR:

Disarankan menggunakan format yang konsisten:
- "Block A-101" - Untuk rumah
- "Block B-201" - Untuk rumah
- "Pos Jaga 1" - Untuk pos
- "Ruang Tamu" - Untuk ruangan umum

### Download QR Code:

#### Single Download:
1. Klik icon download (⬇️) pada QR yang dipilih
2. Gambar QR akan terdownload dalam format PNG

#### Batch Download (PDF):
1. Pilih beberapa QR dengan mencentang checkbox
2. Klik tombol **"Download PDF"**
3. PDF berisi semua QR yang dipilih akan terdownload

### Toggle Aktif/Nonaktif:

1. Klik tombol toggle (🔘) pada kolom "Status"
2. QR non-aktif tidak bisa discan oleh mobile app

### Generate QR UUID Baru:

Jika ingin membuat UUID baru tanpa menyimpan ke database:
1. Klik tombol **"Generate UUID"**
2. UUID baru akan dibuat
3. Bisa digunakan untuk keperluan lain

---

## 8. MANAJEMEN PENGUMUMAN

Menu ini untuk membuat pengumuman yang akan ditampilkan di mobile app.

### Mengakses Menu Pengumuman:

1. Klik menu **"Pengumuman"** di sidebar kiri

### Membuat Pengumuman Baru:

1. Klik tombol **"+ Buat Pengumuman"**

2. Isi form:
   ```
   Judul: Jam Malam Dimulai Pukul 22:00
   Isi Pengumuman: Diberitahukan kepada seluruh warga...
   Prioritas: Penting
   ```

3. Klik **"Simpan"**

### Tingkat Prioritas:

| Prioritas | Keterangan | Warna |
|-----------|------------|-------|
| **Normal** | Pengumuman biasa | Hijau |
| **Penting** | Pengumuman penting | Kuning |
| **Urgent** | Pengumuman sangat penting | Merah |

### Menampilkan/Menyembunyikan:

1. Klik toggle pada kolom "Status"
2. Pengumuman non-aktif tidak akan muncul di mobile

---

## 9. LIHAT RIWAYAT SCAN

Menu ini untuk memantau semua aktivitas scan masuk/keluar.

### Mengakses Menu Logs:

1. Klik menu **"Logs"** di sidebar kiri

### Fitur Filter:

#### 1. Pencarian Text:
   - Ketik di kotak pencarian
   - Mencari berdasarkan: nama QR, penanggung jawab, petugas, pos

#### 2. Filter Tanggal:
   - **Tanggal Mulai:** Pilih tanggal awal
   - **Tanggal Selesai:** Pilih tanggal akhir
   - Contoh: 1 Maret - 31 Maret 2026

#### 3. Filter Pos:
   - Pilih pos tertentu dari dropdown
   - Menampilkan hanya scan dari pos tersebut

#### 4. Filter Tipe Scan:
   - Pilih: "Semua", "Masuk", atau "Keluar"

### Mengurutkan Data:

Klik judul kolom untuk mengurutkan:
- **Waktu** - Klik untuk urutkan naik/turun
- **Nama** - Klik untuk urutkan A-Z/Z-A

### Export ke Excel:

1. Atur filter sesuai kebutuhan
2. Klik tombol **"Export Excel"** (⬇️)
3. File Excel akan terdownload

Format Excel:
```
| Waktu            | Nama | Penanggung Jawab | Petugas | Pos  | Tipe Scan |
|------------------|------|------------------|---------|------|-----------|
| 13-03-2026 18:30 | Block A-101 | Bpk. Ahmad | Bpk. Joko | Pos 1 | Masuk |
```

### Refresh Otomatis:

Data akan direfresh otomatis setiap **15 detik**

---

## 10. PENGATURAN KONFIGURASI

Menu ini untuk mengatur pengaturan aplikasi.

### Mengakses Menu Configs:

1. Klik menu **"Configs"** di sidebar kiri

### Konfigurasi Tersedia:

#### 1. APP_TITLE
- **Keterangan:** Judul aplikasi untuk home screen mobile
- **Value:** "Pengamanan Lebaran"
- **Bisa Diubah:** Ya

#### 2. HOME_SCREEN_BANNER
- **Keterangan:** URL gambar banner untuk home screen
- **Value:** URL gambar (PNG/JPG)
- **Bisa Diubah:** Ya

#### 3. mobile_pin
- **Keterangan:** PIN global untuk login mobile app
- **Value:** 6 digit angka
- **Bisa Diubah:** Ya
- ⚠️ **Hati-hati:** Mengubah PIN akan mempengaruhi semua petugas

### Mengubah Konfigurasi:

1. Klik icon edit (✏️) pada config yang dipilih
2. Ubah value
3. Klik **"Simpan"**

---

## 11. FAQ

### Q: Bagaimana jika saya lupa password?

**A:** Hubungi superadmin atau developer untuk reset password.

### Q: Berapa batas maksimal QR code yang bisa dibuat?

**A:** Tidak ada batas. Anda bisa membuat sebanyak yang dibutuhkan.

### Q: Apakah QR code bisa dipakai ulang tahun depan?

**A:** Ya, cukup buat QR baru dengan periode tahun berikutnya.

### Q: Bagaimana jika petugas lupa PIN?

**A:** PIN adalah global (sama untuk semua petugas). Hubungi admin untuk mengetahui PIN.

### Q: Apakah data scan bisa dihapus?

**A:** Ya, tapi hanya yang sudah disinkronkan ke server. Data yang belum disinkron tidak bisa dihapus.

### Q: Berapa lama data tersimpan?

**A:** Data akan tersimpan selamanya di database, kecuali dihapus secara manual.

### Q: Apakah bisa export laporan per bulan?

**A:** Ya, gunakan filter tanggal dan pilih rentang tanggal bulan yang diinginkan, lalu klik "Export Excel".

### Q: Bagaimana jika ada scan ganda?

**A:** Sistem memperbolehkan scan ganda dalam sehari. Tidak ada batasan berapa kali satu QR bisa discan.

### Q: Apa bedanya Masuk dan Keluar?

**A:**
- **Masuk:** Tamu/warga masuk ke lingkungan
- **Keluar:** Tamu/warga keluar dari lingkungan

### Q: Berapa minimal karakter password?

**A:** Minimal 6 karakter.

---

## 12. TIPS & TRIK

### 💡 Tips Pengelolaan QR Code:

1. **Gunakan penamaan konsisten** - Lebih mudah dicari
2. **Set periode validity** - QR otomatis tidak berlaku setelah tanggal
3. **Download dalam batch** - Hemat waktu saat cetak banyak QR

### 💡 Tips Pengelolaan Petugas:

1. **Pastikan NIK valid** - 16 digit angka
2. **Nomor HP aktif** - Untuk komunikasi jika ada masalah

### 💡 Tips Monitoring:

1. **Gunakan filter** - Lebih spesifik data yang ditampilkan
2. **Export berkala** - Backup data laporan
3. **Pantau dashboard** - Cek statistik harian

---

## 13. KONTAK SUPPORT

Jika mengalami masalah atau memiliki pertanyaan:

📧 **Email:** admin@blokf.hadirapp.com
📱 **WhatsApp:** [Nomor Admin]
🌐 **Website:** https://blokf.hadirapp.com

---

## 14. CHANGELOG

### Versi 1.0 (Maret 2026)
- ✅ Initial release
- ✅ Fitur manajemen user, petugas, pos, QR
- ✅ Fitur pengumuman
- ✅ Fitur monitoring dan laporan
- ✅ Mobile app integration

---

**Selamat menggunakan aplikasi!** 🎉

*Dokumentasi ini akan terus diupdate seiring dengan perkembangan aplikasi.*
