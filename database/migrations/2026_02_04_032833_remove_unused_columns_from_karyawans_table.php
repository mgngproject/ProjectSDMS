<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->dropColumn(['awal_masuk', 'akhir_kontrak', 'masa_kontrak']);
        });
    }

    public function down()
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->date('awal_masuk')->nullable()->after('masa_kerja');
            $table->integer('masa_kontrak')->nullable()->after('masa_kerja');
            $table->date('akhir_kontrak')->nullable()->after('masa_kontrak');
        });
    }
};