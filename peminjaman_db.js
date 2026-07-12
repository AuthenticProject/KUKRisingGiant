/**
 * peminjaman_db.js
 * Modul Database & Service untuk Sistem Peminjaman Kendaraan KUK HR Portal
 * Menyediakan kapabilitas manajemen data kendaraan, data peminjaman, status, dan kalkulasi ganti rugi.
 */

const PeminjamanDB = (() => {
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

  // Data peminjaman contoh awal
  const DEFAULT_PEMINJAMAN = [
    {
      id: 'PINJAM-1720760000001',
      namaPeminjam: 'Fariz Akbar',
      divisi: 'Logistik & Gudang',
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
    },
    {
      id: 'PINJAM-1720760000002',
      namaPeminjam: 'Andika',
      divisi: 'Operasional Gudang',
      kontak: '081987654321',
      kendaraanId: 'KND-FORKLIFT',
      namaKendaraan: 'Forklift',
      platKendaraan: 'Forklift',
      waktuMulai: '2026-07-11T09:00',
      waktuRencanaKembali: '2026-07-11T12:00',
      keperluan: 'Bongkar muat palet kaca dari kontainer.',
      status: 'Selesai',
      waktuAktualKembali: '2026-07-11T11:45',
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
      divisi: data.divisi.trim(),
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
    return newRecord;
  }

  function selesaikanPeminjaman(id) {
    const list = getPeminjamanList();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: 'Data tidak ditemukan.' };

    list[index].status = 'Selesai';
    list[index].waktuAktualKembali = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(list));
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
    localStorage.setItem(STORAGE_KEY_PEMINJAMAN, JSON.stringify(list));
    return { success: true, data: list[index] };
  }

  return {
    initDB,
    getKendaraanList,
    getKendaraanById,
    isKendaraanDipinjam,
    getPeminjamanList,
    getPeminjamanById,
    savePeminjaman,
    selesaikanPeminjaman,
    laporkanKerusakan
  };
})();
