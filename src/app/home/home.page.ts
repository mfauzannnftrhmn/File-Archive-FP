import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async doSubmit() {
    if (!this.email || !this.password) {
      await this.showAlert('Error', 'Email dan Password harus diisi!');
      return;
    }

    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    if (!gmailRegex.test(this.email)) {
      await this.showAlert('Error', 'Hanya email @gmail.com yang diperbolehkan!');
      return;
    }

    // Menampilkan loading saat proses login
    const loading = await this.loadingController.create({
      message: 'Sedang memproses login...',
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });

    await loading.present();

    setTimeout(async () => {
      await loading.dismiss();

      console.log('Email:', this.email);
      console.log('Password:', this.password);

      localStorage.setItem('email', this.email);
      localStorage.setItem('password', this.password);

      this.router.navigateByUrl('/dashboard');
    }, 1500); // Delay 1.5 detik untuk efek loading
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
