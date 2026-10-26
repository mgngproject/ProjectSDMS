<?php

namespace App\Imports;

use Carbon\Carbon;
use App\Models\Datadiri;
use App\Models\Karyawan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DatadiriSheetImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['np'])) return null;

        $karyawan = Karyawan::where('np', $row['np'])->first();
        if (!$karyawan) return null;

        try {
            Datadiri::updateOrCreate(
                ['karyawan_id' => $karyawan->id],
                [
                    'ktp'           => isset($row['no_ktp']) ? preg_replace('/\D/', '', (string) $row['no_ktp']) : null,
                    'tempat_lahir'  => $row['tempat'] ?? null,
                    'tanggal_lahir' => $this->parseDate($row['tanggal_lahir'] ?? null),
                    'alamat'        => $row['alamat'] ?? null,
                    'rt'            => $row['rt'] ?? null,       
                    'rw'            => $row['rw'] ?? null,       
                    'kelurahan'     => $row['kelurahan'] ?? null,
                    'kecamatan'     => $row['kecamatan'] ?? null,
                    'kabupaten'     => $row['kabupaten'] ?? null,
                    'provinsi'      => $row['provinsi'] ?? null, 
                    'jenjang_1'     => $row['jenjang'] ?? null,
                    'jurusan_1'     => $row['jurusan'] ?? null,
                    'kampus_1'      => $row['nama_perguruan_tinggi'] ?? null,
                    'jenjang_2'     => $row['jenjang_terakhir'] ?? null,
                    'jurusan_2'     => $row['jurusan_terakhir'] ?? null,
                    'kampus_2'      => $row['nama_perguruan_tinggi_terakhir'] ?? null,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('datadiri failed', ['np' => $row['np'], 'error' => $e->getMessage()]);
        }

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