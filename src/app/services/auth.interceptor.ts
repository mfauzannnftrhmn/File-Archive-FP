import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Sesuaikan path ke AuthService Anda
import { environment } from '../../environments/environment'; // Sesuaikan path

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    const isApiUrl = request.url.startsWith(environment.apiUrl); // Hanya tambahkan token untuk request ke API Anda

    if (isLoggedIn && token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json' // Baik untuk ditambahkan untuk API Laravel
        }
      });
    }

    return next.handle(request);
  }
}