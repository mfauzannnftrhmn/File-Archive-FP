import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RiwayatsuratPageRoutingModule } from './riwayatsurat-routing.module';

// RiwayatsuratPage tidak diimpor di sini lagi karena tidak dideklarasikan

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiwayatsuratPageRoutingModule
  ],
  // Hapus larik declarations sepenuhnya karena komponennya standalone
})
export class RiwayatsuratPageModule {}