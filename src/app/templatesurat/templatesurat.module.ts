import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TemplatesuratPageRoutingModule } from './templatesurat-routing.module';

import { TemplatesuratPage } from './templatesurat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TemplatesuratPageRoutingModule
  ],
  declarations: [TemplatesuratPage]
})
export class TemplatesuratPageModule {}
