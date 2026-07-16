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
  isLoading = true; 

  constructor(private navCtrl: NavController) {
    this.showLoadingScreen();
  }
resendToChatky() {
  this.navCtrl.navigateForward('/chat', {
    queryParams: {
      presetMessage: `!resend\nemail = (email kamu)`
    }
  });
}

  showLoadingScreen() {
    setTimeout(() => {
      this.isLoading = false; 
    }, 6000);
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
