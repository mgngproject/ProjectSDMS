<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('karyawans', function (Blueprint $table) {
            $table->id();
            $table->string('np')->unique();
            $table->string('nama');
            $table->string('kategori');
            $table->integer('masa_kerja')->nullable();
            $table->date('awal_kontrak')->nullable();
            $table->date('akhir_kontrak')->nullable();
            $table->string('kode_bagan')->nullable();
            $table->string('unit_kerja')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('job_grade')->nullable();
            $table->string('role')->nullable();
            $table->string('benefit_kesehatan')->nullable();
            $table->bigInteger('gross_per_month')->nullable();
            $table->integer('kpi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('karyawans');
    }
};
