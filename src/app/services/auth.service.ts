import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Pastikan path ini benar
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

// Definisikan interface untuk data pengguna agar lebih terstruktur
export interface UserData {
  token: string;
  id: string; // atau number, sesuaikan dengan backend
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  // Tambahkan properti lain jika ada
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL backend Laravel. Misal: 'https://simpap.my.id/public/api'
  private currentUserSubject: BehaviorSubject<UserData | null>;
  public currentUser: Observable<UserData | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserData | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }

  loginKaryawan(credentials: { email: string, password: string, device_name?: string }): Observable<UserData> {
    const deviceName = credentials.device_name || `IonicKaryawanApp-${new Date().getTime()}`;

    // ✅ PERBAIKI NAMA ENDPOINT DI SINI
    return this.http.post<any>(`${this.apiUrl}/login-karyawan`, { ...credentials, device_name: deviceName })
      .pipe(
        map(response => {
          if (response && response.token && response.user && response.user.role) {
            if (response.user.role.toLowerCase() !== 'karyawan') {
              console.warn(
                'Upaya login melalui endpoint Karyawan oleh pengguna dengan peran non-karyawan:',
                response.user.email,
                'Peran Diterima:', response.user.role
              );
              throw new Error('Akses ditolak. Hanya pengguna dengan peran karyawan yang diizinkan.');
            }
            const userData: UserData = {
              token: response.token,
              id: response.user.id,
              name: response.user.name, // Pastikan 'name' adalah field yang benar dari backend
              email: response.user.email,
              role: response.user.role.toLowerCase(),
              emailVerified: !!response.user.email_verified_at
            };
            return userData;
          } else {
            console.error('Respons login tidak valid atau tidak lengkap:', response);
            throw new Error('Format respons login tidak valid.');
          }
        }),
        tap(userData => {
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
          console.log('Login Karyawan Berhasil:', userData);
        }),
        catchError((error: any) => {
          console.error('Error saat login karyawan:', error);
          this.performLocalLogoutCleanup();

          let friendlyMessage = 'Login gagal. Silakan coba lagi.';
          if (error instanceof HttpErrorResponse) {
            if (error.error && typeof error.error.message === 'string') {
              friendlyMessage = error.error.message;
            } else if (error.status === 404) { // Menangani error 404 secara spesifik
              friendlyMessage = 'Endpoint login tidak ditemukan. Harap hubungi administrator.';
            } else if (error.status === 403) {
              friendlyMessage = 'Akses ditolak. Anda tidak memiliki peran karyawan atau akun Anda bermasalah.';
            } else if (error.status === 401 || error.status === 422) {
              if (error.error && error.error.errors && error.error.errors.email) {
                friendlyMessage = error.error.errors.email[0];
              } else if (error.error && error.error.message) {
                friendlyMessage = error.error.message;
              } else {
                friendlyMessage = 'Email atau password salah.';
              }
            } else if (error.status === 0 || error.status >= 500) {
               friendlyMessage = 'Tidak dapat terhubung ke server atau terjadi kesalahan pada server.';
            }
          } else if (error instanceof Error) {
            friendlyMessage = error.message;
          }
          return throwError(() => new Error(friendlyMessage));
        })
      );
  }

  logout(): Observable<any> {
    const logoutObservable = this.currentUserValue
      ? this.http.post<any>(`${this.apiUrl}/logout-api`, {})
      : of({ message: 'Tidak ada pengguna untuk di-logout dari server.' });

    return logoutObservable.pipe(
      tap(() => {
        this.performLocalLogoutCleanup();
      }),
      catchError(error => {
        console.warn('Error saat logout dari server, tetap lakukan logout lokal:', error);
        this.performLocalLogoutCleanup();
        return of(null);
      })
    );
  }

  private performLocalLogoutCleanup(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('Data sesi lokal telah dibersihkan.');
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  isKaryawan(): boolean {
    return this.getUserRole() === 'karyawan';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isEmailVerified(): boolean {
    return this.currentUserValue?.emailVerified || false;
  }
}