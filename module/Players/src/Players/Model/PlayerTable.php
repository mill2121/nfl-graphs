<?php
namespace Players\Model;

use Zend\Db\TableGateway\TableGateway;

class PlayerTable
{
    protected $tableGateway;

    public function __construct(TableGateway $tableGateway)
    {
        $tableGateway->initialize();
        $this->tableGateway = $tableGateway;
    }

    public function fetchAll()
    {
        $resultSet = $this->tableGateway->select("last_name = 'Smith'");
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
            //$resultSet->next();
        }
        //$resultSet->toArray();
        return $results;
    }

    public function getPlayer($id)
    {
        $id = (int)$id;
        $rowset = $this->tableGateway->select(array('id' => $id));
        $row = $rowset->current();
        if (!$row) {
            throw new \Exception("Could not find row $id");
        }
        return $row;
    }

    public function savePlayer(Player $player)
    {
        $data = array(
            'player_id' => $player->getPlayerId(),
            // Other columns to add
        );

        $id = (int)$player->getPlayerId();
        if ($id == 0) {
            $this->tableGateway->insert($data);
        } else {
            if ($this->getPlayer($id)) {
                $this->tableGateway->update($data, array('player_id' => $id));
            } else {
                throw new \Exception('Album id does not exist');
            }
        }
    }

    public function deletePlayer($id)
    {
        $this->tableGateway->delete(array('player_id' => (int)$id));
    }
}