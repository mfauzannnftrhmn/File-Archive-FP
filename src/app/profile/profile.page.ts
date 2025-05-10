import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  doRefresh(event: any) {
    console.log('Begin async refresh operation');

    // Simulate data fetching/refreshing
    setTimeout(() => {
      console.log('Async refresh operation has ended');
      // Complete the refresher
      event.target.complete();
    }, 2000);
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Keluar',
          handler: () => {
            // Implement logout logic here
            // For example: clear local storage, remove tokens, etc.
            localStorage.clear();
            
            // Navigate to login page
            this.router.navigate(['/home']);
          }
        }
      ],
      cssClass: 'alert-logout'
    });

    await alert.present();
  }
}
