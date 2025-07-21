import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
// ✅ Tambahkan ini
import { IonicStorageModule } from '@ionic/storage-angular';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SafeHtmlPipe,
    FormsModule,
    BrowserAnimationsModule,
    ButtonModule,
    HttpClientModule,
    
    // ✅ Inisialisasi storage
    IonicStorageModule.forRoot()
    // ✅ Tidak perlu ImageCropperModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
