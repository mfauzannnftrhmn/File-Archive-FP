import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-templatesurat',
  templateUrl: './templatesurat.page.html',
  styleUrls: ['./templatesurat.page.scss'],
})
export class TemplatesuratPage {
  suratTemplates = [
    {
      title: 'Surat Keterangan Kerja',
      category: 'Keterangan',
      fileWord: 'assets/templates/Surat_Keterangan_Kerja.docx',
      filePdf: 'assets/templates/Surat_Keterangan_Kerja.pdf',
    },
    {
      title: 'Surat Permohonan Cuti',
      category: 'Permohonan',
      fileWord: 'assets/templates/Permohonan Cuti Kerja.docx',
      filePdf: 'assets/templates/Surat_Permohonan_Cuti.pdf',
    },
    {
      title: 'Surat Rekomendasi',
      category: 'Rekomendasi',
      fileWord: 'assets/templates/Surat_Rekomendasi.docx',
      filePdf: 'assets/templates/Surat_Rekomendasi.pdf',
    },
    {
      title: 'Surat Pengajuan Keluhan',
      category: 'Keluhan/Komplain',
      fileWord: '/assets/surat-pengajuan-keluhan.docx',
      filePdf: '/assets/surat-pengajuan-keluhan.pdf',
    },
  ];

  constructor(private router: Router) {}

  viewTemplate(surat: any) {
    // Use Angular state management instead of localStorage
    this.router.navigate(['/templatesurat-detail'], {
      state: { template: surat }
    });
  }
}