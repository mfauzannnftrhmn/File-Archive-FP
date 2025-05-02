import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PengajuansuratPageRoutingModule } from './pengajuansurat-routing.module';

import { PengajuansuratPage } from './pengajuansurat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PengajuansuratPageRoutingModule
  ],
  declarations: [PengajuansuratPage]
})
export class PengajuansuratPageModule {}
