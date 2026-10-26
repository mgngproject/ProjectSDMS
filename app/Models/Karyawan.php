<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Karyawan extends Model
{
    use HasFactory;

    protected $table = 'karyawans';
    
    protected $fillable = [
        'np', 'nama', 'kategori', 'masa_kerja', 'awal_kontrak', 
        'awal_kontrak_aktif', 'akhir_kontrak', 'masa_kontrak', 
        'kode_bagan', 'unit_kerja', 'jabatan', 'level', 'role',
        'benefit_kesehatan', 'faskes', 'gross_per_month', 'kpi', 
        'foto', 'status', 'tanggal_keluar', 'alasan_keluar', 'folder_link',
    ];

    protected $casts = [
        'awal_kontrak' => 'date',
        'awal_kontrak_aktif' => 'date',
        'akhir_kontrak' => 'date',
        'tanggal_keluar' => 'date',
    ];

    public function getMasaKerjaFormatAttribute()
{
    if (is_null($this->masa_kerja)) {
        return '-';
    }

    $totalBulan = $this->masa_kerja;
    $tahun = floor($totalBulan / 12);
    $bulan = $totalBulan % 12;

    if ($tahun > 0 && $bulan > 0) {
        return "{$tahun} Tahun {$bulan} Bulan";
    } elseif ($tahun > 0) {
        return "{$tahun} Tahun 0 Bulan";
    } else {
        return "0 Tahun {$bulan} Bulan";
    }
}

public function getMasaKontrakFormatAttribute()
{
    if (is_null($this->masa_kontrak)) {
        return '-';
    }

    $totalBulan = $this->masa_kontrak;
    $tahun = floor($totalBulan / 12);
    $bulan = $totalBulan % 12;

    if ($tahun > 0 && $bulan > 0) {
        return "{$tahun} Tahun {$bulan} Bulan";
    } elseif ($tahun > 0) {
        return "{$tahun} Tahun 0 Bulan";
    } else {
        return "0 Tahun {$bulan} Bulan";
    }
}

    public function updateMasaKerja()
{
    if ($this->awal_kontrak && $this->akhir_kontrak) {
        $awal  = Carbon::parse($this->awal_kontrak)->startOfMonth();
        $akhir = Carbon::parse($this->akhir_kontrak)->startOfMonth();

        $this->masa_kerja = $awal->diffInMonths($akhir);
        $this->save();
    }
}

public function updateMasaKontrak()
{
    if ($this->awal_kontrak_aktif && $this->akhir_kontrak) {
        $awal  = Carbon::parse($this->awal_kontrak_aktif)->startOfMonth();
        $akhir = Carbon::parse($this->akhir_kontrak)->startOfMonth();

        $this->masa_kontrak = $awal->diffInMonths($akhir);
        $this->save();
    }
}

    public function monitoring()
    {
        return $this->hasOne(Monitoring::class);
    }

    public function kontrak()
    {
        return $this->hasMany(Kontrak::class);
    }
    
    public function kontrakAktif()
    {
        return $this->hasOne(Kontrak::class)->where('status', 'aktif');
    }

    public function datadiri()
    {
        return $this->hasOne(Datadiri::class, 'karyawan_id');
    }

    protected static function boot()
    {
        parent::boot();
        
        static::deleting(function($karyawan) {
            $karyawan->monitoring()->delete();
            $karyawan->kontrak()->delete();
            $karyawan->datadiri()->delete();
        });
    }
}