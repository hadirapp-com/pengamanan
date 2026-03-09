# Requirements
Saya ingin membuat aplikasi untuk kebutuhan pengamanan lebaran tahun 2026.
Aplikasi ini akan terdiri dari 3 aplikasi, 
1. API untuk integrasi
2. Aplikasi admin untuk manage master data, menampilkan transaksi
3. Aplikasi mobile untuk scan qr warga yang masuk/keluar

## Role aplikasi
1. superadmin, untuk manage user
2. admin, hanya login ke website
3. keamanan, role ini khusus penjaga gerbang dan akan ditanam di aplikasi

## Fitur web admin
1. Login, Logout
2. Manage user (bisa menambahkan)
3. Manage petugas jaga
4. Manage pos jaga
5. Manage QR
6. Menampilkan data log masuk/keluar

## Fitur mobile
1. sync data ke server untuk mengambil data petugas jaga, pos penjagaan, mengambil data qr warga
2. melakukan scan qr, menyimpan data qr, petugas jaga, pos jaga, timestamp ke database lokal
3. sync hasil data scan ke server
4. jika scan berhasil menampilkan bunyi sukses, jika scan gagal meempilkan bunyi gagal dan bergetar
5. data log masuk/keluar yang sudah berhasil di sync ke server akan dihapus dari mobile untuk mengurangi beban memori
6. sync data dilakukan manual untuk meminimalisir penggunaan internet

## API Reference
pada folder api saya sudah menyiapkan template, aplikasi ini adalah aplikasi pokayoke, silahkan hapus fitur yang tidak dibutuhkan

## Web Reference
pada folder api saya sudah menyiapkan template, aplikasi ini adalah aplikasi pokayoke, silahkan hapus data yang tidak dibutuhkan

## Requirement teknikal
1. mobile menggunakan kotlin, support 16kb page
2. target sdk 35
3. gunakan sqlite pada mobile, struktur disamakan dengan backend untuk mempermudah sinkronisasi
4. deploy menggunakan docker
5. db postgresql

## requirement UI
1. gunakan icon pada resources/android
2. gunakan palete berikut #060273 #5F5DA6 #040959 #F2F2F2 #0D0D0D

### Mobile
1. halaman home, pada halaman home ada navigasi ke halaman camera scan, pemilihan petugas jaga dan pos jaga
2. halaman log masuk

### Document requirements
1. Buatkan PRD dan user guide
