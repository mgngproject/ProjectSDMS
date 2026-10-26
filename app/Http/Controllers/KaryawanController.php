<?php

namespace App\Http\Controllers;

use App\Exports\KaryawanExport;
use App\Exports\TerminateExport;
use App\Imports\KaryawanImport;
use App\Models\Datadiri;
use App\Models\Karyawan;
use App\Models\Kontrak;
use App\Models\Monitoring;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class KaryawanController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        
        $kontrakKadaluarsa = Kontrak::where('status', 'aktif')
            ->where('akhir_kontrak', '<', $today)
            ->get();

        foreach ($kontrakKadaluarsa as $kontrak) {
            $kontrak->update(['status' => 'selesai']);
            
            $kontrakAktifLain = Kontrak::where('karyawan_id', $kontrak->karyawan_id)
                ->where('status', 'aktif')
                ->first();

            if (!$kontrakAktifLain) {
            $kontrakTerakhir = Kontrak::where('karyawan_id', $kontrak->karyawan_id)
                ->latest('akhir_kontrak')
                ->first();
                
                Karyawan::where('id', $kontrak->karyawan_id)->update([
                    'akhir_kontrak'      => $kontrakTerakhir?->akhir_kontrak,
                    'awal_kontrak_aktif' => $kontrakTerakhir?->awal_kontrak,
                ]);
            }
        }

        $karyawanAktif = Karyawan::where('status', 'aktif')->get();
        foreach ($karyawanAktif as $karyawan) {
            if ($karyawan->awal_kontrak) {
                $karyawan->updateMasaKerja();
            }
        
            if ($karyawan->awal_kontrak_aktif) {
                $karyawan->updateMasaKontrak();
            }
        }

        Karyawan::where('status', 'aktif')->whereNull('akhir_kontrak')->update(['masa_kerja' => null, 'masa_kontrak' => null]);

        $user = auth()->user();
        $query = Karyawan::where('status', 'aktif');
        
        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }
        
        if ($request->filled('kategori')) {
            if ($request->kategori == 'masuk') {
                if ($request->filled('bulan') && $request->filled('tahun')) {
                    $query->whereMonth('awal_kontrak', $request->bulan)
                          ->whereYear('awal_kontrak', $request->tahun);
                } elseif ($request->filled('bulan')) {
                    $query->whereMonth('awal_kontrak', $request->bulan);
                } elseif ($request->filled('tahun')) {
                    $query->whereYear('awal_kontrak', $request->tahun);
                }
            } elseif ($request->kategori == 'habis') {
                if ($request->filled('bulan') && $request->filled('tahun')) {
                    $query->whereMonth('akhir_kontrak', $request->bulan)
                          ->whereYear('akhir_kontrak', $request->tahun);
                } elseif ($request->filled('bulan')) {
                    $query->whereMonth('akhir_kontrak', $request->bulan);
                } elseif ($request->filled('tahun')) {
                    $query->whereYear('akhir_kontrak', $request->tahun);
                }
            }
        }
        
        $karyawan = $query->get();
        
        return view('admin.karyawan.karyawan', [
            'karyawan' => $karyawan,
            'title' => 'Data Karyawan',
            'menuAdminKaryawan' => 'active'
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $kategori_admin = $user->kategori ? $user->kategori->nama : null;
        
        return view('admin.karyawan.create', [
            'title' => 'Tambah Data Karyawan',
            'menuAdminKaryawan' => 'active',
            'kategori_admin' => $kategori_admin
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'np' => 'required|unique:karyawans,np',
            'nama' => 'required|string|max:255',
            'awal_kontrak' => 'required|date',
            'akhir_kontrak' => 'required|date|after:awal_kontrak',
            'kode_bagan' => 'nullable|string',
            'unit_kerja' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'level' => 'nullable|string',
            'role' => 'nullable|string',
            'benefit_kesehatan' => 'nullable|string',
            'faskes' => 'nullable|string',
            'gross_per_month' => 'nullable|numeric',
            'kpi' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'folder_link' => 'nullable|url|max:500',
        ]);

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $namaFile = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('foto_karyawan'), $namaFile);
            $validated['foto'] = $namaFile;
        }

        unset($validated['folder_link']);
        if ($user->isSuperAdmin()) {
            $validated['kategori'] = $request->kategori;
        } else {
            $validated['kategori'] = $user->kategori ? $user->kategori->nama : null;
        }
        $validated['status'] = 'aktif';
        $validated['awal_kontrak_aktif'] = $request->awal_kontrak;

        $karyawan = Karyawan::create($validated);
        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        $kontrakStatus = Carbon::parse($request->akhir_kontrak)->lt(Carbon::today()) ? 'selesai' : 'aktif';

        Kontrak::create([
            'karyawan_id' => $karyawan->id,
            'kontrak_ke' => 'Kontrak 1',
            'np' => $request->np,
            'awal_kontrak' => $request->awal_kontrak,
            'akhir_kontrak' => $request->akhir_kontrak,
            'status' => $kontrakStatus,
            'penilaian' => null,
            'folder_link' => null
        ]);

        Datadiri::create([
            'karyawan_id' => $karyawan->id,
        ]);

        $monitoring = Monitoring::create([
        'karyawan_id' => $karyawan->id,
        'status' => 'Belum Lengkap',
        ]);
        
        $monitoring->updateStatus();

        return redirect()->route('karyawan')->with('success', 'Data karyawan berhasil ditambahkan');
    }

    public function edit($id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $admin = Auth::user();
        $kategori_admin = $admin->kategori->nama ?? null;

        if (!$admin->isSuperAdmin() && $karyawan->kategori !== $kategori_admin) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mengedit karyawan ini');
        }

        return view('admin.karyawan.edit', [
            'karyawan' => $karyawan,
            'kategori_admin' => $kategori_admin,
            'title' => 'Edit Data Karyawan',
            'menuAdminKaryawan' => 'active'
        ]);
    }

    public function update(Request $request, $id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $admin = Auth::user();

        if (!$admin->isSuperAdmin() && $karyawan->kategori !== $admin->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk update karyawan ini');
        }

        $validated = $request->validate([
            'np' => 'required|unique:karyawans,np,' . $id,
            'nama' => 'required|string|max:255',
            'kategori' => 'nullable|string',
            'kode_bagan' => 'nullable|string',
            'unit_kerja' => 'nullable|string',
            'jabatan' => 'nullable|string',
            'level' => 'nullable|string',
            'role' => 'nullable|string',
            'benefit_kesehatan' => 'nullable|string',
            'faskes' => 'nullable|string',
            'gross_per_month' => 'nullable|numeric',
            'kpi' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'folder_link' => 'nullable|url|max:500',
        ]);

        if ($request->hasFile('foto')) {
            if ($karyawan->foto && file_exists(public_path('foto_karyawan/' . $karyawan->foto))) {
                unlink(public_path('foto_karyawan/' . $karyawan->foto));
            }
            
            $file = $request->file('foto');
            $namaFile = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('foto_karyawan'), $namaFile);
            $validated['foto'] = $namaFile;
        }

        $karyawan->update($validated);

        if ($request->filled('np')) {
            Kontrak::where('karyawan_id', $id)->update(['np' => $request->np]);
        }

        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        return redirect()->route('karyawan')->with('success', 'Data karyawan berhasil diupdate');
    }

    public function destroy($id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $user = auth()->user();

        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk menghapus karyawan ini');
        }

        if ($karyawan->foto && file_exists(public_path('foto_karyawan/'.$karyawan->foto))) {
            unlink(public_path('foto_karyawan/'.$karyawan->foto));
        }

        $karyawan->delete();
        return redirect()->route('karyawan')->with('success', 'Data karyawan berhasil dihapus');
    }

    public function excel()
    {
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        return Excel::download(new KaryawanExport, 'DataKaryawan_'.$filename.'.xlsx');
    }

    public function saveLink(Request $request, $id)
    {
        $request->validate([
            'folder_link' => 'required|url|max:500'
        ], [
            'folder_link.required' => 'Link folder harus diisi',
            'folder_link.url' => 'Format link tidak valid',
            'folder_link.max' => 'Link terlalu panjang (maksimal 500 karakter)'
        ]);

        $karyawan = Karyawan::findOrFail($id);
        
        $admin = Auth::user();
        if (!$admin->isSuperAdmin() && $karyawan->kategori !== $admin->kategori->nama) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah data karyawan ini'
            ], 403);
        }

        $karyawan->folder_link = $request->folder_link;
        $karyawan->save();

        return response()->json([
            'success' => true,
            'message' => 'Link folder berhasil disimpan',
            'folder_link' => $karyawan->folder_link
        ]);
    }

    public function pdf()
    {
        $user = auth()->user();
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        
        $query = Karyawan::where('status', 'aktif');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }
        
        $data = [
            'karyawan' => $query->get(),
        ];

        $pdf = Pdf::loadView('admin.karyawan.pdf', $data);
        return $pdf->setPaper('a4', 'landscape')->stream('DataKaryawan_'.$filename.'.pdf');
    }

    public function karyawanImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:2048'
        ], [
            'file.required' => 'File harus dipilih',
            'file.mimes' => 'Format file harus Excel atau CSV',
            'file.max' => 'Ukuran file maksimal 2MB'
        ]);

        try {
            Excel::import(new KaryawanImport, $request->file('file'));
            
            return redirect()->route('karyawan')->with('success', 'Data karyawan berhasil diimport');
            
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errorMessages = [];
            
            foreach ($failures as $failure) {
                $errorMessages[] = "Baris {$failure->row()}: " . implode(', ', $failure->errors());
            }
            
            return redirect()->route('karyawan')->with('error', 'Gagal import: ' . implode(' | ', $errorMessages));
            
        } catch (\Exception $e) {
            return redirect()->route('karyawan')->with('error', 'Gagal import data');
        }
    }

    public function terminateList(Request $request)
    {
        Karyawan::where('status', 'terminate')->whereNull('akhir_kontrak')->update(['masa_kerja' => null, 'masa_kontrak' => null]);
        $user = auth()->user();
        $query = Karyawan::where('status', 'terminate');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }
        
        if ($request->filled('kategori')) {
            if ($request->kategori == 'masuk') {
                if ($request->filled('bulan') && $request->filled('tahun')) {
                    $query->whereMonth('awal_kontrak', $request->bulan)->whereYear('awal_kontrak', $request->tahun);
                } elseif ($request->filled('bulan')) {
                    $query->whereMonth('awal_kontrak', $request->bulan);
                } elseif ($request->filled('tahun')) {
                    $query->whereYear('awal_kontrak', $request->tahun);
                }
            } elseif ($request->kategori == 'habis') {
                if ($request->filled('bulan') && $request->filled('tahun')) {
                    $query->whereMonth('akhir_kontrak', $request->bulan)->whereYear('akhir_kontrak', $request->tahun);
                } elseif ($request->filled('bulan')) {
                    $query->whereMonth('akhir_kontrak', $request->bulan);
                } elseif ($request->filled('tahun')) {
                    $query->whereYear('akhir_kontrak', $request->tahun);
                }
            }
        }

        $karyawan = $query->get();

        return view('admin.terminate.index', [
            'karyawan' => $karyawan,
            'title' => 'Data Terminate',
            'menuAdminTerminate' => 'active'
        ]);
    }

    public function showTerminateForm($id)
    {
        $karyawan = Karyawan::findOrFail($id);

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }
            
        return view('admin.karyawan.terminate-form', [
            'karyawan' => $karyawan,
            'title' => 'Terminate Karyawan',
            'menuAdminKaryawan' => 'active'
        ]);
    }

    public function terminate(Request $request, $id)
    {
        $request->validate([
            'tanggal_keluar' => 'required|date',
            'alasan_keluar' => 'required|string|max:500',
        ]);
        
        $karyawan = Karyawan::findOrFail($id);
        
        $karyawan->status = 'terminate';
        $karyawan->tanggal_keluar = $request->tanggal_keluar;
        $karyawan->alasan_keluar = $request->alasan_keluar;
        $karyawan->save();

        Kontrak::where('karyawan_id', $id)->update(['status' => 'terminate']);

        return redirect()->route('terminate')->with('success', 'Karyawan berhasil di-terminate');
    }

    public function createTerminate()
{
    $user = auth()->user();

    return view('admin.terminate.create', [
        'title'              => 'Tambah Data Terminate',
        'menuAdminTerminate' => 'active',
    ]);
}

