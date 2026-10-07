"""
main.py
Program utama server HTTP (Python Standard Library).
Bertugas melayani file UI dan endpoint API untuk RSA tanpa library external/framework.
"""

import http.server
import socketserver
import json
import os
import sys

# Daftarkan folder saat ini ke path Python
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from rsa import generate_keys, encrypt_text, decrypt_text

PORT = 8000
UI_DIR = os.path.join(BASE_DIR, "ui")


class RSAAppRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Handler HTTP khusus yang melayani static file dari folder ui/
    serta menyediakan endpoint API POST untuk modul RSA.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=UI_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        # 1. Endpoint Generate Key RSA
        if self.path == '/api/generate-key':
            try:
                p = int(data.get('p'))
                q = int(data.get('q'))
                result = generate_keys(p, q)
                self.send_json_response(200, result)
            except Exception as e:
                self.send_json_response(400, {"error": str(e)})

        # 2. Endpoint Enkripsi RSA
        elif self.path == '/api/encrypt':
            try:
                text = data.get('text', '')
                public_key = data.get('publicKey', {})
                e = int(public_key.get('e'))
                n = int(public_key.get('n'))
                
                ciphertext = encrypt_text(text, (e, n))
                self.send_json_response(200, {
                    "text": text,
                    "ciphertext": ciphertext,
                    "publicKey": {"e": e, "n": n}
                })
            except Exception as e:
                self.send_json_response(400, {"error": str(e)})

        # 3. Endpoint Dekripsi RSA
        elif self.path == '/api/decrypt':
            try:
                ciphertext = data.get('ciphertext', [])
                private_key = data.get('privateKey', {})
                d = int(private_key.get('d'))
                n = int(private_key.get('n'))
                
                plaintext = decrypt_text(ciphertext, (d, n))
                self.send_json_response(200, {
                    "ciphertext": ciphertext,
                    "plaintext": plaintext,
                    "privateKey": {"d": d, "n": n}
                })
            except Exception as e:
                self.send_json_response(400, {"error": str(e)})

        else:
            self.send_json_response(404, {"error": "Endpoint API tidak ditemukan"})

    def send_json_response(self, status_code, content):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(content, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), RSAAppRequestHandler) as httpd:
        print("==================================================")
        print("  SERVER APLIKASI PENYIMPANAN PASSWORD RSA")
        print(f"  Server aktif di: http://localhost:{PORT}")
        print(f"  Menyajikan UI dari: {UI_DIR}")
        print("==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan oleh pengguna.")
            httpd.server_close()
