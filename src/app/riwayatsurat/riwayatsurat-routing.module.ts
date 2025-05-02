import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RiwayatsuratPage } from './riwayatsurat.page';

const routes: Routes = [
  {
    path: '',
    component: RiwayatsuratPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RiwayatsuratPageRoutingModule {}
