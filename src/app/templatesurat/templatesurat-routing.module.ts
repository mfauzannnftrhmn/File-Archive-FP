import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TemplatesuratPage } from './templatesurat.page';

const routes: Routes = [
  {
    path: '',
    component: TemplatesuratPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemplatesuratPageRoutingModule {}
