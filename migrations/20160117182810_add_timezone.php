<?php

use Phinx\Migration\AbstractMigration;

class AddTimezone extends AbstractMigration
{
    public function up()
    {
        $activity = $this->table('activity');
        $activity->changeColumn('started_at', 'timestamp', ['timezone' => true])
            ->changeColumn('finished_at', 'timestamp', ['timezone' => true, 'null' => true])
            ->save();
    }

    public function down()
    {
        $activity = $this->table('activity');
        $activity->changeColumn('started_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
            ->changeColumn('finished_at', 'timestamp', ['null' => true])
            ->save();
    }
}
