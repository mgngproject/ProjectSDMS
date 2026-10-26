<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class KaryawanImport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Database' => new KaryawanSheetImport(),
            'Mail Merge' => new DatadiriSheetImport(),
            'Terminate' => new TerminateSheetImport(),
            'Kontrak' => new KontrakSheetImport(),
        ];
    }
}