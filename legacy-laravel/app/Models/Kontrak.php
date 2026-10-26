<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kontrak extends Model
{
    use HasFactory;

    protected $table = 'kontrak';

    protected $fillable = [
        'karyawan_id',
        'kontrak_ke',
        'np',
        'awal_kontrak',
        'akhir_kontrak',
        'penilaian',
        'folder_link',
        'status'
    ];

    protected $casts = [
        'awal_kontrak' => 'date',
        'akhir_kontrak' => 'date'
    ];

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class);
    }
}
