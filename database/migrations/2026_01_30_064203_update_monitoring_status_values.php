<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Monitoring;

return new class extends Migration
{
    public function up()
    {
        Monitoring::where('status', 'Belum Selesai')->update(['status' => 'Belum Lengkap']);
        Monitoring::all()->each(function($m) {
            $m->updateStatus();
        });
    }

    public function down()
    {
        Monitoring::where('status', 'Belum Lengkap')->update(['status' => 'Belum Selesai']);
    }
};