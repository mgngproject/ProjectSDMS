<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->date('awal_kontrak_aktif')->nullable()->after('awal_kontrak');
            $table->integer('masa_kontrak')->nullable()->after('akhir_kontrak');
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->dropColumn('awal_kontrak_aktif', 'masa_kontrak');
        });
    }
};
