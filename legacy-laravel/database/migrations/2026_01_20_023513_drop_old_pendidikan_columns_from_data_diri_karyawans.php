<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
             $table->dropColumn(['pendidikan', 'jurusan', 'kampus']);
        });
    }

    public function down(): void
    {
        Schema::table('data_diri_karyawans', function (Blueprint $table) {
            $table->string('pendidikan')->nullable();
            $table->string('jurusan')->nullable();
            $table->string('kampus')->nullable();
        });
    }
};
