/* =====================================================
   UI SCRIPT (VANILLA JAVASCRIPT)
   Menangani interaksi UI, state management, modal,
   localStorage, dan komunikasi ke Backend Python API.
   ===================================================== */

// State Kunci RSA aktif di browser
let rsaKeyActive = null;


// =====================================================
// 1. INSISIALISASI SAAT HALAMAN DIBUKA
// =====================================================
window.onload = function () {
    // Coba ambil RSA Key yang tersimpan dari localStorage (jika ada)
    // CATATAN: Pendekatan menyimpan rsaKeyActive di localStorage ini digunakan khusus 
    // untuk demonstrasi tugas kuliah agar key pair tetap konsisten saat halaman di-reload.
    const savedKey = localStorage.getItem("rsaKeyActive");

    if (savedKey) {
        try {
            rsaKeyActive = JSON.parse(savedKey);
            updateKeyStatusUI();
        } catch (e) {
            console.error("Gagal membaca rsaKeyActive dari storage", e);
        }
    }

    displayPasswords();
};


// =====================================================
// 2. MANAGEMENT KEY & STATUS RSA
// =====================================================
function handleGenerateKeyClick() {
    // Jika key sudah aktif, minta konfirmasi terlebih dahulu
    if (rsaKeyActive) {
        document.getElementById("confirmModal").style.display = "flex";
    } else {
        proceedGenerateKey();
    }
}

function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
}

async function proceedGenerateKey() {
    closeConfirmModal();

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
        rsaKeyActive = {
            p: data.p,
            q: data.q,
            n: data.n,
            phi: data.phi,
            e: data.e,
            d: data.d,
            publicKey: { e: data.e, n: data.n },
            privateKey: { d: data.d, n: data.n }
        };

        // Simpan key aktif ke localStorage agar tetap konsisten saat reload
        localStorage.setItem("rsaKeyActive", JSON.stringify(rsaKeyActive));

        // Update Tampilan UI
        updateKeyStatusUI();

        alert("RSA Key Pair Berhasil Dihasilkan oleh Backend Python!");
    } catch (err) {
        alert("⚠️ Error: " + err.message);
    }
}

function updateKeyStatusUI() {
    if (!rsaKeyActive) return;

    // Status Badge
    const badge = document.getElementById("keyStatusBadge");
    badge.className = "status-badge status-active";
    badge.textContent = "RSA Key Aktif";

    // Tampilkan detail nilai matematika
    document.getElementById("nResult").textContent = rsaKeyActive.n;
    document.getElementById("phiResult").textContent = rsaKeyActive.phi;
    document.getElementById("eResult").textContent = rsaKeyActive.e;
    document.getElementById("dResult").textContent = rsaKeyActive.d;

    document.getElementById("publicKeyResult").textContent = `(e = ${rsaKeyActive.e}, n = ${rsaKeyActive.n})`;
    document.getElementById("privateKeyResult").textContent = `(d = ${rsaKeyActive.d}, n = ${rsaKeyActive.n})`;

    document.getElementById("keyDetailsBox").style.display = "block";

    // Tampilkan Section Pilih Aktivitas
    document.getElementById("activitySelectionSection").style.display = "block";
}


// =====================================================
// 3. SWITCH AKTIVITAS (SIMPAN / LIHAT PASSWORD)
// =====================================================
function switchActivity(type) {
    if (!rsaKeyActive) {
        alert("RSA Key belum tersedia. Silakan Generate Key terlebih dahulu!");
        return;
    }

    const cardSave = document.getElementById("cardSave");
    const cardView = document.getElementById("cardView");
    const saveSec = document.getElementById("savePasswordSection");
    const viewSec = document.getElementById("viewPasswordSection");

    if (type === 'save') {
        cardSave.classList.add("active-activity");
        cardView.classList.remove("active-activity");

        saveSec.style.display = "block";
        viewSec.style.display = "none";
    } else if (type === 'view') {
        cardView.classList.add("active-activity");
        cardSave.classList.remove("active-activity");

        viewSec.style.display = "block";
        saveSec.style.display = "none";

        displayPasswords();
    }
}


