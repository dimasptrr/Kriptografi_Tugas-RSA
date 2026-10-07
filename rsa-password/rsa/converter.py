"""
rsa/converter.py
Modul konversi antara Text dan Angka (ASCII).
"""

def text_to_numbers(text: str) -> list:
    """
    Mengubah string teks menjadi list angka kode ASCII.
    Contoh: "A" -> [65]
    """
    return [ord(char) for char in text]


def numbers_to_text(numbers: list) -> str:
    """
    Mengubah list angka kode ASCII kembali menjadi string teks.
    Contoh: [65] -> "A"
    """
    return "".join(chr(int(num)) for num in numbers)
