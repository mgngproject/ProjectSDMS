<?php

namespace App\Http\Controllers;

use App\Models\Datadiri;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use App\Exports\DatadiriExport;
use App\Imports\DatadiriImport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class DatadiriController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Karyawan::where('status', 'aktif');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }

        $karyawanIds = $query->pluck('id');

        $datadiriQuery = Datadiri::with('karyawan')
                            ->whereIn('karyawan_id', $karyawanIds);

        if ($request->filled('jenjang')) {
            $datadiriQuery->where(function($q) use ($request) {
                $q->where('jenjang_1', $request->jenjang)
                ->orWhere('jenjang_2', $request->jenjang);
            });
        }
        
        $datadiri = $datadiriQuery->get();
        
        return view('admin.datadiri.datadiri', [
            'datadiri' => $datadiri,
            'menuAdminDataDiri' => 'active',
            'title' => 'Data Diri Karyawan'
        ]);
    }
    public function create()
    {
        $user = auth()->user();
        $query = Karyawan::doesntHave('dataDiri')->where('status', 'aktif');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }

        $karyawans = $query->get();
        
        return view('admin.datadiri.create', [
            'karyawans' => $karyawans,
            'menuAdminDataDiri' => 'active',
            'title' => 'Tambah Data Diri Karyawan'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'karyawan_id' => 'required|exists:karyawans,id|unique:data_diri_karyawans,karyawan_id',
            'ktp' => 'nullable|string|size:16|unique:data_diri_karyawans,ktp',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'rt' => 'nullable|string|max:10',       
            'rw' => 'nullable|string|max:10',       
            'kelurahan' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kabupaten' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255', 
            'jenjang_1' => 'nullable|string',
            'jurusan_1' => 'nullable|string|max:255',
            'kampus_1' => 'nullable|string|max:255',
            'jenjang_2' => 'nullable|string',
            'jurusan_2' => 'nullable|string|max:255',
            'kampus_2' => 'nullable|string|max:255',
        ]);

        Datadiri::create($validated);

        return redirect()->route('datadiri')->with('success', 'Data diri karyawan berhasil ditambahkan');
    }

    public function edit($id)
    {
        $datadiri = Datadiri::with('karyawan')->findOrFail($id);
        $user = auth()->user();

        if (!$user->isSuperAdmin() && $datadiri->karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mengedit data ini');
        }

        return view('admin.datadiri.edit', [
            'datadiri' => $datadiri,
            'menuAdminDataDiri' => 'active',
            'title' => 'Edit Data Diri Karyawan'
        ]);
    }

    public function update(Request $request, $id)
    {
        $datadiri = Datadiri::with('karyawan')->findOrFail($id);
        $user = auth()->user();
        
        if (!$user->isSuperAdmin() && $datadiri->karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk update data ini');
        }
        
        $validated = $request->validate([
            'ktp' => 'nullable|string|size:16|unique:data_diri_karyawans,ktp,' . $id,
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'rt' => 'nullable|string|max:10',       
            'rw' => 'nullable|string|max:10',       
            'kelurahan' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kabupaten' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255', 
            'jenjang_1' => 'nullable|string',
            'jurusan_1' => 'nullable|string|max:255',
            'kampus_1' => 'nullable|string|max:255',
            'jenjang_2' => 'nullable|string',
            'jurusan_2' => 'nullable|string|max:255',
            'kampus_2' => 'nullable|string|max:255',
        ]);

        $datadiri->update($validated);

        return redirect()->route('datadiri')->with('success', 'Data diri karyawan berhasil diupdate');
    }

    public function excelDatadiri()
    {
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        return Excel::download(new DatadiriExport, 'DatadiriKaryawan_' . $filename . '.xlsx');
    }

    public function pdfDatadiri()
    {
        $user = auth()->user();
        $filename = now('Asia/Jakarta')->format('d-m-y_H.i.s');
        
        $query = Datadiri::with('karyawan')
            ->whereHas('karyawan', function($q) {
                $q->where('status', 'aktif');
            });
         
        if (!$user->isSuperAdmin()) {
            $query->whereHas('karyawan', function ($q) use ($user) {
                $q->where('kategori', $user->kategori->nama);
            });
        }
        
        $data = [
            'datadiri' => $query->get()->map(function ($item) {
                $item->ktp = blank($item->ktp) ? '-' : $item->ktp;
                return $item;
            }),
        ];

        $pdf = Pdf::loadView('admin.datadiri.pdf', $data);
        return $pdf->setPaper('a4', 'landscape')
                   ->stream('DatadiriKaryawan_' . $filename . '.pdf');
    }

    public function DatadiriImport(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new DatadiriImport, $request->file('file'));

        return back()->with('success', 'Data diri berhasil diimport');
    }
}