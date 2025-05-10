import { Component, ViewChild } from '@angular/core';
import { ToastController, AlertController, IonContent } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { GestureController } from '@ionic/angular';

interface Surat {
  id: number;
  title: string;
  suratNumber: string;
  distribusiProgress: number;
  verifikasiProgress: number;
  cetakProgress: number;
  date?: string;
  time?: string;
  status?: string;
  distribusiDescription: string;
  verifikasiDescription: string;
  cetakDescription: string;
  distribusiStartDate: string;
  distribusiEndDate: string;
  distribusiEstimatedDate: string;
  distribusiStatus: string;
  verifikasiStartDate: string;
  verifikasiEndDate: string;
  verifikasiEstimatedDate: string;
  verifikasiEstimatedStartDate: string;
  verifikasiStatus: string;
  cetakStartDate: string;
  cetakEndDate: string;
  cetakEstimatedDate: string;
  cetakStatus: string;
  submissionDate: string;
  estimatedCompletionDate: string;
  currentStepDescription: string;
  notes: string;
}

@Component({
  standalone: false,
  selector: 'app-statuspengajuan',
  templateUrl: './statuspengajuan.page.html',
  styleUrls: ['./statuspengajuan.page.scss'],
})
export class StatuspengajuanPage {
  @ViewChild(IonContent) content!: IonContent;

