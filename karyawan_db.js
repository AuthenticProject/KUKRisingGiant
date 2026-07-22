/**
 * karyawan_db.js
 * Modul Database & Service untuk Manajemen Rekrutmen (Hire Karyawan Baru) & Rekontrak Karyawan Lama
 * KUK HR Portal - Tersinkronisasi cloud database (Google Apps Script), local storage cache, dan Notifikasi H-1.
 */

const KaryawanDB = (() => {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5sEI1iGmVG28508s9QumeFm19-Zc9cnzoNMOSWtap4pm-ktnWRABDGOTCHNL0rwfS/exec";
  const STORAGE_KEY_REKRUTMEN = 'kuk_db_rekrutmen_v1';
  const STORAGE_KEY_REKONTRAK = 'kuk_db_rekontrak_v1';

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
  const DEFAULT_REKONTRAK = [
    {
      id: 'KRY-KONTRAK-01',
      idKaryawan: 'KRY-001',
      namaLengkap: 'Hendra Saputra',
      jabatan: 'Kepala Gudang Bangunan',
      toko: 'bangunan',
      noHp: '081345678901',
      tglMulaiKontrak: '2025-06-01',
      tglSelesaiKontrak: '2026-05-31', // Terakhir 31 Mei 2026 (1 Tahun)
      gajiPokok: 'Rp 3.800.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
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
      tglMulaiKontrak: '2025-06-01',
      tglSelesaiKontrak: '2026-05-31', // Terakhir 31 Mei 2026 (1 Tahun)
      gajiPokok: 'Rp 3.500.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
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
      tglMulaiKontrak: '2025-06-01',
      tglSelesaiKontrak: '2026-05-31', // Terakhir 31 Mei 2026 (1 Tahun)
      gajiPokok: 'Rp 3.200.000',
      statusKontrak: 'Kontrak Aktif',
      riwayatKontrak: [
        { periode: '2024-06-01 s/d 2025-05-31', durasi: '1 Tahun', status: 'Selesai' }
      ],
      catatanPerforma: 'Rajin dan dapat diandalkan saat jam sibuk toko.'
    }
  ];

  function initDB() {
    if (!localStorage.getItem(STORAGE_KEY_REKRUTMEN)) {
      localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(DEFAULT_REKRUTMEN));
    }
    if (!localStorage.getItem(STORAGE_KEY_REKONTRAK)) {
      localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(DEFAULT_REKONTRAK));
    }
    updateStatusRekontrakOtomatis();
    checkAndNotifyH1Rekontrak();
  }

  // --- AUTO UPDATE STATUS REKONTRAK BERDASARKAN TANGGAL ---
  function updateStatusRekontrakOtomatis() {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || [];
      const now = new Date();
      now.setHours(0,0,0,0);

      let changed = false;
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
      const list = getRekontrakList();
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

    updateStatusRekontrakOtomatis();
    checkAndNotifyH1Rekontrak();

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'save_surat_kontrak', payload: payload })
    }).catch(() => {});

    return { success: true };
  }

  // --- API REKONTRAK KARYAWAN LAMA ---
  function getRekontrakList() {
    initDB();
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY_REKONTRAK)) || DEFAULT_REKONTRAK;
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
        tglMulaiKontrak: data.tglMulaiKontrak || '2025-06-01',
        tglSelesaiKontrak: data.tglSelesaiKontrak || '2026-05-31', // Default karyawan lama berakhir 31 Mei 2026
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
    let list = getRekontrakList();
    list = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REKONTRAK, JSON.stringify(list));
    return list;
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

  // Simulasi menarik data formulir baru yang masuk ke Google Drive / Spreadsheet Form Responses
  function tarikDataDriveForm() {
    return new Promise(resolve => {
      setTimeout(() => {
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
            catatanHR: 'Masuk dari Drive form terbaru.'
          }
        ];

        if (!list.some(c => c.namaLengkap === sampleBaru[0].namaLengkap)) {
          list.unshift(sampleBaru[0]);
          localStorage.setItem(STORAGE_KEY_REKRUTMEN, JSON.stringify(list));
          resolve({ count: 1, newCalon: sampleBaru[0] });
        } else {
          resolve({ count: 0 });
        }
      }, 700);
    });
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
    syncFromCloud,
    tarikDataDriveForm,
    updateStatusRekontrakOtomatis,
    checkAndNotifyH1Rekontrak
  };
})();

window.KaryawanDB = KaryawanDB;
