import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LupapasswordPageRoutingModule } from './lupapassword-routing.module';

import { LupapasswordPage } from './lupapassword.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LupapasswordPageRoutingModule
  ],
  declarations: [LupapasswordPage]
})
export class LupapasswordPageModule {}
