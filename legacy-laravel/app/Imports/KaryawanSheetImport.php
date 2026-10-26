<?php

namespace App\Imports;

use App\Models\Datadiri;
use App\Models\Karyawan;
use App\Models\Monitoring;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class KaryawanSheetImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['np'])) return null;

        return DB::transaction(function () use ($row) {
            $kategori   = auth()->check() ? auth()->user()->kategori?->nama : null;
            $awalMasuk  = null;
            $awalAktif  = null;
            $akhirAktif = null;
            $i          = 1;

            while (true) {
                $suffix = $i === 1 ? '' : $i;
                $awal   = $this->parseDate($row['awal_kontrak' . $suffix] ?? null);
                $akhir  = $this->parseDate($row['akhir_kontrak' . $suffix] ?? null);

                if ($awal === null && $i > 1) break;
                if ($i > 10) break;

                if ($awal && $akhir) {
                    if (!$awalMasuk) $awalMasuk = $awal;
                    $awalAktif  = $awal;
                    $akhirAktif = $akhir;
                }

                $i++;
            }

            $karyawan = Karyawan::updateOrCreate(
                ['np' => $row['np']],
                [
                    'nama'               => $row['nama'] ?? null,
                    'kategori'           => $kategori,
                    'awal_kontrak'       => $awalMasuk,
                    'awal_kontrak_aktif' => $awalAktif,
                    'akhir_kontrak'      => $akhirAktif,
                    'masa_kerja'         => null,
                    'masa_kontrak'       => null,
                    'kode_bagan'         => $row['kode_bagan'] ?? null,
                    'unit_kerja'         => $row['unit_kerja'] ?? null,
                    'jabatan'            => $row['jabatan'] ?? null,
                    'level'              => $row['level'] ?? null,
                    'role'               => $row['role'] ?? null,
                    'benefit_kesehatan'  => $row['benefit_kesehatan'] ?? null,
                    'faskes'             => null,
                    'gross_per_month'    => isset($row['gross_per_month'])
                        ? (int) preg_replace('/[^0-9]/', '', (string) $row['gross_per_month']) ?: null
                        : null,
                    'kpi'                => $row['kpi'] ?? null,
                    'status'             => 'aktif',
                    'folder_link'        => null,
                ]
            );

            $karyawan->updateMasaKerja();
            $karyawan->updateMasaKontrak();

            if ($karyawan->wasRecentlyCreated) {
                Datadiri::create(['karyawan_id' => $karyawan->id]);

                $monitoring = Monitoring::create([
                    'karyawan_id' => $karyawan->id,
                    'status'      => 'Belum Lengkap',
                ]);

                $monitoring->updateStatus();
            }

            return $karyawan;
        });
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