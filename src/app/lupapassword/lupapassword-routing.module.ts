import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LupapasswordPage } from './lupapassword.page';

const routes: Routes = [
  {
    path: '',
    component: LupapasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LupapasswordPageRoutingModule {}
