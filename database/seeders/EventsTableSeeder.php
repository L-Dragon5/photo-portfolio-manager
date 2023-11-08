<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'name' => 'A-Kon 2022',
                'start_date' => '2022-06-03',
                'end_date' => '2022-06-05',
            ],
            [
                'name' => 'Anime Expo 2023',
                'start_date' => '2023-07-01',
                'end_date' => '2023-07-04',
            ],
            [
                'name' => 'Anime North 2016',
                'start_date' => '2016-05-27',
                'end_date' => '2016-05-29',
            ],
            [
                'name' => 'Anime North 2017',
                'start_date' => '2017-05-26',
                'end_date' => '2017-05-28',
            ],
            [
                'name' => 'Anime North 2018',
                'start_date' => '2018-05-25',
                'end_date' => '2018-05-27',
            ],
            [
                'name' => 'Anime North 2019',
                'start_date' => '2019-05-24',
                'end_date' => '2019-05-26',
            ],
            [
                'name' => 'AnimeNEXT 2014',
                'start_date' => '2014-06-06',
                'end_date' => '2014-06-08',
            ],
            [
                'name' => 'AnimeNEXT 2015',
                'start_date' => '2015-06-12',
                'end_date' => '2015-06-14',
            ],
            [
                'name' => 'ANYC 2019',
                'start_date' => '2019-11-15',
                'end_date' => '2019-11-17',
            ],
            [
                'name' => 'ANYC 2023',
                'start_date' => '2023-11-17',
                'end_date' => '2023-11-19',
            ],
            [
                'name' => 'AUSA 2016',
                'start_date' => '2016-10-21',
                'end_date' => '2016-10-23',
            ],
            [
                'name' => 'AUSA 2023',
                'start_date' => '2023-09-22',
                'end_date' => '2023-09-24',
            ],
            [
                'name' => 'AWA 2019',
                'start_date' => '2019-10-31',
                'end_date' => '2019-11-03',
            ],
            [
                'name' => 'AWA 2023',
                'start_date' => '2023-10-26',
                'end_date' => '2023-10-29',
            ],
            [
                'name' => 'CharaExpo 2018',
                'start_date' => '2018-11-10',
                'end_date' => '2018-11-11',
            ],
            [
                'name' => 'CloverCon 2015',
                'start_date' => '2015-05-17',
                'end_date' => '2015-05-17',
            ],
            [
                'name' => 'Colossalcon 2016',
                'start_date' => '2016-06-02',
                'end_date' => '2016-06-05',
            ],
            [
                'name' => 'Colossalcon 2017',
                'start_date' => '2017-06-01',
                'end_date' => '2017-06-04',
            ],
            [
                'name' => 'Colossalcon 2018',
                'start_date' => '2018-05-31',
                'end_date' => '2018-06-03',
            ],
            [
                'name' => 'Colossalcon East 2017',
                'start_date' => '2017-09-08',
                'end_date' => '2017-09-10',
            ],
            [
                'name' => 'Colossalcon East 2018',
                'start_date' => '2018-09-07',
                'end_date' => '2018-09-09',
            ],
            [
                'name' => 'Colossalcon East 2019',
                'start_date' => '2019-09-13',
                'end_date' => '2019-09-15',
            ],
            [
                'name' => 'Colossalcon East 2021',
                'start_date' => '2021-09-17',
                'end_date' => '2021-09-19',
            ],
            [
                'name' => 'Colossalcon East 2022',
                'start_date' => '2022-09-09',
                'end_date' => '2022-09-11',
            ],
            [
                'name' => 'Cosplay Matsuri Toronto 2017',
                'start_date' => '2017-08-12',
                'end_date' => '2017-08-12',
            ],
            [
                'name' => 'Cosplay Snow Festival 2014',
                'start_date' => '2014-12-06',
                'end_date' => '2014-12-06',
            ],
            [
                'name' => 'Cosplay Snow Festival 2016',
                'start_date' => '2016-12-03',
                'end_date' => '2016-12-03',
            ],
            [
                'name' => 'Cosplay Snow Festival 2019',
                'start_date' => '2019-01-26',
                'end_date' => '2019-01-26',
            ],
            [
                'name' => 'Castle Point Anime Con 2023',
                'start_date' => '2023-04-29',
                'end_date' => '2023-04-30',
            ],
            [
                'name' => 'DC Sakura Matsuri 2022',
                'start_date' => '2022-04-09',
                'end_date' => '2022-04-10',
            ],
            [
                'name' => 'DC Sakura Matsuri 2023',
                'start_date' => '2023-04-15',
                'end_date' => '2023-04-16',
            ],
            [
                'name' => 'Fan World 2016',
                'start_date' => '2016-08-26',
                'end_date' => '2016-08-28',
            ],
            [
                'name' => 'Fan World 2018',
                'start_date' => '2018-07-06',
                'end_date' => '2018-07-08',
            ],
            [
                'name' => 'Katsucon 2017',
                'start_date' => '2017-02-17',
                'end_date' => '2017-02-19',
            ],
            [
                'name' => 'Katsucon 2018',
                'start_date' => '2018-02-16',
                'end_date' => '2018-02-18',
            ],
            [
                'name' => 'Katsucon 2019',
                'start_date' => '2019-02-15',
                'end_date' => '2019-02-17',
            ],
            [
                'name' => 'Katsucon 2020',
                'start_date' => '2020-02-14',
                'end_date' => '2020-02-16',
            ],
            [
                'name' => 'Katsucon 2022',
                'start_date' => '2022-02-18',
                'end_date' => '2022-02-20',
            ],
            [
                'name' => 'Katsucon 2023',
                'start_date' => '2023-02-17',
                'end_date' => '2023-02-19',
            ],
            [
                'name' => 'MAGFest 2017',
                'start_date' => '2017-01-05',
                'end_date' => '2017-01-08',
            ],
            [
                'name' => 'MAGFest 2018',
                'start_date' => '2018-01-04',
                'end_date' => '2018-01-07',
            ],
            [
                'name' => 'MAGFest 2019',
                'start_date' => '2019-01-03',
                'end_date' => '2019-01-06',
            ],
            [
                'name' => 'MAGFest 2022',
                'start_date' => '2022-01-06',
                'end_date' => '2022-01-09',
            ],
            [
                'name' => 'MAGFest 2023',
                'start_date' => '2023-01-05',
                'end_date' => '2023-01-08',
            ],
            [
                'name' => 'Otakon 2014',
                'start_date' => '2014-08-08',
                'end_date' => '2014-08-10',
            ],
            [
                'name' => 'Otakon 2021',
                'start_date' => '2021-08-06',
                'end_date' => '2021-08-08',
            ],
            [
                'name' => 'Otakon 2022',
                'start_date' => '2022-07-29',
                'end_date' => '2022-07-31',
            ],
            [
                'name' => 'Otakon 2023',
                'start_date' => '2023-08-28',
                'end_date' => '2023-08-30',
            ],
            [
                'name' => 'Otakuthon 2016',
                'start_date' => '2016-08-05',
                'end_date' => '2016-08-07',
            ],
            [
                'name' => 'Otakuthon 2017',
                'start_date' => '2017-08-04',
                'end_date' => '2017-08-06',
            ],
            [
                'name' => 'Otakuthon 2018',
                'start_date' => '2018-08-03',
                'end_date' => '2018-08-05',
            ],
            [
                'name' => 'Otakuthon 2019',
                'start_date' => '2019-08-16',
                'end_date' => '2019-08-18',
            ],
            [
                'name' => 'Otakuthon 2023',
                'start_date' => '2023-08-11',
                'end_date' => '2023-08-13',
            ],
            [
                'name' => 'Puchicon PA 2023',
                'start_date' => '2023-10-21',
                'end_date' => '2023-10-22',
            ],
            [
                'name' => 'Tekko 2018',
                'start_date' => '2018-04-05',
                'end_date' => '2014-04-08',
            ],
            [
                'name' => 'Tekko 2019',
                'start_date' => '2019-04-11',
                'end_date' => '2019-04-14',
            ],
            [
                'name' => 'Tekko 2021',
                'start_date' => '2021-12-09',
                'end_date' => '2021-12-12',
            ],
            [
                'name' => 'Tekko 2022',
                'start_date' => '2022-07-21',
                'end_date' => '2022-07-24',
            ],
            [
                'name' => 'Tekko 2023',
                'start_date' => '2023-07-20',
                'end_date' => '2023-07-23',
            ],
            [
                'name' => 'Tora-con 2014',
                'start_date' => '2014-03-08',
                'end_date' => '2014-03-09',
            ],
            [
                'name' => 'Tora-con 2015',
                'start_date' => '2015-04-18',
                'end_date' => '2015-04-19',
            ],
            [
                'name' => 'Tora-con 2016',
                'start_date' => '2016-04-23',
                'end_date' => '2016-04-24',
            ],
            [
                'name' => 'Tora-con 2017',
                'start_date' => '2017-04-22',
                'end_date' => '2017-04-23',
            ],
            [
                'name' => 'Tora-con 2018',
                'start_date' => '2018-04-14',
                'end_date' => '2018-04-15',
            ],
            [
                'name' => 'Tora-con 2019',
                'start_date' => '2019-03-23',
                'end_date' => '2019-03-24',
            ],
            [
                'name' => 'Tora-con 2022',
                'start_date' => '2022-03-19',
                'end_date' => '2022-03-19',
            ],
            [
                'name' => 'Tora-con 2023',
                'start_date' => '2023-03-04',
                'end_date' => '2023-03-05',
            ],
            [
                'name' => 'UBCon 2018',
                'start_date' => '2018-04-20',
                'end_date' => '2018-04-22',
            ],
            [
                'name' => 'YetiCon 2019',
                'start_date' => '2019-06-14',
                'end_date' => '2019-06-16',
            ],
        ]);
    }
}
