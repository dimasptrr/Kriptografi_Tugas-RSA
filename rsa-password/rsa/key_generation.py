"""
rsa/key_generation.py
Modul untuk pembangkitan kunci RSA (Public Key dan Private Key).
"""

from .math_utils import is_prime, gcd, mod_inverse


def generate_keys(p: int, q: int) -> dict:
    """
    Membangkitkan pasangan kunci RSA dari dua bilangan prima p dan q.
    
    Proses:
    1. Validasi p dan q harus prima
    2. Validasi p dan q tidak boleh sama
    3. Hitung n = p * q
    4. Hitung phi(n) = (p - 1) * (q - 1)
    5. Pilih e yang relatif prima terhadap phi(n) [gcd(e, phi) == 1]
    6. Hitung d = mod_inverse(e, phi)
    """
    # 1. Validasi p dan q
    if not is_prime(p):
        raise ValueError(f"Nilai p = {p} bukan bilangan prima!")
    if not is_prime(q):
        raise ValueError(f"Nilai q = {q} bukan bilangan prima!")
    if p == q:
        raise ValueError("Nilai p dan q harus berbeda!")

    # 2. Hitung Modulus n
    n = p * q

    # 3. Hitung Totient Euler phi(n)
    phi = (p - 1) * (q - 1)

    # 4. Pilih Public Exponent e
    # Coba e standar 65537 jika valid dan kurang dari phi, jika tidak cari e terkecil >= 3
    if 65537 < phi and gcd(65537, phi) == 1:
        e = 65537
    else:
        e = 3
        while e < phi:
            if gcd(e, phi) == 1:
                break
            e += 2

    if e >= phi:
        raise ValueError("Tidak ditemukan nilai e yang valid untuk p dan q ini!")

    # 5. Hitung Private Exponent d
    d = mod_inverse(e, phi)
    if d is None:
        raise ValueError("Gagal menghitung nilai d (Modular Inverse).")

    return {
        "p": p,
        "q": q,
        "n": n,
        "phi": phi,
        "e": e,
        "d": d,
        "public_key": (e, n),
        "private_key": (d, n)
    }
