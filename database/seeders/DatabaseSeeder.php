<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        //\App\Models\Album::factory(12)->create();
        //\App\Models\Photo::factory(50)->create();
        $this->call([
            UsersTableSeeder::class,
            EventsTableSeeder::class,
        ]);
    }
}