// =====================================================
// 4. SIMPAN PASSWORD (ENKRIPSI MENGGUNAKAN PUBLIC KEY)
// =====================================================
async function savePassword() {
    if (!rsaKeyActive) {
        alert("Silakan Generate Key RSA terlebih dahulu!");
        return;
    }

    const website = document.getElementById("website").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!website || !username || !password) {
        alert("Semua field (Website, Username, dan Password) harus diisi!");
        return;
    }

    try {
        // Enkripsi password menggunakan Public Key RSA di Backend Python
        const response = await fetch("/api/encrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: password,
                publicKey: rsaKeyActive.publicKey
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal melakukan enkripsi RSA.");
        }

        const ciphertext = data.ciphertext;

        // Ambil data dari localStorage
        let storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];

        // CATATAN: Yang disimpan di localStorage ADALAH array ciphertext, BUKAN password asli!
        const newEntry = {
            id: Date.now(),
            website: website,
            username: username,
            encryptedPassword: ciphertext,
            keyModulus: rsaKeyActive.n // Digunakan untuk validasi kesesuaian key
        };

        storedPasswords.push(newEntry);
        localStorage.setItem("rsaPasswords", JSON.stringify(storedPasswords));

        // Tampilkan hasil proses enkripsi ke UI
        document.getElementById("originalPassword").textContent = password;
        document.getElementById("encryptedPassword").textContent = JSON.stringify(ciphertext);
        document.getElementById("saveResultBox").style.display = "block";

        // Reset input form
        document.getElementById("website").value = "";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

        alert("Password berhasil dienkripsi dengan Public Key dan disimpan ke localStorage!");
    } catch (err) {
        alert("⚠️ Error: " + err.message);
    }
}


// =====================================================
// 5. TAMPILKAN DAFTAR PASSWORD (DARI LOCALSTORAGE)
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
                <h3>${escapeHTML(item.website)}</h3>
                <span class="username-tag" style="font-size: 12px; color: #718096;">Username: ${escapeHTML(item.username)}</span>
            </div>
            
            <p style="font-size: 12px; font-weight: 600; color: #4a5568;">Ciphertext (Terenkripsi RSA):</p>
            <div class="ciphertext-display">${escapeHTML(cipherStr)}</div>

            <div style="margin-top: 12px;">
                <button type="button" class="btn btn-decrypt" onclick="decryptPassword(${item.id})">
                    Dekripsi Password
                </button>
                <button type="button" class="btn btn-delete" onclick="deletePassword(${item.id})">
                    Hapus
                </button>
            </div>

            <div id="decrypted-${item.id}" class="decrypted-box"></div>
            <div id="error-${item.id}" class="error-box"></div>
        `;

        container.appendChild(card);
    });
}


// =====================================================
// 6. DEKRIPSI PASSWORD (MENGGUNAKAN PRIVATE KEY AKTIF)
// =====================================================
async function decryptPassword(id) {
    const resultBox = document.getElementById(`decrypted-${id}`);
    const errorBox = document.getElementById(`error-${id}`);

    resultBox.style.display = "none";
    errorBox.style.display = "none";

    if (!rsaKeyActive) {
        errorBox.style.display = "block";
        errorBox.textContent = "RSA Key belum tersedia. Silakan Generate Key terlebih dahulu!";
        return;
    }

    const storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];
    const item = storedPasswords.find(p => p.id === id);

    if (!item) {
        alert("Data password tidak ditemukan!");
        return;
    }

    try {
        // Dekripsi ciphertext menggunakan Private Key aktif di Backend Python
        const response = await fetch("/api/decrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ciphertext: item.encryptedPassword,
                privateKey: rsaKeyActive.privateKey
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal mendekripsi ciphertext.");
        }

        resultBox.style.display = "block";
        resultBox.innerHTML = `<strong>Password Asli (Hasil Dekripsi):</strong> <span style="font-size: 15px; font-weight: bold; color: #22543d; font-family: monospace;">${escapeHTML(data.plaintext)}</span>`;
    } catch (err) {
        errorBox.style.display = "block";
        errorBox.textContent = "Ciphertext tidak dapat didekripsi menggunakan RSA Key aktif saat ini.";
    }
}


// =====================================================
// 7. HAPUS PASSWORD DARI LOCALSTORAGE
// =====================================================
function deletePassword(id) {
    let storedPasswords = JSON.parse(localStorage.getItem("rsaPasswords")) || [];
    storedPasswords = storedPasswords.filter(item => item.id !== id);
    localStorage.setItem("rsaPasswords", JSON.stringify(storedPasswords));
    displayPasswords();
}


// Utility: ESCAPE HTML (Mencegah XSS Injection)
function escapeHTML(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
