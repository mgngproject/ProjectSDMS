<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE kontrak MODIFY COLUMN status ENUM('aktif', 'selesai', 'terminate') DEFAULT 'aktif'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE kontrak MODIFY COLUMN status ENUM('aktif', 'selesai') DEFAULT 'aktif'");
    }
};