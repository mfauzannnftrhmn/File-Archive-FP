import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Default route ke option
  {
    path: '',
    redirectTo: 'option',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'option',
    loadChildren: () =>
      import('./option/option.module').then((m) => m.OptionPageModule),
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
    loadChildren: () =>
      import('./aktivitas/aktivitas.module').then((m) => m.AktivitasPageModule),
  },
  {
    path: 'lupapassword',
    loadChildren: () =>
      import('./lupapassword/lupapassword.module').then(
        (m) => m.LupapasswordPageModule
      ),
  },
  {
    path: 'editprofile',
    loadChildren: () =>
      import('./editprofile/editprofile.module').then(
        (m) => m.EditprofilePageModule
      ),
  },  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
