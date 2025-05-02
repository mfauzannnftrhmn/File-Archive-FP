import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatuspengajuanPageRoutingModule } from './statuspengajuan-routing.module';

import { StatuspengajuanPage } from './statuspengajuan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatuspengajuanPageRoutingModule
  ],
  declarations: [StatuspengajuanPage]
})
export class StatuspengajuanPageModule {}
