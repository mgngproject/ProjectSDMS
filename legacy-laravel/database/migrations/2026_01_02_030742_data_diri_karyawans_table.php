<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_diri_karyawans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')->constrained('karyawans')->onDelete('cascade');
            $table->string('ktp', 16)->unique()->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->string('pendidikan')->nullable();
            $table->string('jurusan')->nullable();
            $table->string('kampus')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
         Schema::dropIfExists('data_diri_karyawans');
    }
};