public function storeTerminate(Request $request)
{
    $user = auth()->user();

    $request->validate([
        'np'             => 'required|string|unique:karyawans,np',
        'nama'           => 'required|string|max:255',
        'tanggal_keluar' => 'required|date',
        'alasan_keluar'  => 'required|string|max:500',
        'awal_kontrak'   => 'nullable|date',
        'akhir_kontrak'  => 'nullable|date|after_or_equal:awal_kontrak',
        'kode_bagan'     => 'nullable|string',
        'unit_kerja'     => 'nullable|string',
        'jabatan'        => 'nullable|string',
        'level'          => 'nullable|string',
        'role'           => 'nullable|string',
    ]);

    $karyawan = Karyawan::create([
        'np'             => $request->np,
        'nama'           => $request->nama,
        'kategori'       => $user->isSuperAdmin() ? $request->kategori : $user->kategori->nama,
        'kode_bagan'     => $request->kode_bagan,
        'unit_kerja'     => $request->unit_kerja,
        'jabatan'        => $request->jabatan,
        'level'          => $request->level,
        'role'           => $request->role,
        'awal_kontrak'   => $request->awal_kontrak,
        'akhir_kontrak'  => $request->akhir_kontrak,
        'tanggal_keluar' => $request->tanggal_keluar,
        'alasan_keluar'  => $request->alasan_keluar,
        'status'         => 'terminate',
    ]);

    $karyawan->updateMasaKerja();

    return redirect()->route('terminate')->with('success', 'Data terminate berhasil ditambahkan');
}

    public function editTerminate($id)
    {
        $karyawan = Karyawan::findOrFail($id);

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }

        return view('admin.terminate.edit', [
            'karyawan' => $karyawan,
            'title' => 'Edit Data Terminate'
        ]);
    }

    public function updateTerminate(Request $request, $id)
{
    $request->validate([
        'tanggal_keluar' => 'required|date',
        'alasan_keluar'  => 'required|string|max:500',
        'akhir_kontrak'  => 'nullable|date',
    ]);

    $karyawan = Karyawan::findOrFail($id);

    $karyawan->tanggal_keluar = $request->tanggal_keluar;
    $karyawan->alasan_keluar  = $request->alasan_keluar;
    $karyawan->akhir_kontrak  = $request->akhir_kontrak;
    $karyawan->status         = 'terminate';
    $karyawan->save();

    $karyawan->updateMasaKerja();

    return redirect()->route('terminate')->with('success', 'Data terminate berhasil diupdate');
}
    public function destroyTerminate($id)
{
    $karyawan = Karyawan::findOrFail($id);
    $user = auth()->user();

    if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
        return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk menghapus karyawan ini');
    }

    if ($karyawan->foto && file_exists(public_path('foto_karyawan/'.$karyawan->foto))) {
        unlink(public_path('foto_karyawan/'.$karyawan->foto));
    }

    $karyawan->delete();

    return redirect()->route('terminate')->with('success', 'Data karyawan terminate berhasil dihapus');
}

    public function excelTerminate()
    {
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        return Excel::download(new TerminateExport, 'DataTerminate_'.$filename.'.xlsx');
    }

    public function pdfTerminate()
    {
        $user = auth()->user();
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        
        $query = Karyawan::where('status', 'terminate');
        
        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }
        
        $data = ['karyawan' => $query->get()];

        $pdf = Pdf::loadView('admin.terminate.pdf', $data);
        return $pdf->setPaper('a4', 'landscape')->stream('DataTerminate_'.$filename.'.pdf');
    }
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->ids;
            
            if (empty($ids) || !is_array($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data yang dipilih'
                ], 422);
            }

            $user = auth()->user();
            
            $query = Karyawan::whereIn('id', $ids);
            
           if (!$user->isSuperAdmin()) {
                $query->where('kategori', $user->kategori->nama);
            }
            
            $karyawanToDelete = $query->get();
            
            if ($karyawanToDelete->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data yang bisa dihapus atau Anda tidak memiliki akses'
                ], 403);
            }

            $deletedCount = 0;
            
            foreach ($karyawanToDelete as $karyawan) {
                if ($karyawan->foto && file_exists(public_path('foto_karyawan/' . $karyawan->foto))) {
                    unlink(public_path('foto_karyawan/' . $karyawan->foto));
                }
                
                $karyawan->delete();
                $deletedCount++;
            }

            return response()->json([
                'success' => true,
                'deleted' => $deletedCount,
                'message' => "Berhasil menghapus {$deletedCount} data karyawan"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan'
            ], 500);
        }
    }

    public function bulkDeleteTerminate(Request $request)
{
    try {
        $ids = $request->ids;
        
        if (empty($ids) || !is_array($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang dipilih'
            ], 422);
        }

        $user = auth()->user();
        
        $query = Karyawan::whereIn('id', $ids)->where('status', 'terminate');
        
        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }
        
        $karyawanToDelete = $query->get();
        
        if ($karyawanToDelete->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang bisa dihapus atau Anda tidak memiliki akses'
            ], 403);
        }

        $deletedCount = 0;
        
        foreach ($karyawanToDelete as $karyawan) {
            if ($karyawan->foto && file_exists(public_path('foto_karyawan/' . $karyawan->foto))) {
                unlink(public_path('foto_karyawan/' . $karyawan->foto));
            }
            $karyawan->delete();
            $deletedCount++;
        }

        return response()->json([
            'success' => true,
            'deleted' => $deletedCount,
            'message' => "Berhasil menghapus {$deletedCount} data karyawan terminate"
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan'
        ], 500);
    }
}
}