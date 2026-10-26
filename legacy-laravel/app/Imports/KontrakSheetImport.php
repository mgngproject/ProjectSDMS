<?php

namespace App\Imports;

use App\Models\Karyawan;
use App\Models\Kontrak;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class KontrakSheetImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (empty($row['np'])) return null;

        $karyawan = Karyawan::where('np', $row['np'])->first();
        if (!$karyawan) return null;

        Kontrak::where('karyawan_id', $karyawan->id)->delete();

        $i = 1;
        while (true) {
            $suffix = $i === 1 ? '' : $i;
            $kontrakKe = $row['kontrak' . $suffix] ?? null;
            $awalKontrak = $this->parseDate($row['awal_kontrak' . $suffix] ?? null);
            $akhirKontrak = $this->parseDate($row['akhir_kontrak' . $suffix] ?? null);

            if (!array_key_exists('kontrak' . $suffix, $row) && $i > 1) break;
            if ($i > 10) break;

            if (empty($awalKontrak) || empty($akhirKontrak)) {
                $i++;
                continue;
            }

            Kontrak::create([
                'karyawan_id'   => $karyawan->id,
                'kontrak_ke'    => 'Kontrak ' . $kontrakKe,
                'np'            => $row['np'],
                'awal_kontrak'  => $awalKontrak,
                'akhir_kontrak' => $akhirKontrak,
                'status'        => now()->between($awalKontrak, $akhirKontrak) ? 'aktif' : 'selesai',
                'penilaian'     => $row['penilaian' . $suffix] ?? null,
                'folder_link'   => $row['folder' . $suffix] ?? null,
            ]);

            $i++;
        }

        $kontrakAktif = Kontrak::where('karyawan_id', $karyawan->id)
            ->where('status', 'aktif')
            ->latest('awal_kontrak')
            ->first()
            ?? Kontrak::where('karyawan_id', $karyawan->id)
            ->latest('awal_kontrak')
            ->first();

        if ($kontrakAktif) {
            $karyawan->update([
                'awal_kontrak_aktif' => $kontrakAktif->awal_kontrak,
                'akhir_kontrak'      => $kontrakAktif->akhir_kontrak,
            ]);
            $karyawan->updateMasaKerja();
            $karyawan->updateMasaKontrak();
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