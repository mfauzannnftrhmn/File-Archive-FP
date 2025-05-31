// src/app/login/login.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
// Hapus import LoginPage jika tidak dideklarasikan di sini
// import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule
  ],
  // declarations: [LoginPage] // ⛔ HAPUS BARIS INI
})
export class LoginPageModule {}