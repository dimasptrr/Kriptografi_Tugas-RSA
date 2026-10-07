"""
rsa/encryption.py
Modul khusus penanganan enkripsi RSA.
Rumus dasar: c = (m^e) mod n
"""

from .math_utils import mod_pow
from .converter import text_to_numbers


def encrypt_number(m: int, public_key) -> int:
    """
    Menenkripsi satu bilangan m menggunakan Public Key (e, n).
    """
    if isinstance(public_key, (list, tuple)):
        e, n = public_key
    elif isinstance(public_key, dict):
        e = public_key.get("e")
        n = public_key.get("n")
    else:
        raise ValueError("Public key tidak valid! Harus berformat tuple/list (e, n) atau dict.")

    if m >= n:
        raise ValueError(f"Nilai karakter ({m}) lebih besar/sama dengan modulus n ({n}). Pilih p dan q yang lebih besar!")

    return mod_pow(m, e, n)


def encrypt_text(text: str, public_key) -> list:
    """
    Mengubah teks menjadi array angka ASCII lalu menenkripsi tiap angka dengan Public Key.
    Mengembalikan array ciphertext (list of integers).
    """
    numbers = text_to_numbers(text)
    return [encrypt_number(m, public_key) for m in numbers]
