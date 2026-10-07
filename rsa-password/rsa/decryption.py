"""
rsa/decryption.py
Modul khusus penanganan dekripsi RSA.
Rumus dasar: m = (c^d) mod n
"""

from .math_utils import mod_pow
from .converter import numbers_to_text


def decrypt_number(c: int, private_key) -> int:
    """
    Mendekripsi satu ciphertext c menggunakan Private Key (d, n).
    """
    if isinstance(private_key, (list, tuple)):
        d, n = private_key
    elif isinstance(private_key, dict):
        d = private_key.get("d")
        n = private_key.get("n")
    else:
        raise ValueError("Private key tidak valid! Harus berformat tuple/list (d, n) atau dict.")

    return mod_pow(c, d, n)


def decrypt_text(ciphertext: list, private_key) -> str:
    """
    Mendekripsi array ciphertext menjadi array angka ASCII lalu diubah kembali menjadi teks asli.
    """
    decrypted_numbers = [decrypt_number(c, private_key) for c in ciphertext]
    return numbers_to_text(decrypted_numbers)
