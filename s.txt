<?php

namespace App\Http\Controllers;  // pastikan ini ada di paling atas file

use App\Http\Controllers\Controller;  // import Controller base class

use App\Models\Archive;
use App\Models\User;
use Illuminate\Http\Request;

class ArchiveShareController extends Controller
{
public function index()
{
    $archives = Archive::where('type', '!=', 'folder')
        ->where('is_deleted', '!=', 1)
        ->whereNull('deleted_at')
        ->get();

    $karyawans = User::where('role', 'karyawan')->get();

    return view('shared', [ // ganti 'shared' dengan nama blade file Anda, jika bukan 'shared.blade.php'
        'sharedArchives' => $archives,
        'karyawans' => $karyawans,
    ]);
}



public function share(Request $request)
{
    $request->validate([
        'archive_id' => 'required|exists:archives,id',
        'user_ids' => 'required|array',
    ]);

    $archive = Archive::findOrFail($request->archive_id);

    // Menyimpan relasi ke tabel pivot archive_user
    $archive->sharedWith()->syncWithoutDetaching($request->user_ids);

    return back()->with('success', 'File berhasil dibagikan ke karyawan terpilih.');
}

}