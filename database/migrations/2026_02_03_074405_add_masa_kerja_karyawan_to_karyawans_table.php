<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->integer('masa_kerja_karyawan')->nullable()->after('kategori');
            $table->date('awal_masuk')->nullable()->after('masa_kerja_karyawan');
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->dropColumn(['masa_kerja_karyawan', 'awal_masuk']);
        });
    }
};