<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Datadiri extends Model
{
    protected $table = 'data_diri_karyawans';
    
    protected $fillable = [
        'karyawan_id',
        'ktp',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'rt',       
        'rw',       
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi', 
        'jenjang_1',
        'jurusan_1',
        'kampus_1',
        'jenjang_2',
        'jurusan_2',
        'kampus_2',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class);
    }

    public function getTtlAttribute()
    {
        if ($this->tempat_lahir && $this->tanggal_lahir) {
            return $this->tempat_lahir . ', ' . $this->tanggal_lahir->format('d-m-Y');
        }
        return '-';
    }

    public function getAlamatLengkapAttribute()
    {
        $parts = array_filter([
            $this->alamat,
            $this->rt ? 'RT ' . $this->rt : null,
            $this->rw ? 'RW ' . $this->rw : null,
            $this->kelurahan,
            $this->kecamatan,
            $this->kabupaten,
            $this->provinsi,
        ]);
        
        return implode(', ', $parts) ?: '-';
    }

    public function getPendidikanTerakhirAttribute()
    {
        if ($this->jenjang_2) {
            return [
                'jenjang' => $this->jenjang_2,
                'jurusan' => $this->jurusan_2,
                'kampus' => $this->kampus_2,
            ];
        }

        if ($this->jenjang_1) {
            return [
                'jenjang' => $this->jenjang_1,
                'jurusan' => $this->jurusan_1,
                'kampus' => $this->kampus_1,
            ];
        }

        return [
            'jenjang' => '-',
            'jurusan' => '-',
            'kampus' => '-',
        ];
    }

    public function getRiwayatPendidikanAttribute()
    {
        $riwayat = [];

        if ($this->jenjang_1) {
            $riwayat[] = [
                'jenjang' => $this->jenjang_1,
                'jurusan' => $this->jurusan_1,
                'kampus' => $this->kampus_1,
            ];
        }

        if ($this->jenjang_2) {
            $riwayat[] = [
                'jenjang' => $this->jenjang_2,
                'jurusan' => $this->jurusan_2,
                'kampus' => $this->kampus_2,
            ];
        }

        return $riwayat;
    }
}