// src/app/login/login-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login.page'; // ✅ Import component untuk digunakan di route

const routes: Routes = [
  {
    path: '',
    component: LoginPage // ✅ Gunakan component langsung
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginPageRoutingModule {}