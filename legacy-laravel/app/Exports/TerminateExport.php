<?php

namespace App\Exports;

use App\Models\Karyawan;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;


class TerminateExport implements FromView
{
    public function view(): View
    {
        $user = auth()->user();

        $query = Karyawan::where('status', 'terminate');

        if (!$user->isSuperAdmin()) {
            $query->where('kategori', $user->kategori->nama);
        }

        return view('admin.terminate.excel', [
            'karyawan' => $query->get(),
        ]);
    }
}
