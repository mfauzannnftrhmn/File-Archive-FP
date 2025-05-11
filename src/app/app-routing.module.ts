import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'templatesurat',
    loadChildren: () =>
      import('./templatesurat/templatesurat.module').then(
        (m) => m.TemplatesuratPageModule
      ),
  },
  {
    path: 'pengajuansurat',
    loadChildren: () =>
      import('./pengajuansurat/pengajuansurat.module').then(
        (m) => m.PengajuansuratPageModule
      ),
  },
  {
    path: 'statuspengajuan',
    loadChildren: () =>
      import('./statuspengajuan/statuspengajuan.module').then(
        (m) => m.StatuspengajuanPageModule
      ),
  },
  {
    path: 'riwayatsurat',
    loadChildren: () =>
      import('./riwayatsurat/riwayatsurat.module').then(
        (m) => m.RiwayatsuratPageModule
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'aktivitas',
    loadChildren: () => import('./aktivitas/aktivitas.module').then( m => m.AktivitasPageModule)
  },
  {
    path: 'lupapassword',
    loadChildren: () => import('./lupapassword/lupapassword.module').then( m => m.LupapasswordPageModule)
  },
  {
    path: 'editprofile',
    loadChildren: () => import('./editprofile/editprofile.module').then( m => m.EditprofilePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
