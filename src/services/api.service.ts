import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Ganti dengan URL base API Laravel Anda
  private apiUrl = 'http://simpap.my.id/public/api'; 

  constructor(private http: HttpClient) { }

  /**
   * Mengambil statistik jumlah surat dari backend Laravel.
   */
  getSuratStats(): Observable<any> {
    return this.http.get<{ success: boolean, data: any }>(`${this.apiUrl}/dashboard/surat-stats`).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        // Kembalikan nilai default jika gagal
        return { diajukan: 0, disetujui: 0 }; 
      })
    );
  }
   getAdminInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-info`);
  }
}
