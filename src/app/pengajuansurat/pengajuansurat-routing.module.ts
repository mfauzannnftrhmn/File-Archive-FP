import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PengajuansuratPage } from './pengajuansurat.page';

const routes: Routes = [
  {
    path: '',
    component: PengajuansuratPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PengajuansuratPageRoutingModule {}
