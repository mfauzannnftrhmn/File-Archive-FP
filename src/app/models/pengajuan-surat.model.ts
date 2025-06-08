// src/app/models/pengajuan-surat.model.ts

export interface PengajuanSurat {
  id: number;
  surat_number: string;
  name: string;
  email: string;
  category: string;
  start_date: string; // Tanggal akan diterima sebagai string dari API
  end_date: string;   // Tanggal akan diterima sebagai string dari API
  reason: string;
  created_at: string; // Waktu akan diterima sebagai string dari API
  updated_at: string; // Waktu akan diterima sebagai string dari API
  attachment_path: string;
  status: 'Disetujui' | 'Ditolak' | 'Proses' | 'Menunggu'; // Tipe spesifik untuk status
file_url?: string;
download_name?: string;
remarks?: string;
  // Properti di bawah ini bisa jadi NULL di database, jadi kita tandai sebagai opsional
  // dengan tanda tanya (?) atau bisa juga dengan tipe `| null`.
  position?: string | null;
  join_date?: string | null;
  purpose?: string | null;
  department?: string | null;
  complaint_category?: string | null;
  complaint_description?: string | null;
  recommended_name?: string | null;
  recommender_name?: string | null;
  recommender_position?: string | null;
  attachment?: string | null;
}