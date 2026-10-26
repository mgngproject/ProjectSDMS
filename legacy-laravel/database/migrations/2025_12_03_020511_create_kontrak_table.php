<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kontrak', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')
            ->constrained('karyawans')
            ->onDelete('cascade');
            $table->string ('kontrak_ke');
            $table->date('awal_kontrak');
            $table->date('akhir_kontrak');
            $table->text('penilaian')->nullable();
            $table->string('folder_link')->nullable();
            $table->enum('status', ['aktif', 'selesai'])->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kontrak');
    }
};
