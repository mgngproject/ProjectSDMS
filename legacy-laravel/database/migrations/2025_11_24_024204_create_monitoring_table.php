<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')
            ->constrained('karyawans')
            ->onDelete('cascade');

        $table->boolean('nde_konfirmasi')->default(false);
        $table->boolean('nde_jawaban')->default(false);
        $table->boolean('nde_laporan')->default(false);
        $table->string('usulan_remunerasi')->nullable();
        $table->boolean('offering_letter')->default(false);
        $table->boolean('izin_prinsip_nde')->default(false);
        $table->boolean('izin_prinsip_manual')->default(false);
        $table->string('sp')->nullable();
        $table->string('skep')->nullable();
        $table->boolean('nde_penyampaian_unit_kerja')->default(false);
        $table->boolean('nde_penyampaian_sdmo')->default(false);
        $table->boolean('upload_ess')->default(false);
        $table->boolean('data_diri')->default(false);
        $table->enum('status', ['Selesai',  'Belum Selesai'])->default('Belum Selesai');
        $table->text('catatan')->nullable();
    
        $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring');
    }
};
