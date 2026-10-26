<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::table('karyawans', function (Blueprint $table) {
            if (!Schema::hasColumn('karyawans', 'status')) {
                $table->string('status')->default('aktif')->after('foto');
            }

            if (!Schema::hasColumn('karyawans', 'tanggal_keluar')) {
                $table->date('tanggal_keluar')->nullable()->after('status');
            }

            if (!Schema::hasColumn('karyawans', 'alasan_keluar')) {
                $table->text('alasan_keluar')->nullable()->after('tanggal_keluar');
            }
        });
    }

    public function down(): void
    {
        Schema::table('karyawans', function (Blueprint $table) {
        $table->dropColumn(['status','tanggal_keluar','alasan_keluar']);
    });
    }
};
