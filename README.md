# 🔐 Aplikasi Penyimpanan Password dengan Algoritma RSA

> **Tugas Mata Kuliah Kriptografi — Semester 5**  
> Implementasi Algoritma Kriptografi Asimetris RSA dari *Scratch* (Murni tanpa Library Kriptografi Pihak Ketiga & Tanpa Framework Web).

---

## 📌 Deskripsi Project

Aplikasi ini merupakan **Password Storage (Penyimpan Password)** berbasis web interaktif. Aplikasi ini memungkinkan pengguna untuk:
1. Membangkitkan pasangan kunci RSA (**Public Key** & **Private Key**) dari dua bilangan prima $p$ dan $q$.
2. Menenkripsi password menggunakan **Public Key** sebelum disimpan.
3. Menyimpan password terenkripsi (**Ciphertext**) ke dalam `localStorage` browser.
4. Mendekripsi kembali ciphertext menggunakan **Private Key** untuk melihat password asli (**Plaintext**).
5. Menghapus data password yang tersimpan.

> 🚨 **Prinsip Keamanan Utama:**  
> Password **TIDAK PERNAH** disimpan dalam bentuk teks asli (*plaintext*) di dalam `localStorage`. Hanya array angka *ciphertext* yang disimpan di sisi browser.

---

## 📂 Struktur Project

Struktur direktori dibuat modular sesuai dengan prinsip pemisahan tugas (*separation of concerns*):

```text
.
├── README.md                  # Dokumentasi Lengkap Project
├── .gitignore                 # Konfigurasi File Abaikan Git
└── rsa-password/
    ├── main.py                # Server HTTP & API Router (Python Standard Library)
    │
    ├── rsa/                   # Package Algoritma RSA (100% Implemetasi Sendiri)
    │   ├── __init__.py        # Inisialisasi Package RSA
    │   ├── math_utils.py      # Fungsi Matematika Dasar (GCD, Cek Prima, ModPow, ModInverse)
    │   ├── key_generation.py # Pembangkitan Pasangan Kunci RSA (n, phi, e, d)
    │   ├── encryption.py      # Fungsi Enkripsi (c = m^e mod n)
    │   ├── decryption.py      # Fungsi Dekripsi (m = c^d mod n)
    │   └── converter.py       # Konversi Teks <-> Kode ASCII
    │
    └── ui/                    # Antarmuka Pengguna (Vanilla Web)
        ├── index.html         # Tampilan HTML (3 Menu Utama + Info Demo)
        ├── style.css          # Style Modern, Clean, & Responsif
        └── script.js          # Interaksi UI, localStorage, & Fetch API
```

---

## ⚙️ Rincian Modul & Fungsi

### 1. Modul Matematika (`rsa/math_utils.py`)
- `gcd(a, b)`: Menghitung FPB / *Greatest Common Divisor* menggunakan Algoritma Euclidean.
- `is_prime(n)`: Mengecek apakah bilangan $n$ merupakan bilangan prima.
- `mod_pow(base, exponent, modulus)`: Menghitung perpangkatan modular $(base^{exponent}) \bmod modulus$ secara efisien dengan metode *Exponentiation by Squaring*.
- `extended_gcd(a, b)` & `mod_inverse(e, phi)`: Mencari nilai $d$ (*Modular Multiplicative Inverse*) sehingga $(e \times d) \bmod \phi = 1$ menggunakan *Extended Euclidean Algorithm*.

### 2. Modul Pembangkitan Kunci (`rsa/key_generation.py`)
- `generate_keys(p, q)`:
  1. Validasi $p$ dan $q$ harus bilangan prima.
  2. Validasi $p \neq q$.
  3. Hitung modulus $n = p \times q$.
  4. Hitung *Euler Totient* $\phi(n) = (p - 1) \times (q - 1)$.
  5. Pilih nilai $e$ yang relatif prima terhadap $\phi(n)$ ($\gcd(e, \phi) = 1$).
  6. Hitung nilai $d$ menggunakan `mod_inverse(e, phi)`.
  7. Mengembalikan **Public Key** $(e, n)$ dan **Private Key** $(d, n)$.

### 3. Modul Konversi Teks (`rsa/converter.py`)
- `text_to_numbers(text)`: Mengubah string karakter menjadi array angka kode ASCII (contoh: `"A"` $\rightarrow$ `65`).
- `numbers_to_text(numbers)`: Mengubah array angka kode ASCII kembali menjadi string karakter.

