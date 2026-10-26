<?php

namespace App\Exports;

use App\Models\Datadiri;
use App\Models\Karyawan;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;


class DatadiriExport implements FromView
{
    public function view(): View
    {
        $user = auth()->user();

        $karyawanQuery = Karyawan::where('status', 'aktif');

        if (!$user->isSuperAdmin()) {
            $karyawanQuery->where('kategori', $user->kategori->nama);
        }

        $karyawanIds = $karyawanQuery->pluck('id');

        $datadiri = Datadiri::with('karyawan')
            ->whereIn('karyawan_id', $karyawanIds)
            ->get();

        return view('admin.datadiri.excel', compact('datadiri'));
    }
}
