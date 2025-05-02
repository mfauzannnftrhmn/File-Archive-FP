import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AktivitasPage } from './aktivitas.page';

const routes: Routes = [
  {
    path: '',
    component: AktivitasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AktivitasPageRoutingModule {}
