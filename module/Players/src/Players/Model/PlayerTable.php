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

    public function getPlayerData()
    {
        $resultSet = $this->tableGateway->getAdapter()->driver->getConnection()->execute(
            "SELECT
  q.*,
  (q.yards / (SUM(q.yards)
  OVER (PARTITION BY q.team))) * 100.0 AS percentage
FROM (
    SELECT
         DISTINCT
         p.full_name,
         p.team,
         'RECEIVING' AS play_type,
         SUM(pp.receiving_yds)       AS yards,
         ARRAY_AGG(play.description) AS plays
       FROM public.player p
         JOIN public.play_player pp ON pp.player_id = p.player_id
         JOIN public.play play
           ON play.play_id = pp.play_id AND play.gsis_id = pp.gsis_id AND play.drive_id = pp.drive_id
         JOIN public.game g ON g.gsis_id = pp.gsis_id
       WHERE
         pp.gsis_id = 2014122106 :: gameid
    AND (pp.receiving_yds > 0)
       GROUP BY g.gsis_id, p.full_name, p.team

       UNION ALL

      SELECT
         DISTINCT
         p.full_name,
         p.team,
        'RUSHING' AS play_type,
         SUM(pp.rushing_yds)       AS yards,
         ARRAY_AGG(play.description) AS plays
       FROM public.player p
         JOIN public.play_player pp ON pp.player_id = p.player_id
         JOIN public.play play
           ON play.play_id = pp.play_id AND play.gsis_id = pp.gsis_id AND play.drive_id = pp.drive_id
         JOIN public.game g ON g.gsis_id = pp.gsis_id
       WHERE
         pp.gsis_id = 2014122106 :: gameid
    AND (pp.rushing_yds > 0)
       GROUP BY g.gsis_id, p.full_name, p.team
     ) q
ORDER BY team, play_type, full_name ASC;
        ");
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
        }
        return $results;
    }

    public function fetchAll()
    {
        $resultSet = $this->tableGateway->select("last_name = 'Smith'");
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
        }
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