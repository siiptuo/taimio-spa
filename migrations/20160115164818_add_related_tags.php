<?php

use Phinx\Migration\AbstractMigration;

class AddRelatedTags extends AbstractMigration
{
    public function change()
    {
        $relatedTag = $this->table('related_tag', [
            'id' => false,
            'primary_key' => ['tag_id', 'related_tag_id']
        ]);
        $relatedTag->addColumn('tag_id', 'integer')
            ->addColumn('related_tag_id', 'integer')
            ->create();
    }
}
