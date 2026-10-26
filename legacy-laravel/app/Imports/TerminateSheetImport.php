<?php

namespace App\Imports;

use App\Models\Karyawan;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TerminateSheetImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['np'])) return null;

        $existing = Karyawan::where('np', $row['np'])->first();

        if ($existing && $existing->status === 'aktif') return null;

        $kategori = auth()->check() ? auth()->user()->kategori?->nama : null;

        $karyawan = Karyawan::updateOrCreate(
            ['np' => $row['np']],
            [
                'nama'           => $row['nama'] ?? null,
                'kategori'       => $kategori,
                'awal_kontrak'   => $this->parseDate($row['awal_kontrak'] ?? null),
                'akhir_kontrak'  => $this->parseDate($row['akhir_kontrak'] ?? null),
                'kode_bagan'     => $row['kode_bagan'] ?? null,
                'unit_kerja'     => $row['unit_kerja'] ?? null,
                'jabatan'        => $row['jabatan'] ?? null,
                'level'          => $row['level'] ?? null,
                'role'           => $row['role'] ?? null,
                'tanggal_keluar' => $this->parseDate($row['tanggal_keluar'] ?? null),
                'alasan_keluar'  => $row['alasan_keluar'] ?? null,
                'status'         => 'terminate',
            ]
        );

        $karyawan->updateMasaKerja();

        return null;
    }

    private function parseDate($date)
    {
        if (empty($date)) return null;
        if ($date instanceof \DateTime) return Carbon::instance($date);
        if (is_numeric($date)) {
            return Carbon::instance(
                \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date)
            );
        }
        try {
            return Carbon::parse($date);
        } catch (\Exception $e) {
            return null;
        }
    }
}