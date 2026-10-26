<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Monitoring;

return new class extends Migration
{
    public function up()
    {
        DB::table('monitoring')
            ->where('status', 'Belum Selesai')
            ->update(['status' => 'Belum Lengkap']);
        
        DB::statement("ALTER TABLE `monitoring` MODIFY `status` ENUM('Selesai', 'Belum Lengkap') DEFAULT 'Belum Lengkap'");
        Monitoring::all()->each(function($m) {
            $m->updateStatus();
        });
    }

    public function down()
    {
        DB::statement("ALTER TABLE `monitoring` MODIFY `status` ENUM('Selesai', 'Belum Selesai') DEFAULT 'Belum Selesai'");
        
        DB::table('monitoring')
            ->where('status', 'Belum Lengkap')
            ->update(['status' => 'Belum Selesai']);
    }
};