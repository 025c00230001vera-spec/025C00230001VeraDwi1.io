// --- DATA SIMULATION BERDASARKAN SOURCE 11 & 12 ---
// Seluruh struktur data asli dipertahankan penuh tanpa merusak relasi dan penamaan 

const tb_operator =;

const tb_biaya_pelayanan =;

const tb_pasien_masuk =;

const tb_pasien_keluar =;

// --- LOGIC FUNCTIONS ---

/**
 * Fungsi inisialisasi utama aplikasi 
 */
function initApp() {
    renderDashboard();
    renderPasienMasuk();
    renderPasienKeluar();
    renderLayanan();
    renderLaporanDetail();
    initFormEvent();
    
    // Konfigurasi tanggal lokal Indonesia 
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

/**
 * Logika Alih Tab dan Navigasi Sidebar 
 */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
        
        const activeView = document.getElementById(target);
        if (activeView) {
            activeView.classList.add('active');
        }
        this.classList.add('active');
        document.getElementById('content-title').innerText = this.innerText;
    });
});

/**
 * Query Statis Pelayanan (Simulasi SQL: GROUP BY & HAVING COUNT >= 1) 
 */
function renderDashboard() {
    const statsBody = document.getElementById('body-stats');
    if (!statsBody) return;
    
    let totalPendapatan = 0;
    
    // Grouping & Filtering Logic 
    const stats = tb_biaya_pelayanan.map(pel => {
        const matchingPasien = tb_pasien_keluar.filter(p => p.kd_pel === pel.kd);
        const jumlah = matchingPasien.length;
        const total = matchingPasien.reduce((sum, item) => sum + item.total, 0);
        totalPendapatan += total;
        
        return { nama: pel.nama, jumlah, total };
    }).filter(s => s.jumlah >= 1); // HAVING COUNT >= 1 

    statsBody.innerHTML = stats.map(s => `
        <tr>
            <td><strong>${s.nama}</strong></td>
            <td><i class="fa-solid fa-user-group" style="color: var(--text-muted)"></i> ${s.jumlah} Pasien</td>
            <td><strong style="color: var(--primary)">Rp ${s.total.toLocaleString('id-ID')}</strong></td>
        </tr>
    `).join('');

    // Update KPI Card Widgets
    document.getElementById('stat-pendapatan').innerText = `Rp ${totalPendapatan.toLocaleString('id-ID')}`;
    document.getElementById('stat-pasien').innerText = tb_pasien_masuk.length;
}

/**
 * Merender tabel Pasien Masuk dengan representasi visual terstandarisasi 
 */
