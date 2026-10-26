<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Kontrak;
use App\Models\Karyawan;
use Illuminate\Http\Request;

class KontrakController extends Controller
{
    public function karyawan($karyawan_id)
    {
        $karyawan = Karyawan::with('kontrakAktif')->findOrFail($karyawan_id);

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }

        Kontrak::where('karyawan_id', $karyawan_id)
            ->where('status', 'aktif')
            ->where('akhir_kontrak', '<', Carbon::today())
            ->update(['status' => 'selesai']);

        $karyawan->load('kontrakAktif');

        if ($karyawan->kontrakAktif) {
            $karyawan->update([
                'akhir_kontrak'      => $karyawan->kontrakAktif->akhir_kontrak,
                'awal_kontrak_aktif' => $karyawan->kontrakAktif->awal_kontrak,
            ]);
        } else {
            $kontrakTerakhir = Kontrak::where('karyawan_id', $karyawan_id)
                ->latest('akhir_kontrak')
                ->first();

            if ($kontrakTerakhir) {
                $karyawan->update([
                    'akhir_kontrak'      => $kontrakTerakhir->akhir_kontrak,
                    'awal_kontrak_aktif' => $kontrakTerakhir->awal_kontrak,
                ]);
            }
        }

        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        $kontrak = Kontrak::where('karyawan_id', $karyawan_id)
            ->orderByDesc('awal_kontrak')
            ->get();

