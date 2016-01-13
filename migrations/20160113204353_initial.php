<?php

use Phinx\Migration\AbstractMigration;

class Initial extends AbstractMigration
{
    public function up()
    {
        $activity = $this->table('activity');
        $activity->addColumn('started_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('finished_at', 'timestamp', ['null' => true])
            ->addColumn('title', 'text')
            ->save();
    }

    public function drop()
    {
        $this->dropTable('activity');
    }
}