  // Daftar surat yang sudah diajukan
  submittedSurat = [
    { 
      id: 1, 
      title: 'Surat Permohonan Cuti', 
      suratNumber: 'GA/2025/001', 
      distribusiProgress: 0.6, 
      verifikasiProgress: 0.3, 
      cetakProgress: 0.0,
      distribusiDescription: 'Surat sedang didistribusikan ke bagian terkait',
      verifikasiDescription: 'Surat sedang diverifikasi oleh petugas',
      cetakDescription: 'Menunggu proses pencetakan',
      distribusiStartDate: '2024-03-20',
      distribusiEndDate: '2024-03-21',
      distribusiEstimatedDate: '2024-03-21',
      distribusiStatus: 'Dalam Proses',
      verifikasiStartDate: '2024-03-21',
      verifikasiEndDate: '2024-03-22',
      verifikasiEstimatedDate: '2024-03-22',
      verifikasiEstimatedStartDate: '2024-03-21',
      verifikasiStatus: 'Menunggu',
      cetakStartDate: '2024-03-22',
      cetakEndDate: '2024-03-23',
      cetakEstimatedDate: '2024-03-23',
      cetakStatus: 'Belum Dimulai',
      submissionDate: '2024-03-20',
      estimatedCompletionDate: '2024-03-23',
      currentStepDescription: 'Surat sedang dalam proses distribusi',
      notes: 'Proses berjalan sesuai jadwal'
    },
    { 
      id: 2, 
      title: 'Surat Keterangan Kerja', 
      suratNumber: 'GA/2025/002', 
      distribusiProgress: 1.0, 
      verifikasiProgress: 1.0, 
      cetakProgress: 0.8,
      distribusiDescription: 'Surat telah didistribusikan',
      verifikasiDescription: 'Surat telah diverifikasi',
      cetakDescription: 'Surat sedang dalam proses pencetakan',
      distribusiStartDate: '2024-03-19',
      distribusiEndDate: '2024-03-20',
      distribusiEstimatedDate: '2024-03-20',
      distribusiStatus: 'Selesai',
      verifikasiStartDate: '2024-03-20',
      verifikasiEndDate: '2024-03-21',
      verifikasiEstimatedDate: '2024-03-21',
      verifikasiEstimatedStartDate: '2024-03-20',
      verifikasiStatus: 'Selesai',
      cetakStartDate: '2024-03-21',
      cetakEndDate: '2024-03-22',
      cetakEstimatedDate: '2024-03-22',
      cetakStatus: 'Dalam Proses',
      submissionDate: '2024-03-19',
      estimatedCompletionDate: '2024-03-22',
      currentStepDescription: 'Surat sedang dalam proses pencetakan',
      notes: 'Proses berjalan sesuai jadwal'
    },
    { 
      id: 3, 
      title: 'Surat Pengajuan Keluhan', 
      suratNumber: 'GA/2025/010', 
      distribusiProgress: 0.2, 
      verifikasiProgress: 0.5, 
      cetakProgress: 0.1,
      distribusiDescription: 'Surat sedang dalam antrian distribusi',
      verifikasiDescription: 'Surat sedang diverifikasi',
      cetakDescription: 'Menunggu proses pencetakan',
      distribusiStartDate: '2024-03-18',
      distribusiEndDate: '2024-03-19',
      distribusiEstimatedDate: '2024-03-19',
      distribusiStatus: 'Dalam Proses',
      verifikasiStartDate: '2024-03-19',
      verifikasiEndDate: '2024-03-20',
      verifikasiEstimatedDate: '2024-03-20',
      verifikasiEstimatedStartDate: '2024-03-19',
      verifikasiStatus: 'Dalam Proses',
      cetakStartDate: '2024-03-20',
      cetakEndDate: '2024-03-21',
      cetakEstimatedDate: '2024-03-21',
      cetakStatus: 'Menunggu',
      submissionDate: '2024-03-18',
      estimatedCompletionDate: '2024-03-21',
      currentStepDescription: 'Surat sedang dalam proses verifikasi',
      notes: 'Proses berjalan sesuai jadwal'
    },
    { 
      id: 4, 
      title: 'Surat Rekomendasi', 
      suratNumber: 'GA/2025/015', 
      distribusiProgress: 0.1, 
      verifikasiProgress: 0.6, 
      cetakProgress: 0.0,
      distribusiDescription: 'Surat sedang dalam antrian distribusi',
      verifikasiDescription: 'Surat sedang diverifikasi',
      cetakDescription: 'Menunggu proses pencetakan',
      distribusiStartDate: '2024-03-17',
      distribusiEndDate: '2024-03-18',
      distribusiEstimatedDate: '2024-03-18',
      distribusiStatus: 'Dalam Proses',
      verifikasiStartDate: '2024-03-18',
      verifikasiEndDate: '2024-03-19',
      verifikasiEstimatedDate: '2024-03-19',
      verifikasiEstimatedStartDate: '2024-03-18',
      verifikasiStatus: 'Dalam Proses',
      cetakStartDate: '2024-03-19',
      cetakEndDate: '2024-03-20',
      cetakEstimatedDate: '2024-03-20',
      cetakStatus: 'Menunggu',
      submissionDate: '2024-03-17',
      estimatedCompletionDate: '2024-03-20',
      currentStepDescription: 'Surat sedang dalam proses verifikasi',
      notes: 'Proses berjalan sesuai jadwal'
    }
  ];

