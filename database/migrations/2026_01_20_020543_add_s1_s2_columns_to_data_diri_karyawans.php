<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
            
            $table->string('jenjang_1')->nullable()->after('alamat');
            $table->string('jurusan_1')->nullable();
            $table->string('kampus_1')->nulable();
            $table->string('jenjang_2')->nullable();
            $table->string('jurusan_2')->nullable();
            $table->string('kampus_2')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
            $table->dropColumn([
                'jenjang_1','jurusan_1','kampus_1',
                'jenjang_2','jurusan_2','kampus_2'
            ]);
        });
    }
};
