import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage implements OnInit {

  constructor(
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async saveProfile() {
    // Here you would typically save the profile data to your backend
    // For now, we'll just show a success message
    
    const toast = await this.toastController.create({
      message: 'Profil berhasil disimpan',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      cssClass: 'toast-success'
    });
    
    toast.present();
    
    // Navigate back to profile page after saving
    this.router.navigate(['/profile']);
  }
}
