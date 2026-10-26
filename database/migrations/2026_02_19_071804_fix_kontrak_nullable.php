<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('karyawans', function (Blueprint $table) {
            $table->date('awal_kontrak')->nullable()->change();
            $table->date('akhir_kontrak')->nullable()->change();
            $table->date('awal_kontrak_aktif')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
            
        });
    }
};
