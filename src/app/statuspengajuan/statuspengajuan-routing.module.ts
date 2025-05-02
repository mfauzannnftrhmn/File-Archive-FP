import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatuspengajuanPage } from './statuspengajuan.page';

const routes: Routes = [
  {
    path: '',
    component: StatuspengajuanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatuspengajuanPageRoutingModule {}
