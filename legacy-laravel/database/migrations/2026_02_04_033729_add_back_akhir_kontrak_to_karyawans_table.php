<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->date('akhir_kontrak')->nullable()->after('awal_kontrak');
        });
    }

    public function down()
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->dropColumn('akhir_kontrak');
        });
    }
};