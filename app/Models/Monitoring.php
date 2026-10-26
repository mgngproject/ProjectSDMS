<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Monitoring extends Model
{
    protected $table = 'monitoring';

    protected $fillable = [
        'karyawan_id',
        'nde_konfirmasi',
        'nde_jawaban',
        'nde_laporan',
        'usulan_remunerasi',
        'offering_letter',
        'izin_prinsip_nde',
        'izin_prinsip_manual',
        'sp',
        'skep',
        'nde_penyampaian_unit_kerja',
        'nde_penyampaian_sdmo',
        'upload_ess',
        'data_diri',
        'status',
        'catatan',
        'keterangan',
    ];

    protected $casts = [
        'nde_konfirmasi' => 'boolean',
        'nde_jawaban' => 'boolean',
        'nde_laporan' => 'boolean',
        'offering_letter' => 'boolean',
        'izin_prinsip_nde' => 'boolean',
        'izin_prinsip_manual' => 'boolean',
        'nde_penyampaian_unit_kerja' => 'boolean',
        'nde_penyampaian_sdmo' => 'boolean',
        'upload_ess' => 'boolean',
        'data_diri' => 'boolean',
    ];

     protected $attributes = [
        'usulan_remunerasi' => '',
        'sp' => '',
        'skep' => '',
    ];

    const STATUS_SELESAI = 'Selesai';
    const STATUS_BELUM_LENGKAP = 'Belum Lengkap';

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class);
    }

    public function updateStatus()
    {
        $allFields = [
            'nde_konfirmasi' => 'NDE Konfirmasi Perpanjangan',
            'nde_jawaban' => 'NDE Jawaban (Unit Kerja)',
            'nde_laporan' => 'NDE Laporan Perpanjangan/Laporan Masuk',
            'usulan_remunerasi' => 'Usulan Remunerasi',
            'offering_letter' => 'Offering Letter',
            'izin_prinsip_nde' => 'Izin Prinsip (NDE)',
            'izin_prinsip_manual' => 'Izin Prinsip (Manual)',
            'sp' => 'SP',
            'skep' => 'SKEP',
            'nde_penyampaian_unit_kerja' => 'NDE Penyampaian SKEP ke Unit Kerja',
            'nde_penyampaian_sdmo' => 'NDE Penyampaian SKEP ke SDMO',
            'upload_ess' => 'Upload ESS',
            'data_diri' => 'Data Diri'
        ];

        $checkboxFields = [
            'nde_konfirmasi', 'nde_jawaban', 'nde_laporan', 
            'offering_letter', 'izin_prinsip_nde', 'izin_prinsip_manual', 
            'nde_penyampaian_unit_kerja', 'nde_penyampaian_sdmo', 
            'upload_ess', 'data_diri'
        ];

        $textFields = ['usulan_remunerasi', 'sp', 'skep'];
        $kurang = [];

        foreach ($checkboxFields as $field) {
            if (!$this->$field) {
                $kurang[] = $allFields[$field];
            }
        }

        foreach ($textFields as $field) {
            if (empty($this->$field)) {
                $kurang[] = $allFields[$field];
            }
        }

        if (empty($kurang)) {
            $this->status = self::STATUS_SELESAI;
            $this->catatan = null;
        } else {
            $this->status = self::STATUS_BELUM_LENGKAP;
            $this->catatan = implode(', ', $kurang);
        }

        $this->update([
            'status' => $this->status,
            'catatan' => $this->catatan
        ]);
    }
}