<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('monitoring', function (Blueprint $table) {
            $table->string('status', 50)->default('Belum Lengkap')->change();
            $table->text('catatan')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('monitoring', function (Blueprint $table) {
            $table->string('status', 20)->change();
            $table->string('catatan', 255)->nullable()->change();
        });
    }
};