  selectedSurat: string | null = null;
  selectedSuratDetails: any = null;
  riwayatSurat: Surat[] = [];
  isLoading: boolean = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private gestureCtrl: GestureController
  ) {}

  ngOnInit() {
    // Load riwayat surat dari localStorage
    this.loadRiwayatSurat();
    
    // Cek apakah ada parameter suratNumber dari halaman riwayat
    this.route.paramMap.subscribe(params => {
      const suratNumber = params.get('suratNumber');
      if (suratNumber) {
        // Cari surat berdasarkan nomor surat
        const surat = this.submittedSurat.find(s => s.suratNumber === suratNumber);
        if (surat) {
          this.selectedSurat = surat.suratNumber;
          this.onSuratSelected();
        }
      }
    });
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();
  }

  private async setupSwipeGesture() {
    const scrollElement = await this.content.getScrollElement();
    const gesture = this.gestureCtrl.create({
      el: scrollElement,
      threshold: 0,
      gestureName: 'swipe',
      onStart: () => {},
      onMove: (ev) => {
        // Handle horizontal swipe
        if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
          if (ev.deltaX > 50) {
            // Swipe right - go to previous page
            this.router.navigate(['/aktivitas']);
          } else if (ev.deltaX < -50) {
            // Swipe left - go to next page
            this.router.navigate(['/riwayatsurat']);
          }
        }
      }
    });
    gesture.enable();
  }

  // Fungsi untuk memuat data riwayat surat dari localStorage
  loadRiwayatSurat() {
    const storedSurat = localStorage.getItem('riwayatSurat');
    if (storedSurat) {
      const parsedSurat = JSON.parse(storedSurat);
      this.riwayatSurat = parsedSurat.map((surat: any) => ({
        ...surat,
        distribusiProgress: Math.random(),
        verifikasiProgress: Math.random(),
        cetakProgress: Math.random(),
        distribusiDescription: 'Surat sedang didistribusikan ke bagian terkait',
        verifikasiDescription: 'Surat sedang diverifikasi oleh petugas',
        cetakDescription: 'Menunggu proses pencetakan',
        distribusiStartDate: new Date().toISOString().split('T')[0],
        distribusiEndDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        distribusiEstimatedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        distribusiStatus: 'Dalam Proses',
        verifikasiStartDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        verifikasiEndDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        verifikasiEstimatedDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        verifikasiEstimatedStartDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        verifikasiStatus: 'Menunggu',
        cetakStartDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        cetakEndDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        cetakEstimatedDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        cetakStatus: 'Belum Dimulai',
        submissionDate: surat.date || new Date().toISOString().split('T')[0],
        estimatedCompletionDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        currentStepDescription: 'Surat sedang dalam proses distribusi',
        notes: 'Proses berjalan sesuai jadwal'
      }));
    }
  }

  // Fungsi untuk mendapatkan status berdasarkan progress
  getStatusFromProgress(progress: number): string {
    if (progress < 0.3) return 'Menunggu';
    if (progress < 0.8) return 'Dalam Proses';
    return 'Selesai';
  }

  // Fungsi yang dipanggil saat surat dipilih
  async onSuratSelected() {
    if (!this.selectedSurat) {
      this.selectedSuratDetails = null;
      return;
    }

    // Set loading state
    this.isLoading = true;
    this.selectedSuratDetails = null;

    // Simulasi loading dengan delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mencari surat yang dipilih berdasarkan suratNumber
    this.selectedSuratDetails = this.riwayatSurat.find(surat => surat.suratNumber === this.selectedSurat);
    
    // Jika surat ditemukan, tambahkan status jika belum ada
    if (this.selectedSuratDetails && !this.selectedSuratDetails.status) {
      const overallProgress = this.getOverallProgress();
      this.selectedSuratDetails.status = this.getStatusFromProgress(overallProgress);
    }

    // End loading state
    this.isLoading = false;
  }

  // Fungsi untuk menghitung progress keseluruhan dari surat yang dipilih
  getOverallProgress() {
    if (!this.selectedSuratDetails) {
      return 0;
    }
    
    // Menghitung rata-rata dari ketiga progress
    const totalProgress = (
      this.selectedSuratDetails.distribusiProgress + 
      this.selectedSuratDetails.verifikasiProgress + 
      this.selectedSuratDetails.cetakProgress
    ) / 3;
    
    return totalProgress;
  }

  // Fungsi untuk refresh data
  doRefresh(event: any) {
    setTimeout(() => {
      // Muat ulang data riwayat surat
      this.loadRiwayatSurat();
      
      // Jika ada surat yang dipilih, perbarui detailnya
      if (this.selectedSurat) {
        this.onSuratSelected();
      }
      
      // Tampilkan toast konfirmasi refresh
      this.toastController.create({
        message: 'Data berhasil diperbarui',
        duration: 1500,
        color: 'success',
        position: 'top'
      }).then(toast => toast.present());
      
      // Selesaikan event refresh
      event.target.complete();
    }, 1000);
  }
}
