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
                'url_alias' => 'akon-2022',
            ],
            [
                'name' => 'Anime Expo 2023',
                'start_date' => '2023-07-01',
                'end_date' => '2023-07-04',
                'url_alias' => 'anime-expo-2023',
            ],
            [
                'name' => 'Anime North 2016',
                'start_date' => '2016-05-27',
                'end_date' => '2016-05-29',
                'url_alias' => 'anime-north-2016',
            ],
            [
                'name' => 'Anime North 2017',
                'start_date' => '2017-05-26',
                'end_date' => '2017-05-28',
                'url_alias' => 'anime-north-2017',
            ],
            [
                'name' => 'Anime North 2018',
                'start_date' => '2018-05-25',
                'end_date' => '2018-05-27',
                'url_alias' => 'anime-north-2018',
            ],
            [
                'name' => 'Anime North 2019',
                'start_date' => '2019-05-24',
                'end_date' => '2019-05-26',
                'url_alias' => 'anime-north-2019',
            ],
            [
                'name' => 'AnimeNEXT 2014',
                'start_date' => '2014-06-06',
                'end_date' => '2014-06-08',
                'url_alias' => 'animenext-2014',
            ],
            [
                'name' => 'AnimeNEXT 2015',
                'start_date' => '2015-06-12',
                'end_date' => '2015-06-14',
                'url_alias' => 'animenext-2015',
            ],
            [
                'name' => 'ANYC 2019',
                'start_date' => '2019-11-15',
                'end_date' => '2019-11-17',
                'url_alias' => 'anyc-2019',
            ],
            [
                'name' => 'ANYC 2023',
                'start_date' => '2023-11-17',
                'end_date' => '2023-11-19',
                'url_alias' => 'anyc-2023',
            ],
            [
                'name' => 'AUSA 2016',
                'start_date' => '2016-10-21',
                'end_date' => '2016-10-23',
                'url_alias' => 'ausa-2016',
            ],
            [
                'name' => 'AUSA 2023',
                'start_date' => '2023-09-22',
                'end_date' => '2023-09-24',
                'url_alias' => 'ausa-2023',
            ],
            [
                'name' => 'AWA 2019',
                'start_date' => '2019-10-31',
                'end_date' => '2019-11-03',
                'url_alias' => 'awa-2019',
            ],
            [
                'name' => 'AWA 2023',
                'start_date' => '2023-10-26',
                'end_date' => '2023-10-29',
                'url_alias' => 'awa-2023',
            ],
            [
                'name' => 'CharaExpo 2018',
                'start_date' => '2018-11-10',
                'end_date' => '2018-11-11',
                'url_alias' => 'charaexpo-2018',
            ],
            [
                'name' => 'CloverCon 2015',
                'start_date' => '2015-05-17',
                'end_date' => '2015-05-17',
                'url_alias' => 'clovercon-2015',
            ],
            [
                'name' => 'Colossalcon 2016',
                'start_date' => '2016-06-02',
                'end_date' => '2016-06-05',
                'url_alias' => 'colossalcon-2016',
            ],
            [
                'name' => 'Colossalcon 2017',
                'start_date' => '2017-06-01',
                'end_date' => '2017-06-04',
                'url_alias' => 'colossalcon-2017',
            ],
            [
                'name' => 'Colossalcon 2018',
                'start_date' => '2018-05-31',
                'end_date' => '2018-06-03',
                'url_alias' => 'colossalcon-2018',
            ],
            [
                'name' => 'Colossalcon East 2017',
                'start_date' => '2017-09-08',
                'end_date' => '2017-09-10',
                'url_alias' => 'colossalcon-east-2017',
            ],
            [
                'name' => 'Colossalcon East 2018',
                'start_date' => '2018-09-07',
                'end_date' => '2018-09-09',
                'url_alias' => 'colossalcon-east-2018',
            ],
            [
                'name' => 'Colossalcon East 2019',
                'start_date' => '2019-09-13',
                'end_date' => '2019-09-15',
                'url_alias' => 'colossalcon-east-2019',
            ],
            [
                'name' => 'Colossalcon East 2021',
                'start_date' => '2021-09-17',
                'end_date' => '2021-09-19',
                'url_alias' => 'colossalcon-east-2021',
            ],
            [
                'name' => 'Colossalcon East 2022',
                'start_date' => '2022-09-09',
                'end_date' => '2022-09-11',
                'url_alias' => 'colossalcon-east-2022',
            ],
            [
                'name' => 'Cosplay Matsuri Toronto 2017',
                'start_date' => '2017-08-12',
                'end_date' => '2017-08-12',
                'url_alias' => 'cosplay-matsuri-toronto-2017',
            ],
            [
                'name' => 'Cosplay Snow Festival 2014',
                'start_date' => '2014-12-06',
                'end_date' => '2014-12-06',
                'url_alias' => 'cosplay-snow-festival-2014',
            ],
            [
                'name' => 'Cosplay Snow Festival 2016',
                'start_date' => '2016-12-03',
                'end_date' => '2016-12-03',
                'url_alias' => 'cosplay-snow-festival-2016',
            ],
            [
                'name' => 'Cosplay Snow Festival 2019',
                'start_date' => '2019-01-26',
                'end_date' => '2019-01-26',
                'url_alias' => 'cosplay-snow-festival-2019',
            ],
            [
                'name' => 'Castle Point Anime Con 2023',
                'start_date' => '2023-04-29',
                'end_date' => '2023-04-30',
                'url_alias' => 'castle-point-anime-con-2023',
            ],
            [
                'name' => 'DC Sakura Matsuri 2022',
                'start_date' => '2022-04-09',
                'end_date' => '2022-04-10',
                'url_alias' => 'dc-sakura-matsuri-2022',
            ],
            [
                'name' => 'DC Sakura Matsuri 2023',
                'start_date' => '2023-04-15',
                'end_date' => '2023-04-16',
                'url_alias' => 'dc-sakura-matsuri-2023',
            ],
            [
                'name' => 'Fan World 2016',
                'start_date' => '2016-08-26',
                'end_date' => '2016-08-28',
                'url_alias' => 'fan-world-2016',
            ],
            [
                'name' => 'Fan World 2018',
                'start_date' => '2018-07-06',
                'end_date' => '2018-07-08',
                'url_alias' => 'fan-world-2018',
            ],
            [
                'name' => 'Katsucon 2017',
                'start_date' => '2017-02-17',
                'end_date' => '2017-02-19',
                'url_alias' => 'katsucon-2017',
            ],
            [
                'name' => 'Katsucon 2018',
                'start_date' => '2018-02-16',
                'end_date' => '2018-02-18',
                'url_alias' => 'katsucon-2018',
            ],
            [
                'name' => 'Katsucon 2019',
                'start_date' => '2019-02-15',
                'end_date' => '2019-02-17',
                'url_alias' => 'katsucon-2019',
            ],
            [
                'name' => 'Katsucon 2020',
                'start_date' => '2020-02-14',
                'end_date' => '2020-02-16',
                'url_alias' => 'katsucon-2020',
            ],
            [
                'name' => 'Katsucon 2022',
                'start_date' => '2022-02-18',
                'end_date' => '2022-02-20',
                'url_alias' => 'katsucon-2022',
            ],
            [
                'name' => 'Katsucon 2023',
                'start_date' => '2023-02-17',
                'end_date' => '2023-02-19',
                'url_alias' => 'katsucon-2023',
            ],
            [
                'name' => 'MAGFest 2017',
                'start_date' => '2017-01-05',
                'end_date' => '2017-01-08',
                'url_alias' => 'magfest-2017',
            ],
            [
                'name' => 'MAGFest 2018',
                'start_date' => '2018-01-04',
                'end_date' => '2018-01-07',
                'url_alias' => 'magfest-2018',
            ],
            [
                'name' => 'MAGFest 2019',
                'start_date' => '2019-01-03',
                'end_date' => '2019-01-06',
                'url_alias' => 'magfest-2019',
            ],
            [
                'name' => 'MAGFest 2022',
                'start_date' => '2022-01-06',
                'end_date' => '2022-01-09',
                'url_alias' => 'magfest-2022',
            ],
            [
                'name' => 'MAGFest 2023',
                'start_date' => '2023-01-05',
                'end_date' => '2023-01-08',
                'url_alias' => 'magfest-2023',
            ],
            [
                'name' => 'Otakon 2014',
                'start_date' => '2014-08-08',
                'end_date' => '2014-08-10',
                'url_alias' => 'otakon-2014',
            ],
            [
                'name' => 'Otakon 2021',
                'start_date' => '2021-08-06',
                'end_date' => '2021-08-08',
                'url_alias' => 'otakon-2021',
            ],
            [
                'name' => 'Otakon 2022',
                'start_date' => '2022-07-29',
                'end_date' => '2022-07-31',
                'url_alias' => 'otakon-2022',
            ],
            [
                'name' => 'Otakon 2023',
                'start_date' => '2023-08-28',
                'end_date' => '2023-08-30',
                'url_alias' => 'otakon-2023',
            ],
            [
                'name' => 'Otakuthon 2016',
                'start_date' => '2016-08-05',
                'end_date' => '2016-08-07',
                'url_alias' => 'otakuthon-2016',
            ],
            [
                'name' => 'Otakuthon 2017',
                'start_date' => '2017-08-04',
                'end_date' => '2017-08-06',
                'url_alias' => 'otakuthon-2017',
            ],
            [
                'name' => 'Otakuthon 2018',
                'start_date' => '2018-08-03',
                'end_date' => '2018-08-05',
                'url_alias' => 'otakuthon-2018',
            ],
            [
                'name' => 'Otakuthon 2019',
                'start_date' => '2019-08-16',
                'end_date' => '2019-08-18',
                'url_alias' => 'otakuthon-2019',
            ],
            [
                'name' => 'Otakuthon 2023',
                'start_date' => '2023-08-11',
                'end_date' => '2023-08-13',
                'url_alias' => 'otakuthon-2023',
            ],
            [
                'name' => 'Puchicon PA 2023',
                'start_date' => '2023-10-21',
                'end_date' => '2023-10-22',
                'url_alias' => 'puchicon-pa-2023',
            ],
            [
                'name' => 'Tekko 2018',
                'start_date' => '2018-04-05',
                'end_date' => '2014-04-08',
                'url_alias' => 'tekko-2018',
            ],
            [
                'name' => 'Tekko 2019',
                'start_date' => '2019-04-11',
                'end_date' => '2019-04-14',
                'url_alias' => 'tekko-2019',
            ],
            [
                'name' => 'Tekko 2021',
                'start_date' => '2021-12-09',
                'end_date' => '2021-12-12',
                'url_alias' => 'tekko-2021',
            ],
            [
                'name' => 'Tekko 2022',
                'start_date' => '2022-07-21',
                'end_date' => '2022-07-24',
                'url_alias' => 'tekko-2022',
            ],
            [
                'name' => 'Tekko 2023',
                'start_date' => '2023-07-20',
                'end_date' => '2023-07-23',
                'url_alias' => 'tekko-2023',
            ],
            [
                'name' => 'Tora-con 2014',
                'start_date' => '2014-03-08',
                'end_date' => '2014-03-09',
                'url_alias' => 'toracon-2014',
            ],
            [
                'name' => 'Tora-con 2015',
                'start_date' => '2015-04-18',
                'end_date' => '2015-04-19',
                'url_alias' => 'toracon-2015',
            ],
            [
                'name' => 'Tora-con 2016',
                'start_date' => '2016-04-23',
                'end_date' => '2016-04-24',
                'url_alias' => 'toracon-2016',
            ],
            [
                'name' => 'Tora-con 2017',
                'start_date' => '2017-04-22',
                'end_date' => '2017-04-23',
                'url_alias' => 'toracon-2017',
            ],
            [
                'name' => 'Tora-con 2018',
                'start_date' => '2018-04-14',
                'end_date' => '2018-04-15',
                'url_alias' => 'toracon-2018',
            ],
            [
                'name' => 'Tora-con 2019',
                'start_date' => '2019-03-23',
                'end_date' => '2019-03-24',
                'url_alias' => 'toracon-2019',
            ],
            [
                'name' => 'Tora-con 2022',
                'start_date' => '2022-03-19',
                'end_date' => '2022-03-19',
                'url_alias' => 'toracon-2022',
            ],
            [
                'name' => 'Tora-con 2023',
                'start_date' => '2023-03-04',
                'end_date' => '2023-03-05',
                'url_alias' => 'toracon-2023',
            ],
            [
                'name' => 'UBCon 2018',
                'start_date' => '2018-04-20',
                'end_date' => '2018-04-22',
                'url_alias' => 'ubcon-2018',
            ],
            [
                'name' => 'YetiCon 2019',
                'start_date' => '2019-06-14',
                'end_date' => '2019-06-16',
                'url_alias' => 'yeticon-2019',
            ],
        ]);
    }
}
