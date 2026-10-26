<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
            $table->string('rt')->nullable()->after('alamat');
            $table->string('rw')->nullable()->after('rt');
            $table->string('kelurahan')->nullable()->after('rw');
            $table->string('kecamatan')->nullable()->after('kelurahan');
            $table->string('kabupaten')->nullable()->after('kecamatan');
            $table->string('provinsi')->nullable()->after('kabupaten');
        });
    }

    public function down(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
            $table->dropColumn(['rt', 'rw', 'kelurahan', 'kecamatan', 'kabupaten', 'provinsi']);
        });
    }
};