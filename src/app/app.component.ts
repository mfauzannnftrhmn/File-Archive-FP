import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private storage: Storage, private router: Router) {
    this.checkLoginStatus();
  }

  async checkLoginStatus() {
    await this.storage.create();
    const isLoggedIn = await this.storage.get('isLoggedIn');
    if (isLoggedIn) {
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } else {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}