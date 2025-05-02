import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RiwayatsuratPageRoutingModule } from './riwayatsurat-routing.module';

import { RiwayatsuratPage } from './riwayatsurat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiwayatsuratPageRoutingModule
  ],
  declarations: [RiwayatsuratPage]
})
export class RiwayatsuratPageModule {}
