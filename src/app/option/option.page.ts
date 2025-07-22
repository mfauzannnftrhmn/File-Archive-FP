import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';


@Component({
  selector: 'app-option',
  templateUrl: './option.page.html',
  styleUrls: ['./option.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class OptionPage {
  isLoading = true; // ✅ Tambahkan state untuk loading

  constructor(private navCtrl: NavController) {
    this.showLoadingScreen();
  }
resendToChatky() {
  // Bawa user ke halaman chat dengan presetMessage
  this.navCtrl.navigateForward('/chat', {
    queryParams: {
      presetMessage: `!resend\nemail = (email kamu)`
    }
  });
}

  // ✅ Fungsi untuk menampilkan loading sementara
  showLoadingScreen() {
    setTimeout(() => {
      this.isLoading = false; // Hilangkan loading setelah 2.5 detik
    }, 2500);
  }

  goToLogin() {
    console.log('Navigasi ke halaman login...');
    this.navCtrl.navigateForward('/login');
  }

  goToChat() {
    console.log('Navigasi ke halaman chat...');
    this.navCtrl.navigateForward('/chat');
  }
}
