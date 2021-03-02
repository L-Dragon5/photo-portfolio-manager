<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'email' => 'me@joseph-oh.com',
            'password' => Hash::make('d!qEd>SKJn]fVvq_#hq69CWSPKfuu&MZ'),
        ]);
    }
}