        return view('admin.kontrak.kontrak', [
            'kontrak'  => $kontrak,
            'karyawan' => $karyawan,
            'title'    => 'Riwayat Kontrak',
        ]);
    }

    public function create($karyawan_id)
    {
        $karyawan = Karyawan::findOrFail($karyawan_id);

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }
        
        return view('admin.kontrak.create', ['karyawan' => $karyawan, 'title' => 'Tambah Kontrak']);
    }

    public function store(Request $request)
    {
        $karyawan = Karyawan::findOrFail($request->karyawan_id);

         $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }

        $validated = $request->validate([
            'karyawan_id'   => 'required|exists:karyawans,id',
            'kontrak_ke'    => 'required|string',
            'np'            => 'required|string',
            'awal_kontrak'  => 'required|date',
            'akhir_kontrak' => 'required|date|after:awal_kontrak',
            'status'        => 'required|in:aktif,selesai',
            'penilaian'     => 'nullable|string',
            'folder_link'   => 'nullable|url|max:500',
        ]);

        if ($request->status === 'aktif') {
            Kontrak::where('karyawan_id', $request->karyawan_id)
                ->where('status', 'aktif')
                ->update(['status' => 'selesai']);
        }

        Kontrak::create($validated);

        if ($request->np !== $karyawan->np) {
            $karyawan->update(['np' => $request->np]);
        }

        if ($request->kontrak_ke === 'Kontrak 1') {
            $karyawan->update(['awal_kontrak' => $request->awal_kontrak]);
        }

        if ($request->status === 'aktif') {
            $karyawan->update([
                'akhir_kontrak'      => $request->akhir_kontrak,
                'awal_kontrak_aktif' => $request->awal_kontrak,
            ]);
        }

        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        return redirect()
            ->route('karyawan.kontrak', $request->karyawan_id)
            ->with('success', 'Kontrak berhasil ditambahkan');
    }

    public function edit($id)
    {
        $kontrak = Kontrak::findOrFail($id);

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $kontrak->karyawan->kategori !== $user->kategori->nama) { // ← fix
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mengedit kontrak ini');
        }

        return view('admin.kontrak.edit', ['kontrak' => $kontrak, 'title' => 'Edit Riwayat Kontrak']);
    }

    public function update(Request $request, $id)
    {
        $kontrak  = Kontrak::findOrFail($id);
        $karyawan = $kontrak->karyawan;

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk update kontrak ini');
        }

        $validated = $request->validate([
            'kontrak_ke'    => 'required|string',
            'np'            => 'required|string',
            'awal_kontrak'  => 'required|date',
            'akhir_kontrak' => 'required|date|after:awal_kontrak',
            'status'        => 'required|in:aktif,selesai,terminate',
            'penilaian'     => 'nullable|string',
            'folder_link'   => 'nullable|url|max:500',
        ]);

        if ($request->status === 'aktif') {
            Kontrak::where('karyawan_id', $kontrak->karyawan_id)
                ->where('id', '!=', $id)
                ->where('status', 'aktif')
                ->update(['status' => 'selesai']);
        }

        $kontrak->update($validated);

        if ($request->np !== $karyawan->np) {
            $karyawan->update(['np' => $request->np]);
        }

        if ($kontrak->kontrak_ke === 'Kontrak 1') {
            $karyawan->update(['awal_kontrak' => $request->awal_kontrak]);
        }

        if ($request->status === 'aktif') {
            $karyawan->update([
                'akhir_kontrak'      => $request->akhir_kontrak,
                'awal_kontrak_aktif' => $request->awal_kontrak,
            ]);
        } elseif (!Kontrak::where('karyawan_id', $karyawan->id)->where('status', 'aktif')->exists()) {
            $kontrakTerakhir = Kontrak::where('karyawan_id', $karyawan->id)
                ->where('status', 'selesai')
                ->orderByDesc('akhir_kontrak')
                ->first();

            $karyawan->update([
                'akhir_kontrak'      => $kontrakTerakhir?->akhir_kontrak,
                'awal_kontrak_aktif' => $kontrakTerakhir?->awal_kontrak,
            ]);
        }

        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        return redirect()
            ->route('karyawan.kontrak', $kontrak->karyawan_id)
            ->with('success', 'Kontrak berhasil diupdate');
    }

    public function destroy($id)
    {
        $kontrak    = Kontrak::findOrFail($id);
        $karyawan   = $kontrak->karyawan;
        $karyawan_id = $kontrak->karyawan_id;

        $user = auth()->user();
        if (!$user->isSuperAdmin() && $karyawan->kategori !== $user->kategori->nama) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk menghapus kontrak ini');
        }

        $isKontrakPertama = $kontrak->kontrak_ke === 'Kontrak 1';
        $isKontrakAktif   = $kontrak->status === 'aktif';

        $kontrak->delete();

        if ($isKontrakPertama) {
            $kontrakTertua = Kontrak::where('karyawan_id', $karyawan_id)
                ->orderBy('awal_kontrak')
                ->first();

            $karyawan->update(['awal_kontrak' => $kontrakTertua?->awal_kontrak]);
        }

        if ($isKontrakAktif) {
            $kontrakAktifBaru = Kontrak::where('karyawan_id', $karyawan_id)
                ->where('status', 'aktif')
                ->first();

            if ($kontrakAktifBaru) {
                $karyawan->update([
                    'akhir_kontrak'      => $kontrakAktifBaru->akhir_kontrak,
                    'awal_kontrak_aktif' => $kontrakAktifBaru->awal_kontrak,
                ]);
            } else {
                $kontrakTerakhir = Kontrak::where('karyawan_id', $karyawan_id)
                    ->where('status', 'selesai')
                    ->orderByDesc('akhir_kontrak')
                    ->first();

                $karyawan->update([
                    'akhir_kontrak'      => $kontrakTerakhir?->akhir_kontrak,
                    'awal_kontrak_aktif' => $kontrakTerakhir?->awal_kontrak,
                ]);
            }
        }

        $karyawan->updateMasaKerja();
        $karyawan->updateMasaKontrak();

        return redirect()
            ->route('karyawan.kontrak', $karyawan_id)
            ->with('success', 'Kontrak berhasil dihapus');
    }

    public function riwayat()
    {
        $today = Carbon::today();

        $kontrakKadaluarsa = Kontrak::where('status', 'aktif')
            ->where('akhir_kontrak', '<', $today)
            ->get();

        foreach ($kontrakKadaluarsa as $kontrak) {
            $kontrak->update(['status' => 'selesai']);

            $masihAdaAktif = Kontrak::where('karyawan_id', $kontrak->karyawan_id)
                ->where('status', 'aktif')
                ->exists();

            if (!$masihAdaAktif) {
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
        foreach ($karyawanAktif as $k) {
            $k->updateMasaKerja();
            $k->updateMasaKontrak();
        }

        $user  = auth()->user();
        $query = Karyawan::where('status', 'aktif')->with('kontrakAktif');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }

        return view('admin.kontrak.riwayat', [
            'karyawan'         => $query->get(),
            'title'            => 'Riwayat Kontrak',
            'menuAdminKontrak' => 'active',
        ]);
    }
}