function renderPasienMasuk() {
    const body = document.getElementById('body-pasien-masuk');
    if (!body) return;

    body.innerHTML = tb_pasien_masuk.map(p => {
        const badgeClass = p.status === 'BPJS'? 'badge-bpjs' : 'badge-umum';
        return `
            <tr>
                <td><strong>${p.reg}</strong></td>
                <td><strong>${p.nama}</strong></td>
                <td>${p.umur} Th / ${p.sex}</td>
                <td>${p.diagnosa}</td>
                <td><i class="fa-regular fa-clock"></i> ${p.tgl_masuk}</td>
                <td><span class="badge ${badgeClass}">${p.status}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Merender tabel Pasien Keluar 
 */
function renderPasienKeluar() {
    const body = document.getElementById('body-pasien-keluar');
    if (!body) return;

    body.innerHTML = tb_pasien_keluar.map(p => `
        <tr>
            <td><strong>${p.kode}</strong></td>
            <td><span class="text-muted">${p.reg}</span></td>
            <td><i class="fa-regular fa-calendar-check"></i> ${p.tgl_keluar}</td>
            <td><span class="badge badge-umum">${p.lama} Hari</span></td>
            <td><strong>${p.kd_pel}</strong></td>
            <td><strong style="color: var(--secondary)">Rp ${p.total.toLocaleString('id-ID')}</strong></td>
        </tr>
    `).join('');
}

/**
 * Merender tabel Layanan Rawat Inap 
 */
function renderLayanan() {
    const body = document.getElementById('body-layanan');
    if (!body) return;

    body.innerHTML = tb_biaya_pelayanan.map(l => `
        <tr>
            <td><strong>${l.kd}</strong></td>
            <td><strong>${l.nama}</strong></td>
            <td><strong style="color: var(--primary)">Rp ${l.biaya.toLocaleString('id-ID')}</strong></td>
            <td><span class="text-muted">${l.ket}</span></td>
        </tr>
    `).join('');
}

/**
 * JOIN Query Lengkap Multitabel (Simulasi SQL: INNER JOIN Relasional) 
 */
function renderLaporanDetail() {
    const body = document.getElementById('body-laporan-lengkap');
    if (!body) return;
    
    const joinedData = tb_pasien_keluar.map(pk => {
        const pm = tb_pasien_masuk.find(p => p.reg === pk.reg);
        const bp = tb_biaya_pelayanan.find(b => b.kd === pk.kd_pel);
        const op = tb_operator.find(o => o.id === pk.id_op);
        
        // Penanganan kondisi aman jika ada data yang kosong (Null-Safety) 
        const namaPasien = pm? pm.nama : 'Tidak Diketahui';
        const diagnosa = pm? pm.diagnosa : 'N/A';
        const tglMasuk = pm? pm.tgl_masuk : 'N/A';
        const namaLayanan = bp? bp.nama : 'N/A';
        const namaOperator = op? op.nama : 'Sistem';
        
        return `
            <tr>
                <td><strong>${namaPasien}</strong></td>
                <td>${diagnosa}</td>
                <td>${tglMasuk}</td>
                <td>${pk.tgl_keluar}</td>
                <td><span class="badge badge-bpjs">${pk.lama} Hari</span></td>
                <td>${namaLayanan}</td>
                <td><strong style="color: var(--primary)">Rp ${pk.total.toLocaleString('id-ID')}</strong></td>
                <td><i class="fa-solid fa-user-shield"></i> ${namaOperator}</td>
            </tr>
        `;
    }).join('');
    
    body.innerHTML = joinedData;
}

/**
 * Inisialisasi Event Listener Formulir untuk Interaktivitas Dinamis
 */
function initFormEvent() {
    const form = document.getElementById('form-registrasi-pasien');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Mengambil Nilai dari Kontrol Input
        const nama = document.getElementById('reg-nama').value;
        const sex = document.getElementById('reg-sex').value;
        const umur = parseInt(document.getElementById('reg-umur').value);
        const tgl_masuk = document.getElementById('reg-tgl').value;
        const diagnosa = document.getElementById('reg-diagnosa').value;
        const status = document.getElementById('reg-status').value;
        const id_op = parseInt(document.getElementById('reg-operator').value);
        const penjamin = status === 'BPJS'? 'BPJS Kesehatan' : 'Pribadi';

        // Mengenerasi Nomor Registrasi Baru Secara Sekuensial
        const nextRegNum = tb_pasien_masuk.length + 1;
        const reg = `REG2024${String(nextRegNum).padStart(3, '0')}`;

        // Memasukkan Data Baru ke Tabel Simulasi Pasien Masuk 
        tb_pasien_masuk.push({
            reg, nama, sex, umur, tgl_masuk, diagnosa, status, penjamin, id_op
        });

        // Rendering Ulang Seluruh Komponen Dinamis 
        renderDashboard();
        renderPasienMasuk();
        renderLaporanDetail();

        // Reset Formulir dan Tampilkan Notifikasi Sukses
        form.reset();
        alert(`Pasien ${nama} (${reg}) Berhasil Ditambahkan ke Sistem.`);
    });
}

// Menjalankan Aplikasi Setelah Seluruh DOM Siap
document.addEventListener('DOMContentLoaded', initApp);