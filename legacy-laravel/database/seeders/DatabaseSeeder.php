<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DB::table('kategoris')->insert([
            ['nama' => 'IDE', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'IDH', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'BGN', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'TPBW/TPP', 'created_at' => now(), 'updated_at' => now()],
        ]);

        User::create([
            'nama'        => 'Admin IDE',
            'email'       => 'adminide@peruri.com',
            'jabatan'     => 'Admin1',
            'role'        => 'admin',
            'kategori_id' => 1,
            'password'    => Hash::make('IDEAdmin123#'),
        ]);

        User::create([
            'nama'        => 'Admin IDH',
            'email'       => 'adminidh@peruri.com',
            'jabatan'     => 'Admin2',
            'role'        => 'admin',
            'kategori_id' => 2,
            'password'    => Hash::make('IDHAdmin123#'),
        ]);

        User::create([
            'nama'        => 'Admin BGN',
            'email'       => 'adminbgn@peruri.com',
            'jabatan'     => 'Admin3',
            'role'        => 'admin',
            'kategori_id' => 3,
            'password'    => Hash::make('BGNAdmin123#'),
        ]);

        User::create([
            'nama'        => 'Admin TPBW',
            'email'       => 'admintpbw@peruri.com',
            'jabatan'     => 'Admin4',
            'role'        => 'admin',
            'kategori_id' => 4,
            'password'    => Hash::make('TPBWAdmin123#'),
        ]);

        User::create([
            'nama'        => 'Super Admin',
            'email'       => 'superadminsdms@peruri.com',
            'jabatan'     => 'Superadmin',
            'role'        => 'superadmin',
            'kategori_id' => null,
            'password'    => Hash::make('SDMSAdmin123#'),
        ]);
    }
}