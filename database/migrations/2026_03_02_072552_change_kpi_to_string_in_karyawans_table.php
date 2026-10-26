<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('karyawans', function (Blueprint $table) {
        $table->string('kpi')->nullable()->change();
    });
}

    public function down(): void
{
    Schema::table('karyawans', function (Blueprint $table) {
        $table->integer('kpi')->nullable()->change();
    });
}
};
