// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators'; // Import map dan delay

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://simpap.my.id/public/api'; 

  constructor(private http: HttpClient) { }
private getAuthHeaders(): HttpHeaders {
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const token = currentUser?.token;

    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    throw new Error('No authentication token found.');
  }
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

    getUserNotifications(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/notifications/user`, { headers });
  }

  markNotificationAsRead(notificationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.baseUrl}/notifications/${notificationId}/read`, {}, { headers });
  }

  getAdminInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-info`);
  }

 getLatestAppVersion() {
  const versionUrl = 'https://simpap.my.id/public/api/check-update';
  return this.http.get(versionUrl);
}

sendUserAppVersion(email: string, name: string, version: string) {
  return this.http.post('https://simpap.my.id/public/api/user-app-version', {
    email,
    name,
    app_version: version
  });
}


}
