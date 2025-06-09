import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EditprofilePageRoutingModule } from './editprofile-routing.module';
import { EditprofilePage } from './editprofile.page';

// Import untuk image cropper
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditprofilePageRoutingModule,
    ImageCropperModule,
    EditprofilePage // <-- Pindahkan ke sini
  ],
  // Hapus dari declarations
  // declarations: [EditprofilePage] 
})
export class EditprofilePageModule {}