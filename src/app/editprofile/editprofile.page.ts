import * as FileSaver from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ Tambahan penting

@Component({
  standalone: false,
  selector: 'app-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage implements OnInit {

  constructor(
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient // ✅ Tambahan juga di sini
  ) {}

  ngOnInit() {}

  async saveProfile() {
    const toast = await this.toastController.create({
      message: 'Profil berhasil disimpan',
      duration: 2000,
      position: 'top',
      color: 'success',
      cssClass: 'toast-success'
    });

    toast.present();
    this.router.navigate(['/profile']);
  }

  downloadFile() {
    this.http.get('https://simpap.my.id/public/api/', {
      responseType: 'blob'
    }).subscribe({
      next: (data: Blob) => {
        FileSaver.saveAs(data, 'profil-export.pdf');
      },
      error: (err) => {
        console.error('Download gagal:', err);
      }
    });
  }
}
