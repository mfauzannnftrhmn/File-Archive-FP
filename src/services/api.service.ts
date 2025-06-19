import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://simpap.my.id/public/api'; // base URL saja

  constructor(private http: HttpClient) {}

  /**
   * Mengambil statistik jumlah surat dari backend Laravel.
   * @param email Email pengguna
   * @param name Nama pengguna
   */
  getSuratStats(email: string, name: string): Observable<any> {
    const url = `${this.baseUrl}/dashboard/surat-stats?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
    return this.http.get<{ success: boolean, data: any }>(url).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        return { diajukan: 0, disetujui: 0, ditolak: 0 };
      })
    );
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  markNotificationsAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/mark-as-read`, {});
  }

  getAdminInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-info`);
  }
}
