/* =====================================================
   UI SCRIPT (VANILLA JAVASCRIPT)
   Menangani event UI, localStorage, dan komunikasi ke Backend Python API.
   TIDAK BERISI IMPLEMENTASI MATEMATIKA RSA (Seluruh RSA di modul Python rsa/).
   ===================================================== */

// State Kunci RSA global di browser
let rsaKey = {
    p: null,
    q: null,
    n: null,
    phi: null,
    e: null,
    d: null,
    publicKey: null,
    privateKey: null
};


// =====================================================
// 1. GENERATE RSA KEY (Memanggil Backend Python API)
// =====================================================
async function generateKey() {
    const pInput = document.getElementById("p").value;
    const qInput = document.getElementById("q").value;

    if (!pInput || !qInput) {
        alert("Silakan masukkan nilai p dan q!");
        return;
    }

    const p = parseInt(pInput);
    const q = parseInt(qInput);

    try {
        const response = await fetch("/api/generate-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ p, q })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal menghasilkan kunci RSA.");
        }

        // Simpan kunci ke state JavaScript
        rsaKey.p = data.p;
        rsaKey.q = data.q;
        rsaKey.n = data.n;
        rsaKey.phi = data.phi;
        rsaKey.e = data.e;
        rsaKey.d = data.d;
        rsaKey.publicKey = { e: data.e, n: data.n };
        rsaKey.privateKey = { d: data.d, n: data.n };

        // Tampilkan ke UI
        document.getElementById("nResult").textContent = data.n;
        document.getElementById("phiResult").textContent = data.phi;
        document.getElementById("eResult").textContent = data.e;
        document.getElementById("dResult").textContent = data.d;

        document.getElementById("publicKeyResult").textContent = `(e = ${data.e}, n = ${data.n})`;
        document.getElementById("privateKeyResult").textContent = `(d = ${data.d}, n = ${data.n})`;

        alert("✅ RSA Key Pasangan Berhasil Dihasilkan oleh Backend Python!");
    } catch (err) {
        alert("⚠️ Error: " + err.message);
    }
}


// =====================================================
// 2. SIMPAN & ENKRIPSI PASSWORD
// =====================================================
async function savePassword() {
    if (!rsaKey.publicKey) {
        alert("⚠️ Silakan Generate Key RSA terlebih dahulu sebelum menyimpan password!");
        return;
    }

    const website = document.getElementById("website").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!website || !username || !password) {
        alert("⚠️ Semua field (Website, Username, dan Password) harus diisi!");
        return;
    }

    try {
        // Kirim password asli dan Public Key ke backend Python untuk dienkripsi
        const response = await fetch("/api/encrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: password,
                publicKey: rsaKey.publicKey
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal melakukan enkripsi RSA.");
        }

        const ciphertext = data.ciphertext; // Array of numbers

        // Ambil data localStorage saat ini
        let storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];

        // Buat objek data baru
        // CATATAN: Yang disimpan di localStorage ADALAH ciphertext, BUKAN password asli!
        const newEntry = {
            id: Date.now(),
            website: website,
            username: username,
            encryptedPassword: ciphertext
        };

        storedPasswords.push(newEntry);
        localStorage.setItem("rsaPasswords", JSON.stringify(storedPasswords));

        // Tampilkan hasil proses enkripsi di UI
        document.getElementById("originalPassword").textContent = password;
        document.getElementById("encryptedPassword").textContent = JSON.stringify(ciphertext);

        // Reset form input
        document.getElementById("website").value = "";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

        // Refresh daftar password
        displayPasswords();

        alert("🔒 Password berhasil dienkripsi dengan Public Key dan disimpan ke localStorage!");
    } catch (err) {
        alert("⚠️ Error: " + err.message);
    }
}


// =====================================================
// 3. TAMPILKAN DAFTAR PASSWORD (DARI LOCALSTORAGE)
// =====================================================
function displayPasswords() {
    const container = document.getElementById("passwordList");
    const storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];

    if (storedPasswords.length === 0) {
        container.innerHTML = `<p class="empty-state">Belum ada password yang tersimpan di localStorage.</p>`;
        return;
    }

    container.innerHTML = "";

    storedPasswords.forEach((item) => {
        const card = document.createElement("div");
        card.className = "password-card";

        const cipherStr = JSON.stringify(item.encryptedPassword);

        card.innerHTML = `
            <div class="password-card-header">
                <h3>🌐 ${escapeHTML(item.website)}</h3>
                <span class="username-tag">👤 ${escapeHTML(item.username)}</span>
            </div>
            
            <p style="font-size: 13px; font-weight: 600; color: #4a5568;">Ciphertext (Terenkripsi RSA):</p>
            <div class="ciphertext-display">${escapeHTML(cipherStr)}</div>

            <div style="margin-top: 12px;">
                <button type="button" class="btn btn-decrypt" onclick="decryptPassword(${item.id})">
                    🔓 Dekripsi / Lihat Password
                </button>
                <button type="button" class="btn btn-delete" onclick="deletePassword(${item.id})">
                    🗑️ Hapus
                </button>
            </div>

            <div id="decrypted-${item.id}" class="decrypted-box"></div>
        `;

        container.appendChild(card);
    });
}


// =====================================================
// 4. DEKRIPSI PASSWORD (MEMANGGIL PYTHON API)
// =====================================================
async function decryptPassword(id) {
    if (!rsaKey.privateKey) {
        alert("⚠️ Key RSA belum tersedia atau belum di-generate! Silakan Generate Key terlebih dahulu.");
        return;
    }

    const storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];
    const item = storedPasswords.find(p => p.id === id);

    if (!item) {
        alert("⚠️ Data password tidak ditemukan!");
        return;
    }

    try {
        // Kirim array ciphertext dan Private Key ke Python backend untuk didekripsi
        const response = await fetch("/api/decrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ciphertext: item.encryptedPassword,
                privateKey: rsaKey.privateKey
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal mendekripsi ciphertext.");
        }

        const resultBox = document.getElementById(`decrypted-${id}`);
        resultBox.style.display = "block";
        resultBox.innerHTML = `<strong>🔑 Password Asli (Hasil Dekripsi):</strong> <span style="font-size: 16px; font-weight: bold; color: #22543d;">${escapeHTML(data.plaintext)}</span>`;
    } catch (err) {
        alert("⚠️ Error Dekripsi: " + err.message);
    }
}


// =====================================================
// 5. HAPUS PASSWORD DARI LOCALSTORAGE
// =====================================================
function deletePassword(id) {
    let storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];
    storedPasswords = storedPasswords.filter(item => item.id !== id);
    localStorage.setItem("rsaPasswords", JSON.stringify(storedPasswords));
    displayPasswords();
}


// =====================================================
// UTILITY: ESCAPE HTML (Mencegah XSS)
// =====================================================
function escapeHTML(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Load daftar password saat halaman pertama kali dibuka
window.onload = function () {
    displayPasswords();
};
