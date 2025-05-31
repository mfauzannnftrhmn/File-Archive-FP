// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service'; // <- PERIKSA PATH INI
import { environment } from '../../environments/environment'; // <- PERIKSA PATH INI

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    // Pastikan environment.apiUrl sudah benar
    const isApiUrl = request.url.startsWith(environment.apiUrl);

    if (isLoggedIn && token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
    }
    return next.handle(request);
  }
}