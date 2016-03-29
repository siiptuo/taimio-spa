<?php

use Phinx\Seed\AbstractSeed;

class ActivitySeeder extends AbstractSeed
{
    private function arrayGetRandom($array, $count = 1)
    {
        $i = array_rand($array, $count);
        if ($count == 1) {
            return [$array[$i]];
        }
        return array_map(function ($i) use ($array) {
            return $array[$i];
        }, $i);
    }

    public function run()
    {
        $words = [
            'siintää',
            'pala',
            'kaappaus',
            'egypti',
            'maltti',
            'lohdutus',
            'noin',
            'kaljuuna',
            'ristiluu',
            'vietti',
            'euraasia',
            'pärinä',
            'tutustua',
            'tyhjä',
            'juoheva',
            'erkkeri',
            'mekastaa',
            'arabi',
            'leipuri',
            'eturivi',
            'vallata',
            'naiivius',
            'ikäryhmä',
            'kookos',
            'välitys',
            'siivekäs',
            'inahtaa',
            'humaani',
            'pollari',
            'nurmikko',
            'nutipää',
            'tulkinta',
            'killinki',
            'arktinen',
            'liitin',
            'pikinen',
            'caries',
            'arvaus',
        ];
        $tagData = [];
        $activityData = [];
        $activityTagData = [];

        $tagList = $words;
        shuffle($tagList);
        for ($i = 0; $i < 10; $i++) {
            $tagData[] = [
                'id' => $i,
                'title' => array_pop($tagList),
            ];
        }
        for ($i = 0; $i < 100; $i++) {
            if ($i == 99) {
                $startedAt = date('Y-m-d H:i:s', time() - random_int(0, 60 * 60));
                $finishedAt = null;
            } else {
                $s = time() - random_int(60 * 60, 60 * 60 * 24 * 7 * 4);
                $startedAt = date('Y-m-d H:i:s', $s);
                $finishedAt = date('Y-m-d H:i:s', $s + random_int(60, 60 * 60 * 4));
            }
            $activityData[] = [
                'id' => $i,
                'title' => implode(' ', $this->arrayGetRandom($words, random_int(1, 2))),
                'started_at' => $startedAt,
                'finished_at' => $finishedAt,
            ];
            $activityTagData = array_merge($activityTagData, array_map(function ($tag) use ($i) {
                return [
                    'activity_id' => $i,
                    'tag_id' => $tag['id'],
                ];
            }, $this->arrayGetRandom($tagData, random_int(1, 3))));
        }

        $this->table('tag')->insert($tagData)->save();
        $this->table('activity')->insert($activityData)->save();
        $this->table('activity_tag')->insert($activityTagData)->save();
    }
}
