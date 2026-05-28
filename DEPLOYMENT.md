# Panduan Otomatisasi Deployment (CI/CD) ke VPS - nurhealthconnection.com

Aplikasi ini sekarang memiliki file konfigurasi **GitHub Actions** di `.github/workflows/deploy.yml` yang memungkinkan setiap kali Anda melakukan `git push` ke cabang `main` atau `master`, kode akan otomatis ter-deploy ke VPS Anda menggunakan password authentication.

Berikut adalah langkah-langkah untuk menyiapkan dan menghubungkannya:

---

## Langkah 1: Persiapan pada VPS Anda

Masuk ke VPS Anda via SSH dan pastikan beberapa requirement berikut sudah siap:

1. **Arahkan ke folder project Anda** (misalnya `/var/www/nurhealth`):
   ```bash
   cd /var/www/nurhealth
   ```

2. **Pastikan repositori Git sudah terhubung ke GitHub** di folder tersebut:
   ```bash
   # Cek remote URL saat ini
   git remote -v
   ```
   *Jika belum di-clone, Anda bisa melakukan `git clone <URL_REPOS_ANDA> .` langsung di folder tersebut.*

3. **Pastikan Node.js dan PM2 sudah terinstal di VPS**:
   ```bash
   node -v
   # Jika belum ada PM2, instal secara global:
   npm install -g pm2
   ```

---

## Langkah 2: Konfigurasi Secrets pada Repositori GitHub Anda

Buka halaman repositori Anda di GitHub, lalu pergi ke **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.

Tambahkan secret-secret berikut:

| Nama Secret | Deskripsi / Nilai | Contoh Nilai |
| :--- | :--- | :--- |
| **`VPS_HOST`** | IP Public VPS Anda atau domain tujuan | `nurhealthconnection.com` atau `103.x.x.x` |
| **`VPS_USER`** | Username sistem untuk login SSH ke VPS | `root` atau `ubuntu` |
| **`VPS_PASSWORD`** | **Password VPS** Anda untuk login SSH | `Password_VPS_Anda` |

---

## Langkah 3: Cara Penggunaan

Setelah semua terkonfigurasi:

1. Push kode ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: setup autodeploy"
   git push origin main
   ```
2. Buka tab **Actions** di repositori GitHub Anda.
3. Anda akan melihat workflow **Deploy to VPS (nurhealthconnection.com)** berjalan secara otomatis.
4. GitHub akan terhubung secara aman ke VPS Anda, mengunduh kode terbaru, melakukan build, dan melakukan restart instance server dengan PM2 tanpa adanya *downtime*!
