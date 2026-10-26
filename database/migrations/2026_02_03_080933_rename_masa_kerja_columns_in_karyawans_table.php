<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->renameColumn('masa_kerja', 'masa_kontrak');
            $table->renameColumn('masa_kerja_karyawan', 'masa_kerja');
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->renameColumn('masa_kontrak', 'masa_kerja');
            $table->renameColumn('masa_kerja', 'masa_kerja_karyawan');
        });
    }
};