### 4. Modul Enkripsi (`rsa/encryption.py`)
- `encrypt_number(m, public_key)`: Menenkripsi satu angka ASCII $m$ menjadi ciphertext $c$ menggunakan rumus:
  $$c = m^e \bmod n$$
- `encrypt_text(text, public_key)`: Mengonversi teks ke ASCII lalu menenkripsi setiap angka karakter.

### 5. Modul Dekripsi (`rsa/decryption.py`)
- `decrypt_number(c, private_key)`: Mendekripsi satu ciphertext $c$ menjadi angka ASCII $m$ menggunakan rumus:
  $$m = c^d \bmod n$$
- `decrypt_text(ciphertext, private_key)`: Mendekripsi array ciphertext kembali menjadi teks asli.

### 6. Main Server (`main.py`)
- Menggunakan `http.server` & `socketserver` dari Python Standard Library.
- Menyajikan file antarmuka (`ui/index.html`, `ui/style.css`, `ui/script.js`).
- Menyediakan endpoint API JSON (POST):
  - `/api/generate-key`: Menerima $p, q$ $\rightarrow$ mengembalikan kunci RSA.
  - `/api/encrypt`: Menerima teks & Public Key $\rightarrow$ mengembalikan array ciphertext.
  - `/api/decrypt`: Menerima array ciphertext & Private Key $\rightarrow$ mengembalikan plaintext.

### 7. UI Frontend (`ui/`)
- `ui/index.html`: Menyediakan 3 menu utama:
  1. **Pembangkitan Kunci RSA**
  2. **Simpan Password Terenkripsi**
  3. **Daftar Password Tersimpan**
- `ui/script.js`: Mengatur event listener tombol, Fetch API ke Python, manipulasi DOM, dan penyimpanan ciphertext di `localStorage`. *(TIDAK mengandung rumus RSA)*.

---

## 🔄 Alur Kerja Aplikasi

```text
[ Input User ]
      │
      ▼
[ script.js ] ──(Fetch POST /api/encrypt)──► [ main.py ]
                                                   │
                                                   ▼
                                         [ rsa/converter.py ]
                                          (Teks -> ASCII m)
                                                   │
                                                   ▼
                                         [ rsa/encryption.py ]
                                         (c = m^e mod n)
                                                   │
                                                   ▼
[ localStorage ] ◄──(Return Array c)────── [ Main Response ]
 (HANYA menyimpan c)
```

---

## 🚀 Cara Menjalankan Aplikasi

1. **Buka Terminal / PowerShell** dan masuk ke folder project:
   ```powershell
   cd "d:\Kuliah\Semester 5\Kriptografi\Tugas RSA\rsa-password"
   ```

2. **Jalankan Server Python:**
   ```powershell
   python main.py
   ```

3. **Buka Browser:**
   Akses URL berikut di browser favorit Anda:
   ```text
   http://localhost:8000
   ```

---

## 🎓 Panduan Demo untuk Presentasi Kuliah

Saat melakukan demo di depan dosen, ikuti urutan berikut:

1. **Langkah 1: Generasi Kunci**
   - Masukkan $p = 47$ dan $q = 71$ pada Menu 1.
   - Klik **Generate Key RSA**.
   - Tunjukkan hasil perhitungan: $n = 3337$, $\phi(n) = 3220$, $e = 3$, $d = 2147$.
   - Tunjukkan **Public Key** $(3, 3337)$ dan **Private Key** $(2147, 3337)$.

2. **Langkah 2: Enkripsi & Simpan**
   - Masukkan Website: `Instagram`, Username: `dimas123`, Password: `rahasia123`.
   - Klik **Simpan & Enkripsi**.
   - Tunjukkan bahwa password asli diubah menjadi array ciphertext (misal: `[3253, 1672, 295, ...]`).

3. **Langkah 3: Pembuktian `localStorage`**
   - Buka **Developer Tools Browser** (`F12`) $\rightarrow$ Tab **Application/Storage** $\rightarrow$ **Local Storage**.
   - Tunjukkan bahwa nilai password asli **TIDAK ADA** di storage, melainkan hanya array angka ciphertext.

4. **Langkah 4: Dekripsi Password**
   - Pada Menu 3, klik tombol **Dekripsi / Lihat Password**.
   - Tunjukkan bahwa ciphertext dikirim ke Python backend dan berhasil didekripsi kembali menjadi `rahasia123`.

---
*Dibuat untuk Tugas Mata Kuliah Kriptografi - Semester 5.*
