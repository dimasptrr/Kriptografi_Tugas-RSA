"""
rsa/math_utils.py
Fungsi-fungsi matematika dasar untuk algoritma RSA.
Dibuat dari scratch tanpa library kriptografi pihak ketiga.
"""

def gcd(a: int, b: int) -> int:
    """
    Mencari Greatest Common Divisor (GCD / FPB) menggunakan Algoritma Euclidean.
    """
    while b != 0:
        a, b = b, a % b
    return a


def is_prime(n: int) -> bool:
    """
    Mengecek apakah bilangan n merupakan bilangan prima.
    """
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True


def mod_pow(base: int, exponent: int, modulus: int) -> int:
    """
    Menghitung perpangkatan modular: (base^exponent) mod modulus
    Menggunakan algoritma Exponentiation by Squaring.
    """
    result = 1
    base = base % modulus
    while exponent > 0:
        if exponent % 2 == 1:
            result = (result * base) % modulus
        base = (base * base) % modulus
        exponent //= 2
    return result


def extended_gcd(a: int, b: int):
    """
    Extended Euclidean Algorithm.
    Mengembalikan (gcd, x, y) sehingga a*x + b*y = gcd(a, b)
    """
    if a == 0:
        return b, 0, 1
    gcd_val, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd_val, x, y


def mod_inverse(e: int, phi: int) -> int:
    """
    Mencari d (Modular Multiplicative Inverse) sehingga:
    (e * d) mod phi = 1
    """
    gcd_val, x, _ = extended_gcd(e, phi)
    if gcd_val != 1:
        return None
    return (x % phi + phi) % phi
