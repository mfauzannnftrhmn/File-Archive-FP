import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { PengajuansuratPageRoutingModule } from './pengajuansurat-routing.module';

import { PengajuansuratPage } from './pengajuansurat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PengajuansuratPageRoutingModule,
    HttpClientModule
  ],
  declarations: [PengajuansuratPage]
})
export class PengajuansuratPageModule {}
