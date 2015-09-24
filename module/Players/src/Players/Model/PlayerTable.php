<?php
namespace Players\Model;

use Zend\Db\TableGateway\TableGateway;
use Zend\Debug\Debug;

class PlayerTable
{
    protected $tableGateway;

    public function __construct(TableGateway $tableGateway)
    {
        $tableGateway->initialize();
        $this->tableGateway = $tableGateway;
    }

    /**
     * Filter out the week given a selected value
     * @param $query
     * @param $selectedWeek
     * @return string
     */
    private function _filterWeek($query, $selectedWeek) {
        if ($selectedWeek) {
            return str_replace('[[weekSelected]]', $selectedWeek, $query);
        } else {
            return str_replace('[[weekSelected]]', 'm.week', $query);
        }
    }

    /**
     * Get the play by play information so that you can populate the time of possession area chart.
     * @param $driveFilter - The quarter in which you wish to see the plays, defaults to 'all'.
     * @param $selectedWeek - The week in which you wish to see the plays, defaults to null (which grabs the currentWeek).
     * @return array
     */
    public function getPlayData($driveFilter, $selectedWeek = null)
    {
        $query = "
SELECT d.gsis_id, g.home_team, (g.home_team = d.pos_team) AS is_home_team, d.drive_id, p.time, d.end_time,
  nfl_graphs.get_seconds(p.time) AS time_seconds,
  nfl_graphs.get_yardline(
     CASE WHEN (p.note IS NULL OR p.note <> 'XP') THEN p.yardline ELSE '(50)'::field_pos END
  ) as yardline,
  CASE WHEN (p.note = 'TD' OR p.note = 'FG' OR p.note = '2PS' OR p.note = '2PRF') THEN TRUE ELSE FALSE END AS scored,
  CASE WHEN (p.note = 'INT' OR (p.note = 'FUMBLE' AND d.result = 'Fumble') OR p.note = 'FGB' OR p.note = 'FGM' OR p.note = 'SAF')
    THEN TRUE ELSE FALSE END AS turnover,
  p.note,
  d.pos_team, t.city || ' ' || t.name AS pos_label, CASE WHEN (g.home_team = d.pos_team) THEN g.home_score ELSE g.away_score END AS pos_score,
  tc.primary_color, tc.secondary_color, d.result, p.play_id, p.description, p.time
FROM public.game g
JOIN public.drive d ON (d.gsis_id = g.gsis_id)
JOIN nfl_graphs.team_colors tc ON (d.pos_team = tc.team_id)
JOIN public.play p ON (p.gsis_id = d.gsis_id AND p.drive_id = d.drive_id)
JOIN public.team t ON (t.team_id = d.pos_team)
JOIN public.meta m ON (g.week = [[weekSelected]] AND g.season_year = m.season_year AND g.season_type = m.season_type)
WHERE g.start_time < now()
      [[driveFilter]]
ORDER BY d.gsis_id DESC, d.drive_id, p.play_id;
        ";

        // Apply the drive filter by attaching the appropriate WHERE clauses
        if ($driveFilter == 'all') {
            $query = str_replace('[[driveFilter]]', '', $query);
        } else {
            $query = str_replace('[[driveFilter]]', " AND p.time::text LIKE '(" . $driveFilter . "%'", $query);
        }
        $query = self::_filterWeek($query, $selectedWeek);

        $resultSet = $this->tableGateway->getAdapter()->driver->getConnection()->execute($query);
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
        }
        return $results;
    }

    /**
     * Get the current live game data, like score/time/downs/current drive/etc
     * @param $selectedWeek - The week in which you wish to see the plays, defaults to null (which grabs the currentWeek).
     * @return array
     */
    public function getGameData($selectedWeek = null)
    {
        $query = "
SELECT g.week, g.season_type, t.name, play.pos_team, g.home_team, g.away_team, tc.logo_url, play.time, g.home_score, g.away_score, g.finished, play.yardline, play.down, play.yards_to_go,
  q.* FROM (
  SELECT play.gsis_id, MAX(play.play_id) AS play_id FROM public.game g
  JOIN public.play play ON play.gsis_id = g.gsis_id
  WHERE g.start_time < now()

  -- Uncomment to test the gauges
  AND pos_team <> 'UNK'

  GROUP BY play.gsis_id
) q
JOIN public.play play ON (q.gsis_id = play.gsis_id AND q.play_id = play.play_id)
JOIN public.game g ON (g.gsis_id = play.gsis_id)
JOIN public.meta m ON (g.week = [[weekSelected]] AND g.season_year = m.season_year AND g.season_type = m.season_type)
JOIN public.team t ON t.team_id = play.pos_team
JOIN nfl_graphs.team_colors tc ON (play.pos_team = tc.team_id)
ORDER BY q.gsis_id DESC;
        ";
        $query = self::_filterWeek($query, $selectedWeek);
        $resultSet = $this->tableGateway->getAdapter()->driver->getConnection()->execute($query);
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
        }
        return $results;
    }

    /**
     * Get the individual player data, shows how much an individual player is contributing to a team's offense.
     * @param $selectedWeek - The week in which you wish to see the plays, defaults to null (which grabs the currentWeek).
     * @return array
     */
    public function getPlayerData($selectedWeek = null)
    {
        $query = "
SELECT
  q.*,
  (q.yards / (SUM(q.yards)
  OVER (PARTITION BY q.team))) * 100.0 AS percentage
FROM (
    SELECT
         p.full_name,
         left(p.first_name, 1) || '. ' || p.last_name AS abbr_name,
         g.gsis_id AS game,
         g.home_team = t.team_id AS home_team,
         CASE WHEN g.home_team = t.team_id THEN g.home_score ELSE g.away_score END AS score,
         t.city || ' ' || t.name AS team,
         tc.primary_color AS color,
         tc.border_color AS border_color,
         'RECEIVING' AS play_type,
         SUM(pp.receiving_yds)             AS yards,
         SUM(ap.passing_cmp) || '/' || SUM(ap.passing_att) || ' for ' || SUM(pp.receiving_yds) || ' YDs and '
            || SUM(ap.receiving_tds) || ' TD(s)'
                                           AS stats
       FROM public.player p
         JOIN public.play_player pp ON pp.player_id = p.player_id
         JOIN public.play play
           ON play.play_id = pp.play_id AND play.gsis_id = pp.gsis_id AND play.drive_id = pp.drive_id
         JOIN public.agg_play ap
           ON play.play_id = ap.play_id AND play.gsis_id = ap.gsis_id AND play.drive_id = ap.drive_id
         JOIN public.team t ON t.team_id = play.pos_team
         JOIN nfl_graphs.team_colors tc ON tc.team_id = t.team_id
         JOIN public.game g ON g.gsis_id = pp.gsis_id

         -- *************************************
         -- Uncomment when season starts!!!
         -- *************************************
         --JOIN public.meta m ON (g.week = 8 AND g.season_year = 2014)
         JOIN public.meta m ON (g.week = [[weekSelected]] AND g.season_year = m.season_year AND g.season_type = m.season_type)
       WHERE
      g.start_time < now()
       GROUP BY g.gsis_id, p.full_name, p.first_name, p.last_name, t.team_id, t.city, t.name, tc.primary_color, tc.border_color

       UNION ALL

      SELECT
         p.full_name,
        left(p.first_name, 1) || '. ' || p.last_name AS abbr_name,
         g.gsis_id AS game,
         g.home_team = t.team_id AS home_team,
         CASE WHEN g.home_team = t.team_id THEN g.home_score ELSE g.away_score END AS score,
         t.city || ' ' || t.name AS team,
         tc.secondary_color AS color,
         tc.border_color AS border_color,
        'RUSHING' AS play_type,
         SUM(pp.rushing_yds)               AS yards,
         round(SUM(ap.rushing_yds) / cast(SUM(ap.rushing_att) as NUMERIC), 1) || ' YPC for ' || SUM(ap.rushing_yds) || ' YDs and '
              || SUM(ap.rushing_tds) || ' TD(s)'
                                           AS stats
       FROM public.player p
         JOIN public.play_player pp ON pp.player_id = p.player_id
         JOIN public.play play
           ON play.play_id = pp.play_id AND play.gsis_id = pp.gsis_id AND play.drive_id = pp.drive_id
         JOIN public.agg_play ap
           ON play.play_id = ap.play_id AND play.gsis_id = ap.gsis_id AND play.drive_id = ap.drive_id
         JOIN public.team t ON t.team_id = play.pos_team
         JOIN nfl_graphs.team_colors tc ON tc.team_id = t.team_id
         JOIN public.game g ON g.gsis_id = pp.gsis_id

         -- *************************************
         -- Uncomment when season starts!!!
         -- *************************************
         --JOIN public.meta m ON (g.week = 8 AND g.season_year = 2014)
         JOIN public.meta m ON (g.week = [[weekSelected]] AND g.season_year = m.season_year AND g.season_type = m.season_type)
       WHERE
      g.start_time < now()
       GROUP BY g.gsis_id, p.full_name, p.first_name, p.last_name, t.team_id, t.city, t.name, tc.secondary_color, tc.border_color
     ) q
WHERE q.yards > 0
ORDER BY game DESC, home_team DESC, play_type, full_name ASC;
        ";
        $query = self::_filterWeek($query, $selectedWeek);
        $resultSet = $this->tableGateway->getAdapter()->driver->getConnection()->execute($query);
        $resultSet->buffer();
        $results = array();
        foreach ($resultSet as $row) {
            array_push($results, $row);
        }
        return $results;
    }

    public function getCurrentWeek()
    {
        $resultSet = $this->tableGateway->getAdapter()->driver->getConnection()->execute(
            "SELECT week FROM public.meta"
        );
        $resultSet->buffer();
        $currentWeek = null;
        foreach ($resultSet as $row) {
            $currentWeek = $row['week'];
        }
        return $currentWeek;
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

    public static function pgArrayToPhp($text)
    {
        if (is_null($text)) {
            return array();
        } else if (is_string($text) && $text != '{}') {
            $text = substr($text, 1, -1); // Removes starting "{" and ending "}"

            $values = explode(',', $text);
            $fixedValues = array();
            foreach ($values as $value) {
                if (substr($value, 0, 1) == '"') {
                    $value = substr($value, 1);
                }
                if (substr($value, -1, 1) == '"') {
                    $value = substr($value, 0, -1);
                }
                $value = str_replace('\\"', '"', $value);
                $fixedValues[] = $value;
            }

            return $fixedValues;
        } else {
            return array();
        }
    }
}