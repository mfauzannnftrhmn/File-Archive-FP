import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Template {
  title: string;
  category: string;
  description: string;
  fileWord: string;
  filePdf: string;
  imagePreview?: string;
}

@Component({
  standalone: false,
  selector: 'app-templatesurat',
  templateUrl: './templatesurat.page.html',
  styleUrls: ['./templatesurat.page.scss'],
})
export class TemplatesuratPage implements OnInit {
  allTemplates: Template[] = [
    {
      title: 'Surat Keterangan Karyawan',
      category: 'Surat Keterangan Karyawan',
      description: 'Digunakan untuk menyatakan status karyawan',
      fileWord: 'assets/templates/surat_karyawan.docx',
      filePdf: 'assets/templates/Surat1.pdf',
      imagePreview: 'assets/templates/preview/Surat1.png',
    },
    {
      title: 'Surat Pengajuan Keluhan',
      category: 'Pengajuan Keluhan',
      description: 'Digunakan untuk menyampaikan keluhan resmi',
      fileWord: 'assets/templates/keluhan.docx',
      filePdf: 'assets/templates/Surat1.pdf',
      imagePreview: 'assets/templates/preview/keluhan.png',
    },
    {
      title: 'Surat Permohonan Cuti',
      category: 'Permohonan Cuti',
      description: 'Permohonan cuti karyawan',
      fileWord: 'assets/templates/cuti.docx',
      filePdf: 'assets/templates/Surat1.pdf',
      imagePreview: 'assets/templates/preview/cuti.png',
    },
    {
      title: 'Surat Rekomendasi Kerja',
      category: 'Surat Rekomendasi',
      description: 'Surat rekomendasi dari atasan',
      fileWord: 'assets/templates/rekomendasi.docx',
      filePdf: 'assets/templates/Surat1.pdf',
      imagePreview: 'assets/templates/preview/rekomendasi.png',
    },
  ];

  filteredTemplates: Template[] = [];
  selectedCategory: string = 'all';

  constructor(private sanitizer: DomSanitizer, private router: Router) {}

  ngOnInit() {
    this.filteredTemplates = this.allTemplates; // Tampilkan semua saat awal
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;

    if (category === 'all') {
      this.filteredTemplates = this.allTemplates;
    } else {
      this.filteredTemplates = this.allTemplates.filter(
        (template) => template.category === category
      );
    }
  }

  getSafePdfUrl(pdfPath: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  }

  getImagePreview(template: Template): string {
    return template.imagePreview || 'assets/templates/preview/default-template.png';
  }

  viewTemplate(template: any) {
    // Fungsi saat tombol "Lihat" diklik
    console.log('Lihat template:', template);
  }
}
