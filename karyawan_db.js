/**
 * karyawan_db.js
 * Modul Database & Service untuk Manajemen Rekrutmen (Hire Karyawan Baru) & Rekontrak Karyawan Lama
 * KUK HR Portal - Tersinkronisasi cloud database (Google Apps Script), local storage cache, dan Notifikasi H-1.
 */

const KaryawanDB = (() => {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5sEI1iGmVG28508s9QumeFm19-Zc9cnzoNMOSWtap4pm-ktnWRABDGOTCHNL0rwfS/exec";
  const STORAGE_KEY_REKRUTMEN = 'kuk_db_rekrutmen_v1';
  const STORAGE_KEY_REKONTRAK = 'kuk_db_rekontrak_v1';
  const STORAGE_KEY_GAJI_HISTORI = 'kuk_db_gaji_v1';
  const STORAGE_KEY_SURAT_HISTORI = 'kuk_db_surat_v1';

  // Data contoh rekapan gaji bulan-bulan sebelumnya
  const DEFAULT_GAJI_HISTORI = [
    {
      id: 'PAY-2026-06-001',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      jabatan: 'Kepala Gudang Bangunan',
      toko: 'bangunan',
      bulanTahun: '2026-06',
      periodeLabel: 'Juni 2026',
      gajiPokok: 3800000,
      tunjangan: 350000,
      potongan: 50000,
      totalGaji: 4100000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-06-28',
      catatan: 'Gaji Pokok + Tunjangan Jabatan',
      nomorSlip: 'SLIP-KUK-202606-001'
    },
    {
      id: 'PAY-2026-06-002',
      idKaryawan: 'KRY-002',
      namaLengkap: 'Dewi Lestari',
      jabatan: 'Staf Administrasi & Keuangan',
      toko: 'bangunan',
      bulanTahun: '2026-06',
      periodeLabel: 'Juni 2026',
      gajiPokok: 3500000,
      tunjangan: 300000,
      potongan: 0,
      totalGaji: 3800000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-06-28',
      catatan: 'Gaji Pokok + Tunjangan Kehadiran',
      nomorSlip: 'SLIP-KUK-202606-002'
    },
    {
      id: 'PAY-2026-06-003',
      idKaryawan: 'KRY-003',
      namaLengkap: 'Fajar Nugroho',
      jabatan: 'Staf Pelayanan & Gudang Palen',
      toko: 'palen',
      bulanTahun: '2026-06',
      periodeLabel: 'Juni 2026',
      gajiPokok: 3200000,
      tunjangan: 250000,
      potongan: 25000,
      totalGaji: 3425000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-06-28',
      catatan: 'Gaji Pokok + Bonus Lembur',
      nomorSlip: 'SLIP-KUK-202606-003'
    },
    {
      id: 'PAY-2026-05-001',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      jabatan: 'Kepala Gudang Bangunan',
      toko: 'bangunan',
      bulanTahun: '2026-05',
      periodeLabel: 'Mei 2026',
      gajiPokok: 3800000,
      tunjangan: 350000,
      potongan: 0,
      totalGaji: 4150000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-05-28',
      catatan: 'Gaji Pokok Periode Mei 2026',
      nomorSlip: 'SLIP-KUK-202605-001'
    },
    {
      id: 'PAY-2026-05-002',
      idKaryawan: 'KRY-002',
      namaLengkap: 'Dewi Lestari',
      jabatan: 'Staf Administrasi & Keuangan',
      toko: 'bangunan',
      bulanTahun: '2026-05',
      periodeLabel: 'Mei 2026',
      gajiPokok: 3500000,
      tunjangan: 300000,
      potongan: 50000,
      totalGaji: 3750000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-05-28',
      catatan: 'Gaji Pokok Periode Mei 2026',
      nomorSlip: 'SLIP-KUK-202605-002'
    },
    {
      id: 'PAY-2026-04-001',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      jabatan: 'Kepala Gudang Bangunan',
      toko: 'bangunan',
      bulanTahun: '2026-04',
      periodeLabel: 'April 2026',
      gajiPokok: 3800000,
      tunjangan: 400000,
      potongan: 0,
      totalGaji: 4200000,
      statusPembayaran: 'Lunas / Ditransfer',
      tglDibayar: '2026-04-28',
      catatan: 'Gaji Pokok + Bonus Hari Raya 2026',
      nomorSlip: 'SLIP-KUK-202604-001'
    }
  ];

  // Data contoh arsip surat & korespondensi yang pernah dicetak
  const DEFAULT_SURAT_HISTORI = [
    {
      id: 'DOC-2026-001',
      nomorSurat: '012/PKWT-REKONTRAK/KUK/V/2026',
      jenisSurat: 'Surat Rekontrak (PKWT)',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      toko: 'bangunan',
      tglCetak: '2026-05-31',
      periodeKontrak: '2026-06-01 s/d 2027-05-31',
      gajiPokok: 'Rp 3.800.000',
      status: 'Diarsipkan & TTD Lengkap',
      ttdCalon: 'Hendra S.',
      ttdPimpinan: 'Pimpinan KUK',
      catatan: 'Perpanjangan kontrak tahunan KUK Bangunan'
    },
    {
      id: 'DOC-2026-002',
      nomorSurat: '013/PKWT-REKONTRAK/KUK/V/2026',
      jenisSurat: 'Surat Rekontrak (PKWT)',
      idKaryawan: 'KRY-002',
      namaLengkap: 'Dewi Lestari',
      toko: 'bangunan',
      tglCetak: '2026-05-31',
      periodeKontrak: '2026-06-01 s/d 2027-05-31',
      gajiPokok: 'Rp 3.500.000',
      status: 'Diarsipkan & TTD Lengkap',
      ttdCalon: 'Dewi L.',
      ttdPimpinan: 'Pimpinan KUK',
      catatan: 'Perpanjangan kontrak tahunan KUK Bangunan'
    },
    {
      id: 'DOC-2026-003',
      nomorSurat: 'SLIP-KUK-202606-001',
      jenisSurat: 'Slip Gaji Bulanan',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      toko: 'bangunan',
      tglCetak: '2026-06-28',
      periodeKontrak: 'Periode Juni 2026',
      gajiPokok: 'Rp 4.100.000',
      status: 'Terbit / Diserahkan',
      ttdCalon: 'Hendra S.',
      ttdPimpinan: 'Finance KUK',
      catatan: 'Slip Gaji Juni 2026'
    }
  ];

  // Data contoh pelamar awal dari Drive Formulir Rekrutmen KUK
  const DEFAULT_REKRUTMEN = [
    {
      id: 'CALON-101',
      namaLengkap: 'Bagus Setyawan',
      posisiDilamar: 'Staf Operasional & Gudang',
      toko: 'bangunan',
      noHp: '081234567811',
      email: 'bagus.setyawan@gmail.com',
      pendidikan: 'SMA / SMK Sederajat',
      tanggalLamar: '2026-07-15',
      sumberDrive: 'Formulir Rekrutmen Google Drive (ID: Resp-8821)',
      linkCvDrive: 'https://drive.google.com/file/d/sample_cv_bagus/view',
      statusPipeline: 'Seleksi Berkas / Wawancara',
      evaluasiTraining: null,
      kontrakTtd: null,
      catatanHR: 'Berkas lengkap, pengalaman 2 tahun di bidang logistik.'
    },
    {
      id: 'CALON-102',
      namaLengkap: 'Siti Nurhaliza',
      posisiDilamar: 'Kasir & Admin Palen',
      toko: 'palen',
      noHp: '081987654322',
      email: 'siti.nurhaliza22@gmail.com',
      pendidikan: 'D3 Akuntansi',
      tanggalLamar: '2026-07-10',
      sumberDrive: 'Formulir Rekrutmen Google Drive (ID: Resp-8815)',
      linkCvDrive: 'https://drive.google.com/file/d/sample_cv_siti/view',
      statusPipeline: 'Masa Training (3 Bulan)',
      evaluasiTraining: {
        nilaiDisiplin: 88,
        nilaiKeterampilan: 90,
        nilaiSikap: 92,
        catatan: 'sangat cekatan dalam mengoperasikan sistem kasir dan ramah kepada pelanggan.'
      },
      kontrakTtd: null,
      catatanHR: 'Sedang menjalani training bulan ke-2 di KUK Palen.'
    },
    {
      id: 'CALON-103',
      namaLengkap: 'Rizky Ramadhan',
      posisiDilamar: 'Supir Armada Logistik (L300/Engkel)',
      toko: 'bangunan',
      noHp: '085678912344',
      email: 'rizky.rama@gmail.com',
      pendidikan: 'SMA / SMK Sederajat',
      tanggalLamar: '2026-07-02',
      sumberDrive: 'Formulir Rekrutmen Google Drive (ID: Resp-8790)',
      linkCvDrive: 'https://drive.google.com/file/d/sample_cv_rizky/view',
      statusPipeline: 'Diangkat Karyawan (Menunggu Kontrak)',
      evaluasiTraining: {
        nilaiDisiplin: 95,
        nilaiKeterampilan: 90,
        nilaiSikap: 90,
        catatan: 'Rapi dalam merawat armada dan pengiriman tepat waktu.'
      },
      kontrakTtd: null,
      catatanHR: 'Lolos masa training dengan memuaskan. Siap penandatanganan PKWT.'
    }
  ];

  // Data contoh karyawan lama untuk pemantauan & perpanjangan kontrak (Rekontrak setahun, terakhir 31 Mei 2026)
  // Data 12 karyawan aktif untuk pemantauan & perpanjangan kontrak (Rekontrak diadakan 31 Mei 2026, berikutnya 31 Mei 2027)
  const DEFAULT_REKONTRAK = [
    {
      id: 'KRY-KONTRAK-01',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      jabatan: 'Kepala Gudang Bangunan',
      toko: 'bangunan',
      noHp: '081345678901',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31', // Rekontrak 31 Mei 2026 -> Periode Aktif hingga 31 Mei 2027
      gajiPokok: 'Rp 3.800.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Kinerja konsisten baik, rekomendasi perpanjangan rekontrak 1 tahun.'
    },
    {
      id: 'KRY-KONTRAK-02',
      idKaryawan: 'KRY-002',
      namaLengkap: 'Dewi Lestari',
      jabatan: 'Staf Administrasi & Keuangan',
      toko: 'bangunan',
      noHp: '081298765432',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.500.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Aktif mengelola administrasi pembukuan harian.'
    },
    {
      id: 'KRY-KONTRAK-03',
      idKaryawan: 'KRY-003',
      namaLengkap: 'Fajar Nugroho',
      jabatan: 'Staf Pelayanan & Gudang Palen',
      toko: 'palen',
      noHp: '085712345678',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.200.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Rajin dan dapat diandalkan saat jam sibuk toko.'
    },
    {
      id: 'KRY-KONTRAK-04',
      idKaryawan: 'KRY-004',
      namaLengkap: 'Miftah',
      jabatan: 'Staf Operasional Palen',
      toko: 'palen',
      noHp: '085711223344',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.200.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Kinerja teratur dalam pelayanan dan penataan stok.'
    },
    {
      id: 'KRY-KONTRAK-05',
      idKaryawan: 'KRY-005',
      namaLengkap: 'Nukul',
      jabatan: 'Staf Gudang Palen',
      toko: 'palen',
      noHp: '085755667788',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.200.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Penanganan barang di gudang sangat rapi.'
    },
    {
      id: 'KRY-KONTRAK-06',
      idKaryawan: 'KRY-006',
      namaLengkap: 'Raju',
      jabatan: 'Staf Pelayanan Palen',
      toko: 'palen',
      noHp: '085799887766',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.200.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Cepat dalam merespons kebutuhan customer.'
    },
    {
      id: 'KRY-KONTRAK-07',
      idKaryawan: 'KRY-007',
      namaLengkap: 'Agheea',
      jabatan: 'Kasir Palen',
      toko: 'palen',
      noHp: '085733445566',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.300.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Transaksi kasir teliti dan minim selisih.'
    },
    {
      id: 'KRY-KONTRAK-08',
      idKaryawan: 'KRY-008',
      namaLengkap: 'Basith',
      jabatan: 'Staf Gudang Bangunan',
      toko: 'bangunan',
      noHp: '081377889900',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.400.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Bongkar muat bahan bangunan terkoordinasi dengan baik.'
    },
    {
      id: 'KRY-KONTRAK-09',
      idKaryawan: 'KRY-009',
      namaLengkap: 'Anshory',
      jabatan: 'Supir Armada Logistik',
      toko: 'bangunan',
      noHp: '081366554433',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.600.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Pengiriman barang bangunan tepat waktu dan aman.'
    },
    {
      id: 'KRY-KONTRAK-10',
      idKaryawan: 'KRY-010',
      namaLengkap: 'Lintang',
      jabatan: 'Staf Administrasi',
      toko: 'bangunan',
      noHp: '081288990011',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.400.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' },
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Pengarsipan dokumen dan surat menyurat rapi.'
    },
    {
      id: 'KRY-KONTRAK-11',
      idKaryawan: 'KRY-011',
      namaLengkap: 'Bagus Setyawan',
      jabatan: 'Staf Operasional & Gudang',
      toko: 'bangunan',
      noHp: '081234567811',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.300.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' }
      ],
      catatanPerforma: 'Anggota staf aktif hasil pengangkatan rekrutmen.'
    },
    {
      id: 'KRY-KONTRAK-12',
      idKaryawan: 'KRY-012',
      namaLengkap: 'Rizky Ramadhan',
      jabatan: 'Supir Armada Logistik',
      toko: 'bangunan',
      noHp: '085678912344',
      tglMulaiKontrak: '2026-06-01',
      tglSelesaiKontrak: '2027-05-31',
      gajiPokok: 'Rp 3.600.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' }
      ],
      catatanPerforma: 'Pengemudi armada logistik handal dan cekatan.'
    }
  ];

  let dbInitialized = false;

  function initDB() {
    if (dbInitialized) return;
    dbInitialized = true;

    if (!localStorage.getItem(STORAGE_KEY_REKRUTMEN)) {
      localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(DEFAULT_REKRUTMEN));
    }
    const stored = localStorage.getItem(STORAGE_KEY_REKONTRAK);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(DEFAULT_REKONTRAK));
    }
    if (!localStorage.getItem(STORAGE_KEY_GAJI_HISTORI)) {
      localStorage.setItem(STORAGE_KEY_GAJI_HISTORI, JSON.stringify(DEFAULT_GAJI_HISTORI));
    }
    if (!localStorage.getItem(STORAGE_KEY_SURAT_HISTORI)) {
      localStorage.setItem(STORAGE_KEY_SURAT_HISTORI, JSON.stringify(DEFAULT_SURAT_HISTORI));
    }
    updateStatusRekontrakOtomatis();
    checkAndNotifyH1Rekontrak();
  }

  // --- AUTO UPDATE STATUS REKONTRAK BERDASARKAN TANGGAL & MIGRASI REKONTRAK 31 MEI 2026 ---
  function updateStatusRekontrakOtomatis() {
    try {
      let list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || [];
      const now = new Date();
      now.setHours(0,0,0,0);

      let changed = false;

      // Auto Migrasi: pastikan semua karyawan (baik default maupun dari master dbKaryawan) yang masih memakai tanggal lama (2026-05-31 / 2025-xx) diperbarui ke rekontrak aktif 2026-06-01 s/d 2027-05-31
      list.forEach(item => {
        if (!item.tglSelesaiKontrak || item.tglSelesaiKontrak === '2026-05-31' || (typeof item.tglSelesaiKontrak === 'string' && item.tglSelesaiKontrak.startsWith('2025-'))) {
          item.tglMulaiKontrak = '2026-06-01';
          item.tglSelesaiKontrak = '2027-05-31';
          if (item.statusKontrak !== 'Tidak Aktif (Bukan Karyawan)' && item.statusKontrak !== 'Tidak Aktif' && item.statusKontrak !== 'Karyawan Tetap') {
            item.statusKontrak = 'Kontrak Aktif';
          }
          item.riwayatKontrak = item.riwayatKontrak || [];
          if (!item.riwayatKontrak.some(rw => rw.periode && rw.periode.includes('2026-05-31'))) {
            item.riwayatKontrak.unshift({
              periode: '2025-06-01 s/d 2026-05-31',
              durasi: '1 Tahun',
              status: 'Selesai (Rekontrak 31 Mei 2026)'
            });
          }
          changed = true;
        }
      });

      list.forEach(item => {
        // Jika sudah Tidak Aktif / Bukan Karyawan, jangan diubah otomatis oleh sistem
        if (item.statusKontrak === 'Tidak Aktif' || item.statusKontrak === 'Tidak Aktif (Bukan Karyawan)') {
          return;
        }

        if (!item.tglSelesaiKontrak || item.tglSelesaiKontrak === 'Tetap') {
          if (item.statusKontrak !== 'Karyawan Tetap') {
            item.statusKontrak = 'Karyawan Tetap';
            changed = true;
          }
          return;
        }

        const endDt = new Date(item.tglSelesaiKontrak);
        endDt.setHours(0,0,0,0);
        const diffTime = endDt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let calcStatus = 'Kontrak Aktif';
        if (diffDays < 0) {
          calcStatus = 'Habis Masa Kontrak';
        } else if (diffDays <= 35) {
          calcStatus = 'Hampir Habis (Perlu Rekontrak)';
        }

        if (item.statusKontrak !== calcStatus) {
          item.statusKontrak = calcStatus;
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(list));
      }
    } catch(e) {}
  }

  // --- SISTEM NOTIFIKASI H-1 REKONTRAK KE SELURUH DEVICE ---
  function checkAndNotifyH1Rekontrak(isSimulation = false) {
    // Minta izin notifikasi jika status masih default
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || DEFAULT_REKONTRAK;
      const now = new Date();
      now.setHours(0,0,0,0);
      const todayStr = now.toISOString().split('T')[0];

      let notifCount = 0;

      list.forEach(item => {
        if (item.statusKontrak === 'Tidak Aktif' || item.statusKontrak === 'Tidak Aktif (Bukan Karyawan)') return;
        if (!item.tglSelesaiKontrak || item.tglSelesaiKontrak === 'Tetap') return;

        const endDt = new Date(item.tglSelesaiKontrak);
        endDt.setHours(0,0,0,0);
        const diffTime = endDt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Pemicu: tepat H-1 sebelum habis kontrak (atau ketika simulasi dijalankan)
        if (diffDays === 1 || isSimulation) {
          const notifKey = `kuk_notif_sent_h1_${item.id}_${todayStr}`;
          if (!localStorage.getItem(notifKey) || isSimulation) {
            notifCount++;
            const title = `⚠️ H-1 Habis Masa Kontrak: ${item.namaLengkap}`;
            const body = `Kontrak ${item.jabatan} (${item.toko === 'palen' ? 'KUK Palen' : 'KUK Bangunan'}) berakhir besok (${item.tglSelesaiKontrak}). Segera proses rekontrak 1 tahun!`;

            if ('Notification' in window && Notification.permission === 'granted') {
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(reg => {
                  reg.showNotification(title, {
                    body: body,
                    icon: './icon-192.png',
                    badge: './icon-192.png',
                    tag: `rekontrak-h1-${item.id}`,
                    requireInteraction: true
                  });
                });
              } else {
                new Notification(title, { body: body, icon: './icon-192.png', tag: `rekontrak-h1-${item.id}` });
              }
            } else if ('Notification' in window && Notification.permission !== 'denied') {
              Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                  new Notification(title, { body: body, icon: './icon-192.png' });
                }
              });
            }

            if (!isSimulation) {
              localStorage.setItem(notifKey, 'true');
            }
          }
        }
      });

      return { count: notifCount, list: list };
    } catch(e) {
      console.warn('Gagal cek notifikasi H-1:', e);
      return { count: 0 };
    }
  }

  // --- API CALON KARYAWAN (REKRUTMEN) ---
  function getCalonList() {
    initDB();
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKRUTMEN)) || DEFAULT_REKRUTMEN;
      return list.sort((a, b) => new Date(b.tanggalLamar) - new Date(a.tanggalLamar));
    } catch(e) {
      return DEFAULT_REKRUTMEN;
    }
  }

  function getCalonById(id) {
    const list = getCalonList();
    return list.find(c => c.id === id) || null;
  }

  function saveCalon(data) {
    let list = getCalonList();
    const idx = list.findIndex(c => c.id === data.id);
    let updated = null;

    if (idx >= 0) {
      updated = { ...list[idx], ...data };
      list[idx] = updated;
    } else {
      updated = {
        id: data.id || ('CALON-' + Date.now().toString().slice(-4)),
        namaLengkap: data.namaLengkap.trim(),
        posisiDilamar: data.posisiDilamar.trim(),
        toko: data.toko || 'bangunan',
        noHp: data.noHp.trim(),
        email: data.email ? data.email.trim() : '-',
        pendidikan: data.pendidikan || '-',
        tanggalLamar: data.tanggalLamar || new Date().toISOString().split('T')[0],
        sumberDrive: data.sumberDrive || 'Input HR Portal / Drive Form',
        linkCvDrive: data.linkCvDrive || '#',
        statusPipeline: data.statusPipeline || 'Seleksi Berkas / Wawancara',
        evaluasiTraining: data.evaluasiTraining || null,
        kontrakTtd: data.kontrakTtd || null,
        catatanHR: data.catatanHR || ''
      };
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));

    // Kirim ke cloud
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_calon_karyawan', record: updated })
    }).catch(e => console.warn('Gagal sync ke cloud:', e));

    return updated;
  }

  function updateStatusPipeline(id, newStatus, evaluasiData = null, catatanTambahan = '') {
    let list = getCalonList();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, message: 'Calon karyawan tidak ditemukan.' };

    list[idx].statusPipeline = newStatus;
    if (evaluasiData) {
      list[idx].evaluasiTraining = evaluasiData;
    }
    if (catatanTambahan) {
      list[idx].catatanHR = catatanTambahan;
    }

    localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_status_rekrutmen',
        id: id,
        newStatus: newStatus,
        evaluasi: list[idx].evaluasiTraining,
        catatan: list[idx].catatanHR
      })
    }).catch(() => {});

    return { success: true, data: list[idx] };
  }

  // Simpan hasil TTD Surat Kontrak (baik Karyawan Baru maupun Rekontrak)
  function simpanSuratKontrak(payload) {
    if (payload.tipe === 'HIRE_BARU') {
      let list = getCalonList();
      const idx = list.findIndex(c => c.id === payload.idObj);
      if (idx !== -1) {
        list[idx].statusPipeline = 'Karyawan Resmi (TTD Kontrak Selesai)';
        list[idx].kontrakTtd = {
          nomorKontrak: payload.nomorKontrak,
          tglMulai: payload.tglMulai,
          tglSelesai: payload.tglSelesai,
          durasi: payload.durasi || '1 Tahun',
          gajiPokok: payload.gajiPokok,
          fasilitas: payload.fasilitas,
          ttdCalon: payload.ttdCalon,
          ttdPimpinan: payload.ttdPimpinan,
          ditandatanganiPada: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));

        // Sekaligus tambahkan ke daftar karyawan aktif/rekontrak agar langsung dipantau
        const rekontrakList = getRekontrakList();
        if (!rekontrakList.some(r => r.namaLengkap.toLowerCase() === list[idx].namaLengkap.toLowerCase())) {
          const newKry = {
            id: 'KRY-KONTRAK-' + Date.now().toString().slice(-4),
            idKaryawan: 'KRY-' + Math.floor(100 + Math.random() * 899),
            namaLengkap: list[idx].namaLengkap,
            jabatan: list[idx].posisiDilamar,
            toko: list[idx].toko,
            noHp: list[idx].noHp,
            tglMulaiKontrak: payload.tglMulai,
            tglSelesaiKontrak: payload.tglSelesai,
            gajiPokok: payload.gajiPokok || 'Rp 3.500.000',
            statusKontrak: 'Kontrak Aktif',
            riwayatKontrak: [],
            catatanPerforma: 'Karyawan baru hasil pengangkatan masa training.'
          };
          rekontrakList.unshift(newKry);
          localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(rekontrakList));
        }
      }
    } else if (payload.tipe === 'REKONTRAK') {
      let rList = getRekontrakList();
      const rIdx = rList.findIndex(r => r.id === payload.idObj);
      if (rIdx !== -1) {
        // Simpan periode lama ke riwayat
        rList[rIdx].riwayatKontrak = rList[rIdx].riwayatKontrak || [];
        if (rList[rIdx].tglMulaiKontrak) {
          rList[rIdx].riwayatKontrak.push({
            periode: `${rList[rIdx].tglMulaiKontrak} s/d ${rList[rIdx].tglSelesaiKontrak}`,
            durasi: 'Kontrak Sebelumnya (1 Tahun)',
            status: 'Selesai / Diperpanjang'
          });
        }
        rList[rIdx].tglMulaiKontrak = payload.tglMulai;
        rList[rIdx].tglSelesaiKontrak = payload.tglSelesai;
        if (payload.gajiPokok) rList[rIdx].gajiPokok = payload.gajiPokok;
        if (payload.jabatan) rList[rIdx].jabatan = payload.jabatan;
        rList[rIdx].statusKontrak = payload.durasi === 'Tetap' ? 'Karyawan Tetap' : 'Kontrak Aktif';
        rList[rIdx].terakhirRekontrak = new Date().toISOString();
        rList[rIdx].suratKontrakTerakhir = {
          nomorKontrak: payload.nomorKontrak,
          durasi: payload.durasi || '1 Tahun',
          ttdKaryawan: payload.ttdCalon,
          ttdPimpinan: payload.ttdPimpinan
        };
        localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(rList));
      }
    }

    // Otomatis catat ke Arsip Surat & Korespondensi
    const targetNama = payload.tipe === 'HIRE_BARU' 
      ? (getCalonById(payload.idObj) ? getCalonById(payload.idObj).namaLengkap : 'Karyawan Baru')
      : (getRekontrakById(payload.idObj) ? getRekontrakById(payload.idObj).namaLengkap : 'Karyawan');

    catatArsipSurat({
      nomorSurat: payload.nomorKontrak,
      jenisSurat: payload.tipe === 'REKONTRAK' ? 'Surat Rekontrak (PKWT)' : 'Surat PKWT Baru',
      idKaryawan: payload.idObj,
      namaLengkap: targetNama,
      toko: payload.toko || 'bangunan',
      tglCetak: new Date().toISOString().split('T')[0],
      periodeKontrak: `${payload.tglMulai} s/d ${payload.tglSelesai}`,
      gajiPokok: payload.gajiPokok || 'Rp 3.500.000',
      status: 'Diarsipkan & TTD Lengkap',
      ttdCalon: payload.ttdCalon ? 'Ada Signature' : '-',
      ttdPimpinan: payload.ttdPimpinan ? 'Pimpinan KUK' : '-'
    });

    updateStatusRekontrakOtomatis();
    checkAndNotifyH1Rekontrak();

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_surat_kontrak', payload: payload })
    }).catch(() => {});

    return { success: true };
  }

  // --- API GAJI HISTORI (REKAPAN GAJI BULANAN) ---
  function getGajiHistoriList() {
    initDB();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_GAJI_HISTORI)) || [];
    } catch(e) {
      return [];
    }
  }

  function getGajiHistoriById(id) {
    const list = getGajiHistoriList();
    return list.find(g => g.id === id) || null;
  }

  function saveGajiHistori(data) {
    let list = getGajiHistoriList();
    const idx = list.findIndex(g => g.id === data.id);
    let updated = null;

    const gajiPokok = Number(data.gajiPokok || 0);
    const tunjangan = Number(data.tunjangan || 0);
    const potongan = Number(data.potongan || 0);
    const totalGaji = gajiPokok + tunjangan - potongan;

    if (idx >= 0) {
      updated = {
        ...list[idx],
        ...data,
        gajiPokok,
        tunjangan,
        potongan,
        totalGaji
      };
      list[idx] = updated;
    } else {
      updated = {
        id: data.id || ('PAY-' + Date.now().toString().slice(-6)),
        idKaryawan: data.idKaryawan || 'KRY-000',
        namaLengkap: data.namaLengkap || 'Tanpa Nama',
        jabatan: data.jabatan || 'Staf',
        toko: data.toko || 'bangunan',
        bulanTahun: data.bulanTahun || new Date().toISOString().slice(0,7),
        periodeLabel: data.periodeLabel || 'Bulan Ini',
        gajiPokok,
        tunjangan,
        potongan,
        totalGaji,
        statusPembayaran: data.statusPembayaran || 'Lunas / Ditransfer',
        tglDibayar: data.tglDibayar || new Date().toISOString().split('T')[0],
        catatan: data.catatan || 'Slip Gaji Bulanan',
        nomorSlip: data.nomorSlip || ('SLIP-KUK-' + Date.now().toString().slice(-6))
      };
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY_GAJI_HISTORI, JSON.stringify(list));

    // Otomatis catat ke arsip surat
    catatArsipSurat({
      nomorSurat: updated.nomorSlip,
      jenisSurat: 'Slip Gaji Bulanan',
      idKaryawan: updated.idKaryawan,
      namaLengkap: updated.namaLengkap,
      toko: updated.toko,
      tglCetak: updated.tglDibayar,
      periodeKontrak: `Periode ${updated.periodeLabel}`,
      gajiPokok: `Rp ${totalGaji.toLocaleString('id-ID')}`,
      status: 'Terbit / Diserahkan',
      catatan: updated.catatan
    });

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_gaji_histori', record: updated })
    }).catch(() => {});

    return updated;
  }

  function deleteGajiHistori(id) {
    let list = getGajiHistoriList();
    list = list.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY_GAJI_HISTORI, JSON.stringify(list));
    return list;
  }

  // --- API ARSIP SURAT & KORESPONDENSI ---
  function getSuratHistoriList() {
    initDB();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SURAT_HISTORI)) || [];
    } catch(e) {
      return [];
    }
  }

  function getSuratHistoriById(id) {
    const list = getSuratHistoriList();
    return list.find(s => s.id === id) || null;
  }

  function catatArsipSurat(payload) {
    let list = getSuratHistoriList();
    const existingIdx = list.findIndex(s => s.nomorSurat === payload.nomorSurat && payload.nomorSurat);

    const docItem = {
      id: (existingIdx >= 0 ? list[existingIdx].id : 'DOC-' + Date.now().toString().slice(-6)),
      nomorSurat: payload.nomorSurat || (`SURAT/KUK/${Date.now().toString().slice(-4)}`),
      jenisSurat: payload.jenisSurat || 'Surat Perjanjian Kerja (PKWT)',
      idKaryawan: payload.idKaryawan || '-',
      namaLengkap: payload.namaLengkap || 'Karyawan',
      toko: payload.toko || 'bangunan',
      tglCetak: payload.tglCetak || new Date().toISOString().split('T')[0],
      periodeKontrak: payload.periodeKontrak || '1 Tahun',
      gajiPokok: payload.gajiPokok || '-',
      status: payload.status || 'Diarsipkan & TTD Lengkap',
      ttdCalon: payload.ttdCalon || 'Ada Signature',
      ttdPimpinan: payload.ttdPimpinan || 'Pimpinan KUK',
      catatan: payload.catatan || ''
    };

    if (existingIdx >= 0) {
      list[existingIdx] = docItem;
    } else {
      list.unshift(docItem);
    }

    localStorage.setItem(STORAGE_KEY_SURAT_HISTORI, JSON.stringify(list));

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_arsip_surat', record: docItem })
    }).catch(() => {});

    return docItem;
  }

  function deleteSuratHistori(id) {
    let list = getSuratHistoriList();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SURAT_HISTORI, JSON.stringify(list));
    return list;
  }

  // --- API REKONTRAK KARYAWAN LAMA ---
  function syncRekontrakWithMaster(masterList) {
    if (!Array.isArray(masterList) || masterList.length === 0) return;
    try {
      let rList = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || DEFAULT_REKONTRAK;
      let changed = false;

      masterList.forEach(k => {
        if (!k || !k.nama) return;
        const nama = String(k.nama).trim();
        if (!nama) return;
        const isNonaktif = String(k.status || '').toLowerCase() === 'nonaktif';

        const existingIdx = rList.findIndex(r => String(r.namaLengkap || '').toLowerCase().trim() === nama.toLowerCase());
        if (existingIdx === -1 && !isNonaktif) {
          const newRek = {
            id: 'KRY-KONTRAK-' + Math.floor(1000 + Math.random() * 9000),
            idKaryawan: k.id || ('KRY-' + Math.floor(100 + Math.random() * 899)),
            namaLengkap: nama,
            jabatan: k.bagian || 'Staff KUK',
            toko: (String(k.bagian).toLowerCase().includes('palen') || nama.toLowerCase().includes('miftah') || nama.toLowerCase().includes('nukul')) ? 'palen' : 'bangunan',
            noHp: k.noHp || '-',
            tglMulaiKontrak: '2026-06-01',
            tglSelesaiKontrak: '2027-05-31', // Rekontrak diadakan 31 Mei 2026 -> Periode Aktif hingga 31 Mei 2027
            gajiPokok: k.gajiPokok || 'Rp 3.500.000',
            statusKontrak: 'Kontrak Aktif',
            riwayatKontrak: [
              { periode: '2025-06-01 s/d 2026-05-31', durasi: '1 Tahun', status: 'Selesai (Rekontrak 31 Mei 2026)' }
            ],
            catatanPerforma: 'Master Karyawan KUK'
          };
          rList.push(newRek);
          changed = true;
        } else if (existingIdx !== -1) {
          if (isNonaktif && rList[existingIdx].statusKontrak !== 'Tidak Aktif (Bukan Karyawan)') {
            rList[existingIdx].statusKontrak = 'Tidak Aktif (Bukan Karyawan)';
            changed = true;
          }
        }
      });

      // Pastikan semua record di rList yang masih memakai 2026-05-31 diperbarui ke 2027-05-31
      rList.forEach(r => {
        if (!r.tglSelesaiKontrak || r.tglSelesaiKontrak === '2026-05-31' || (typeof r.tglSelesaiKontrak === 'string' && r.tglSelesaiKontrak.startsWith('2025-'))) {
          r.tglMulaiKontrak = '2026-06-01';
          r.tglSelesaiKontrak = '2027-05-31';
          if (r.statusKontrak !== 'Tidak Aktif (Bukan Karyawan)' && r.statusKontrak !== 'Tidak Aktif' && r.statusKontrak !== 'Karyawan Tetap') {
            r.statusKontrak = 'Kontrak Aktif';
          }
          r.riwayatKontrak = r.riwayatKontrak || [];
          if (!r.riwayatKontrak.some(rw => rw.periode && rw.periode.includes('2026-05-31'))) {
            r.riwayatKontrak.unshift({
              periode: '2025-06-01 s/d 2026-05-31',
              durasi: '1 Tahun',
              status: 'Selesai (Rekontrak 31 Mei 2026)'
            });
          }
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(rList));
        updateStatusRekontrakOtomatis();
      }
    } catch(e) {
      console.warn('Gagal sync rekontrak master:', e);
    }
  }

  function getRekontrakList() {
    initDB();
    try {
      let list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || [];

      // Sync dari master dbKaryawan jika tersedia di window
      if (typeof window !== 'undefined' && window.dbKaryawan && Array.isArray(window.dbKaryawan) && window.dbKaryawan.length > 0) {
        syncRekontrakWithMaster(window.dbKaryawan);
        list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || list;
      }

      return list;
    } catch(e) {
      return DEFAULT_REKONTRAK;
    }
  }

  function getRekontrakById(id) {
    const list = getRekontrakList();
    return list.find(r => r.id === id) || null;
  }

  function saveRekontrak(data) {
    let list = getRekontrakList();
    const idx = list.findIndex(r => r.id === data.id);
    let updated = null;

    if (idx >= 0) {
      updated = { ...list[idx], ...data };
      list[idx] = updated;
    } else {
      updated = {
        id: data.id || ('KRY-KONTRAK-' + Date.now().toString().slice(-4)),
        idKaryawan: data.idKaryawan || ('KRY-' + Math.floor(100 + Math.random()*899)),
        namaLengkap: data.namaLengkap.trim(),
        jabatan: data.jabatan.trim(),
        toko: data.toko || 'bangunan',
        noHp: data.noHp || '-',
        tglMulaiKontrak: data.tglMulaiKontrak || '2026-06-01',
        tglSelesaiKontrak: data.tglSelesaiKontrak || '2027-05-31', // Default rekontrak berakhir 31 Mei 2027
        gajiPokok: data.gajiPokok || 'Rp 3.500.000',
        statusKontrak: 'Kontrak Aktif',
        riwayatKontrak: [],
        catatanPerforma: data.catatanPerforma || ''
      };
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(list));
    updateStatusRekontrakOtomatis();
    checkAndNotifyH1Rekontrak();

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_rekontrak_karyawan', record: updated })
    }).catch(() => {});

    return updated;
  }

  function updateStatusRekontrak(id, newStatus, catatanTambahan = '') {
    let list = getRekontrakList();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, message: 'Karyawan tidak ditemukan.' };

    list[idx].statusKontrak = newStatus;
    if (catatanTambahan) {
      list[idx].catatanPerforma = (list[idx].catatanPerforma ? list[idx].catatanPerforma + ' | ' : '') + catatanTambahan;
    }
    if (newStatus === 'Tidak Aktif (Bukan Karyawan)' || newStatus === 'Tidak Aktif') {
      list[idx].tglNonAktif = new Date().toISOString().split('T')[0];
    }

    localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(list));
    updateStatusRekontrakOtomatis();

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_status_rekontrak',
        id: id,
        newStatus: newStatus,
        catatan: list[idx].catatanPerforma
      })
    }).catch(() => {});

    return { success: true, data: list[idx] };
  }

  function deleteCalon(id) {
    let list = getCalonList();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));
    return list;
  }

  function deleteRekontrak(id) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || [];
    list = list.filter(r => r.id !== id && r.idKaryawan !== id);
    localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(list));
    return list;
  }

  function clearAllRekontrak() {
    localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify([]));
    return [];
  }

  // --- SINKRONISASI DARI CLOUD DAN SIMULASI TARIK DRIVE FORM ---
  function syncFromCloud() {
    updateStatusRekontrakOtomatis();
    return fetch(`${SCRIPT_URL}?action=getKaryawanData`)
      .then(r => r.json())
      .then(res => {
        if (res.result === 'success') {
          if (res.rekrutmen && Array.isArray(res.rekrutmen)) {
            localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(res.rekrutmen));
          }
          if (res.rekontrak && Array.isArray(res.rekontrak)) {
            localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(res.rekontrak));
          }
        }
        updateStatusRekontrakOtomatis();
        checkAndNotifyH1Rekontrak();
      })
      .catch(() => {});
  }

  // Features Importer Form Response / Google Spreadsheet
  function tarikDataDriveForm() {
    return new Promise((resolve) => {
      // First attempt to fetch real online Google Apps Script responses if available
      fetch(`${SCRIPT_URL}?action=get_rekrutmen_form_responses`)
        .then(r => r.json())
        .then(res => {
          if (res && res.result === 'success' && Array.isArray(res.data) && res.data.length > 0) {
            let list = getCalonList();
            let addedCount = 0;
            res.data.forEach(item => {
              if (item.namaLengkap && !list.some(c => c.namaLengkap.toLowerCase().trim() === item.namaLengkap.toLowerCase().trim())) {
                const newCalon = {
                  id: 'CALON-' + Math.floor(100 + Math.random()*899),
                  namaLengkap: item.namaLengkap.trim(),
                  posisiDilamar: item.posisiDilamar || 'Staf Operasional',
                  toko: item.toko || 'bangunan',
                  noHp: item.noHp || '-',
                  email: item.email || '-',
                  pendidikan: item.pendidikan || 'SMA / Sederajat',
                  tanggalLamar: item.tanggalLamar || new Date().toISOString().split('T')[0],
                  sumberDrive: item.sumberDrive || 'Google Form / Spreadsheet Drive',
                  linkCvDrive: item.linkCvDrive || '#',
                  statusPipeline: 'Seleksi Berkas / Wawancara',
                  evaluasiTraining: null,
                  kontrakTtd: null,
                  catatanHR: 'Sinkronisasi Otomatis dari Spreadsheet Google Form.'
                };
                list.unshift(newCalon);
                addedCount++;
              }
            });
            if (addedCount > 0) {
              localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));
            }
            resolve({ count: addedCount, message: `${addedCount} data baru berhasil ditarik dari Spreadsheet Google Form!` });
            return;
          }
          throw new Error('Fallback sample');
        })
        .catch(() => {
          // Fallback simulation / default entry
          let list = getCalonList();
          const sampleBaru = [
            {
              id: 'CALON-' + Math.floor(200 + Math.random()*800),
              namaLengkap: 'Andika Pratama',
              posisiDilamar: 'Staf Marketing & Penjualan',
              toko: 'bangunan',
              noHp: '081223344556',
              email: 'andika.pratama@gmail.com',
              pendidikan: 'S1 Manajemen',
              tanggalLamar: new Date().toISOString().split('T')[0],
              sumberDrive: 'Formulir Rekrutmen Google Drive (Tersinkron Otomatis)',
              linkCvDrive: 'https://drive.google.com/file/d/sample_cv_andika/view',
              statusPipeline: 'Seleksi Berkas / Wawancara',
              evaluasiTraining: null,
              kontrakTtd: null,
              catatanHR: 'Masuk otomatis dari Drive form terbaru.'
            }
          ];

          let addedCount = 0;
          sampleBaru.forEach(item => {
            if (!list.some(c => c.namaLengkap.toLowerCase().trim() === item.namaLengkap.toLowerCase().trim())) {
              list.unshift(item);
              addedCount++;
            }
          });

          if (addedCount > 0) {
            localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));
          }
          resolve({ count: addedCount, message: addedCount > 0 ? '1 data calon karyawan baru ditarik dari Google Form!' : 'Tidak ada data baru (Semua sudah tersinkron).' });
        });
    });
  }

  // Import data calon karyawan dari link / teks Spreadsheet Form responses (CSV / TSV / Copy-Paste)
  function importFromSpreadsheetData(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return { success: false, message: 'Data masukan kosong.' };
    
    try {
      let list = getCalonList();
      const lines = rawInput.split(/\r?\n/).filter(line => line.trim().length > 0);
      let count = 0;

      lines.forEach((line, idx) => {
        // Skip header if present
        if (idx === 0 && (line.toLowerCase().includes('nama') || line.toLowerCase().includes('timestamp') || line.toLowerCase().includes('posisi'))) return;
        
        // Split by Tab or Comma
        const cols = line.includes('\t') ? line.split('\t') : line.split(',');
        if (cols.length >= 2) {
          const nama = cols[0].trim() || cols[1].trim();
          const posisi = cols[1] ? cols[1].trim() : 'Staf Operasional';
          const hp = cols[2] ? cols[2].trim() : '-';
          const toko = (posisi.toLowerCase().includes('palen') || line.toLowerCase().includes('palen')) ? 'palen' : 'bangunan';

          if (nama && !list.some(c => c.namaLengkap.toLowerCase().trim() === nama.toLowerCase())) {
            const newCalon = {
              id: 'CALON-' + Math.floor(1000 + Math.random()*9000),
              namaLengkap: nama,
              posisiDilamar: posisi,
              toko: toko,
              noHp: hp,
              email: cols[3] ? cols[3].trim() : '-',
              pendidikan: cols[4] ? cols[4].trim() : 'SMA / Sederajat',
              tanggalLamar: new Date().toISOString().split('T')[0],
              sumberDrive: 'Import Spreadsheet Form',
              linkCvDrive: '#',
              statusPipeline: 'Seleksi Berkas / Wawancara',
              evaluasiTraining: null,
              kontrakTtd: null,
              catatanHR: 'Diimpor dari Spreadsheet Form responses.'
            };
            list.unshift(newCalon);
            count++;
          }
        }
      });

      if (count > 0) {
        localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));
      }
      return { success: true, count: count, message: `Berhasil mengimpor ${count} calon karyawan dari Spreadsheet!` };
    } catch(e) {
      return { success: false, message: 'Gagal memproses data spreadsheet: ' + e.message };
    }
  }

  return {
    initDB,
    getCalonList,
    getCalonById,
    saveCalon,
    updateStatusPipeline,
    simpanSuratKontrak,
    getRekontrakList,
    getRekontrakById,
    saveRekontrak,
    updateStatusRekontrak,
    deleteCalon,
    deleteRekontrak,
    clearAllRekontrak,
    getGajiHistoriList,
    getGajiHistoriById,
    saveGajiHistori,
    deleteGajiHistori,
    getSuratHistoriList,
    getSuratHistoriById,
    catatArsipSurat,
    deleteSuratHistori,
    syncFromCloud,
    tarikDataDriveForm,
    importFromSpreadsheetData,
    updateStatusRekontrakOtomatis,
    checkAndNotifyH1Rekontrak,
    syncRekontrakWithMaster
  };
})();

window.KaryawanDB = KaryawanDB;
