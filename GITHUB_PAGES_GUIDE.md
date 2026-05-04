# Panduan Deployment GitHub Pages untuk AccounX Pro

Aplikasi ini sudah dikonfigurasi untuk siap di-deploy ke GitHub Pages. Ikuti langkah-langkah di bawah ini:

## 1. Pengaturan di GitHub
1.  **Push Kode**: Upload semua file ini ke repository GitHub baru Anda.
2.  **Aktifkan GitHub Actions**:
    - Pergi ke tab **Settings** di repository GitHub Anda.
    - Pilih menu **Pages** di sidebar kiri.
    - Di bagian **Build and deployment > Source**, pilih **GitHub Actions**.
3.  **Gunakan Workflow**: Saya telah menyertakan file `.github/workflows/deploy.yml` (silakan buat manual jika melalui browser) yang akan otomatis mem-build aplikasi setiap kali Anda melakukan push ke branch `main`.

## 2. Pengaturan Penting di Firebase (SANGAT PENTING)
Karena aplikasi ini menggunakan Firebase Auth (Google Login), Anda **WAJIB** mendaftarkan domain GitHub Pages Anda agar login tidak error:

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Pilih proyek Anda.
3.  Pergi ke **Authentication** > tab **Settings** > **Authorized Domains**.
4.  Klik **Add Domain**.
5.  Masukkan domain GitHub Pages Anda (Contoh: `username.github.io`).
6.  Tanpa langkah ini, **Google Login akan diblokir** karena alasan keamanan.

## 3. Rahasia Lingkungan (GitHub Secrets)
Jika Anda menggunakan API Key yang sensitif di `.env`:
1.  Pergi ke **Settings** repository > **Secrets and variables** > **Actions**.
2.  Tambahkan secret baru sesuai dengan variabel di `.env.example`.

---
*Catatan: Aplikasi ini menggunakan routing berbasis state (activeTab), sehingga tidak memerlukan konfigurasi 404.html khusus untuk GitHub Pages.*
