/**
 * peminjaman_db.js
 * Modul Database & Service untuk Sistem Peminjaman Kendaraan KUK HR Portal
 * Tersinkronisasi cloud database (Google Apps Script) agar data sinkron di semua device/browser.
 */

const PeminjamanDB = (() => {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5sEI1iGmVG28508s9QumeFm19-Zc9cnzoNMOSWtap4pm-ktnWRABDGOTCHNL0rwfS/exec";
  const STORAGE_KEY_KENDARAAN = 'kuk_db_kendaraan_v2';
  const STORAGE_KEY_PEMINJAMAN = 'kuk_db_peminjaman_v2';

  // 4 Kendaraan operasional KUK sesuai permintaan
  const DEFAULT_KENDARAAN = [
    {
      id: 'KND-L300',
      nama: 'Mitsubishi L300',
      plat: 'L300',
      jenis: 'Pick Up / Angkutan Logistik',
      icon: '🚚',
      status: 'Tersedia'
    },
    {
      id: 'KND-ENGKEL',
      nama: 'Truk Engkel',
      plat: 'Engkel',
      jenis: 'Truk Muatan / Kargo',
      icon: '🚛',
      status: 'Tersedia'
    },
    {
      id: 'KND-VIAR',
      nama: 'Viar Roda Tiga',
      plat: 'Viar',
      jenis: 'Angkutan Operasional / Gudang',
      icon: '🛺',
      status: 'Tersedia'
    },
    {
      id: 'KND-FORKLIFT',
      nama: 'Forklift',
      plat: 'Forklift',
      jenis: 'Alat Berat Operasional Gudang',
      icon: '🏗️',
      status: 'Tersedia'
    }
  ];

  // Daftar 105 Kamar / Instansi
  const DAFTAR_KAMAR = [
    "Pemberkasan Beasiswa Mesir",
    "Staf Yayasan (YPPWPM)",
    "Perdos UNIDA Siman",
    "Darussalam Computer Centre (DCC)",
    "Islamic Center Gontor (ICG) Madiun",
    "Staf ICT (Information and Communication Technology)",
    "Kantor Kopontren",
    "Tempat Pengelolaan Sampah (TPS)",
    "Pembimbing Jam'iyyatul Qurra' Wal Huffadz (Midho'ah Lt. 2)",
    "Pembimbing Pelajaran Sore (Saudi 1 Lt. 1)",
    "Islamic Center Joresan",
    "Kantor Panitia 100 Tahun Gontor",
    "Perpustakaan UNIDA Kampus Rabithah",
    "Gontor Mini Soccer",
    "Pembimbing Bahasa (Language Advisory Council)",
    "Staf Pengasuhan Santri",
    "Majalah Gontor",
    "Raya Department Store (Mantingan)",
    "Gontor TV",
    "Staf Pasca UNIDA Kampus Putri Mantingan",
    "Wartel Rabithah",
    "Dapur Guru",
    "La Tansa Transport Unit 2 (Komplek Stadion)",
    "Staf KMI",
    "La Tansa Laundry",
    "Wartel Sudan",
    "Darussalam Press (Unit 1)",
    "Pusat Data",
    "Bagian Perlistrikan Pondok",
    "Darussalam Gontor Audio (Indonesia 1.1)",
    "Staf Administrasi Pondok",
    "Toko Bangunan Mantingan",
    "Pembimbing Rayon Nin-Xia",
    "La Tansa Konfeksi (Unit 1)",
    "Staf Kantor Pusat IKPM",
    "Wartel Satelit",
    "Khizanah Kreasi Gontor",
    "Slep",
    "Staf Yayasan Penggemukan Sapi",
    "Staf Pembangunan UNIDA Kampus Siman",
    "MABIKORI (Wisma Hadi Lt. 1)",
    "Staf Sekretariat Pimpinan Pondok",
    "KUK Bangunan",
    "UKK Grosir dan Sayur",
    "Staf BAA UNIDA Kampus Robithoh",
    "Darussalam Gontor Stadium (DGS)",
    "Gambia Department Store",
    "Pabrik Teh dan Es Krim",
    "La Tansa Resto",
    "PT. Estafet Dwi Masa (ESDM) Wonosobo",
    "Staf Pembangunan",
    "Darussalam Laboratory",
    "KUK Palen",
    "La Tansa DC Mantingan",
    "Pembimbing Latihan Pidato dan Diskusi (Saudi 1 Lt. 1)",
    "Majalah Himmah",
    "La Tansa Transport Unit 1 (Gerbang Utama)",
    "Suargo FM",
    "PT. Estafet Dwi Masa (ESDM) Mlarak",
    "Baitul Mal Wa Tamwil (BMT) Gontor",
    "Staf Yasyfin",
    "La Tansa Transport Unit 3 (Saudi)",
    "Rumah Tebet",
    "Staf Administrasi UNIDA",
    "La Tansa Distributor Buku",
    "La Tansa Book Store",
    "Studio Rekaman Asia",
    "Staf Yayasan Budidaya Lele",
    "La Tansa DDC",
    "Guest Reception Advisory Council",
    "Pembimbing Luar Negeri",
    "Pembimbing MBGND (Satelit)",
    "Satelit Mart",
    "Darussalam Press (Unit 2)",
    "Staf Pemeliharaan Barang Wakaf dan Pertamanan",
    "Sekretaris UNIDA Gontor",
    "Kantor Badan Wakaf 1",
    "Staf BAA Pusat",
    "Staf Transportasi UNIDA Kampus Siman",
    "Air Minum Darussalam (AMIDAS)",
    "Dewan Mahasiswa (DEMA)",
    "Pabrik Roti",
    "La Tansa Stationery",
    "Markaz Khot",
    "Kantin Satelit",
    "Staf Sub Agen LPG",
    "Staf Pasca UNIDA Kampus Siman",
    "Staf Hubungan Masyarakat (Humas) PMDG",
    "La Tansa Sport",
    "Gontor Auto Service (GAS)",
    "Fotokopi (Baitul Millah)",
    "Pembimbing Jam'iyyatul Qurra' Wal Huffadz (Midho'ah Lt. 1)",
    "Balai Kesehatan Santri",
    "La Tansa Apotek",
    "Klinik Pratama Syifaa (Siman)",
    "Kantin Sudan (Koperasi Mahasiswa)",
    "Kantor Badan Wakaf 2",
    "La Tansa Penyewaan GOR Bulutangkis (Ponorogo Kota)",
    "Perpustakaan Santri PMDG",
    "Islamic Center Slahung",
    "Pembimbing Dapur Umum",
    "Rumah Solo",
    "Khizanah Printing Gontor",
    "Perpustakaan UNIDA Kampus Siman",
    "Pengurus EMIS"
  ];

  // Data peminjaman contoh awal (jika database kosong)
  const DEFAULT_PEMINJAMAN = [
    {
      id: 'PINJAM-1720760000001',
      namaPeminjam: 'Fariz Akbar',
      kamar: 'KUK Bangunan',
      divisi: 'KUK Bangunan',
      kontak: '081234567890',
      kendaraanId: 'KND-L300',
      namaKendaraan: 'Mitsubishi L300',
      platKendaraan: 'L300',
      waktuMulai: '2026-07-12T08:00',
      waktuRencanaKembali: '2026-07-12T17:00',
      keperluan: 'Pengiriman barang pesanan kaca ke cabang pemasaran Bekasi.',
      status: 'Aktif/Dipinjam',
      waktuAktualKembali: null,
      kerusakan: null
    }
  ];

  function initDB() {
    if (!localStorage.getItem(STORAGE_KEY_KENDARAAN)) {
      localStorage.setItem(STORAGE_KEY_KENDARAAN, JSON.stringify(DEFAULT_KENDARAAN));
    }
    if (!localStorage.getItem(STORAGE_KEY_PEMINJAMAN)) {
      localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(DEFAULT_PEMINJAMAN));
    }
  }

  // --- CLOUD SYNC API ---
  function syncFromCloud() {
    return fetch(`${SCRIPT_URL}?action=getPeminjaman`)
      .then(r => r.json())
      .then(res => {
        if (res.result === 'success' && Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(res.data));
          return res.data;
        }
        return getPeminjamanList();
      })
      .catch(err => {
        console.warn('Gagal sinkron dari cloud, menggunakan local cache:', err);
        return getPeminjamanList();
      });
  }

  // --- KENDARAAN API ---
  function getKendaraanList() {
    initDB();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_KENDARAAN)) || DEFAULT_KENDARAAN;
    } catch (e) {
      return DEFAULT_KENDARAAN;
    }
  }

  function getKendaraanById(id) {
    const list = getKendaraanList();
    return list.find(k => k.id === id) || null;
  }

  function saveKendaraan(data) {
    let list = getKendaraanList();
    const existingIdx = list.findIndex(k => k.id === data.id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...data };
    } else {
      list.push({
        id: data.id || ('KND-' + Date.now()),
        nama: data.nama || 'Kendaraan Baru',
        plat: data.plat || '-',
        jenis: data.jenis || 'Operasional',
        icon: data.icon || '🚗',
        qrCode: data.qrCode || '',
        qrImage: data.qrImage || '',
        status: 'Tersedia'
      });
    }
    localStorage.setItem(STORAGE_KEY_KENDARAAN, JSON.stringify(list));
    return list;
  }

  function deleteKendaraan(id) {
    let list = getKendaraanList();
    list = list.filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEY_KENDARAAN, JSON.stringify(list));
    return list;
  }

  // Cek apakah kendaraan sedang aktif dipinjam
  function isKendaraanDipinjam(kendaraanId) {
    const pinjamList = getPeminjamanList();
    return pinjamList.some(p => p.kendaraanId === kendaraanId && p.status === 'Aktif/Dipinjam');
  }

  // --- PEMINJAMAN API ---
  function getPeminjamanList() {
    initDB();
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY_PEMINJAMAN)) || [];
      return list.sort((a, b) => new Date(b.waktuMulai) - new Date(a.waktuMulai));
    } catch (e) {
      return DEFAULT_PEMINJAMAN;
    }
  }

  function getPeminjamanById(id) {
    const list = getPeminjamanList();
    return list.find(p => p.id === id) || null;
  }

  function savePeminjaman(data) {
    const list = getPeminjamanList();
    const kendaraan = getKendaraanById(data.kendaraanId);

    const newRecord = {
      id: 'PINJAM-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      namaPeminjam: data.namaPeminjam.trim(),
      kamar: (data.kamar || data.divisi || '').trim(),
      divisi: (data.kamar || data.divisi || '').trim(),
      kontak: data.kontak.trim(),
      kendaraanId: data.kendaraanId,
      namaKendaraan: kendaraan ? kendaraan.nama : data.namaKendaraan || '-',
      platKendaraan: kendaraan ? kendaraan.plat : data.platKendaraan || '-',
      waktuMulai: data.waktuMulai,
      waktuRencanaKembali: data.waktuRencanaKembali,
      keperluan: data.keperluan.trim(),
      status: 'Aktif/Dipinjam',
      waktuAktualKembali: null,
      kerusakan: null,
      createdAt: new Date().toISOString()
    };

    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(list));

    // Kirim ke cloud database agar tersinkron ke seluruh device
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save_peminjaman',
        record: newRecord
      })
    }).catch(err => console.warn('Gagal simpan ke cloud:', err));

    return newRecord;
  }

  function selesaikanPeminjaman(id) {
    return updateStatus(id, 'Selesai');
  }

  function updateStatus(id, newStatus) {
    const list = getPeminjamanList();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: 'Data tidak ditemukan.' };

    list[index].status = newStatus;
    if (newStatus === 'Selesai') {
      list[index].waktuAktualKembali = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(list));

    // Kirim ke cloud database
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_status_peminjaman',
        id: id,
        newStatus: newStatus,
        aktualKembali: list[index].waktuAktualKembali
      })
    }).catch(err => console.warn('Gagal update status ke cloud:', err));

    return { success: true, data: list[index] };
  }

  function laporkanKerusakan(id, detailKerusakan, estimasiBiaya, tanggalKejadian) {
    const list = getPeminjamanList();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: 'Data tidak ditemukan.' };

    list[index].status = 'Rusak/Bermasalah';
    list[index].kerusakan = {
      detail: detailKerusakan.trim(),
      estimasiBiaya: Number(estimasiBiaya) || 0,
      tanggalKejadian: tanggalKejadian || new Date().toISOString().split('T')[0],
      dilaporkanPada: new Date().toISOString()
    };
    list[index].kerusakanDetail = detailKerusakan.trim();
    list[index].biayaPerbaikan = Number(estimasiBiaya) || 0;

    localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(list));

    // Kirim ke cloud database
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'laporkan_kerusakan_peminjaman',
        id: id,
        detail: detailKerusakan.trim(),
        estimasiBiaya: Number(estimasiBiaya) || 0,
        tanggalKejadian: list[index].kerusakan.tanggalKejadian
      })
    }).catch(err => console.warn('Gagal lapor kerusakan ke cloud:', err));

    return { success: true, data: list[index] };
  }

  return {
    initDB,
    syncFromCloud,
    getDaftarKamar: () => DAFTAR_KAMAR,
    getKendaraanList,
    getKendaraanById,
    saveKendaraan,
    deleteKendaraan,
    isKendaraanDipinjam,
    getPeminjamanList,
    getAllPeminjaman: getPeminjamanList,
    getPeminjamanById,
    getLoanById: getPeminjamanById,
    savePeminjaman,
    selesaikanPeminjaman,
    updateStatus,
    laporkanKerusakan
  };
})();

// Alias agar kompatibel dengan pemanggilan PeminjamanService di dashboard maupun PeminjamanDB di form
window.PeminjamanDB = PeminjamanDB;
window.PeminjamanService = PeminjamanDB;
