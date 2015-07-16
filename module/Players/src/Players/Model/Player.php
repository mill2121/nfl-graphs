<?php

namespace Players\Model;

/**
 * Class Player
 * @package Players\Model
 */
class Player
{
    /**
     * @var string
     */
    protected $playerId;
    /**
     * @var string
     */
    protected $gsisName;
    /**
     * @var string
     */
    protected $fullName;
    /**
     * @var string
     */
    protected $lastName;
    /**
     * @var string
     */
    protected $team;

    /**
     * @return string
     */
    public function getPlayerId()
    {
        return $this->playerId;
    }

    /**
     * @param string $playerId
     */
    public function setPlayerId($playerId)
    {
        $this->playerId = $playerId;
    }

    /**
     * @return string
     */
    public function getGsisName()
    {
        return $this->gsisName;
    }

    /**
     * @param string $gsisName
     */
    public function setGsisName($gsisName)
    {
        $this->gsisName = $gsisName;
    }

    /**
     * @return string
     */
    public function getFullName()
    {
        return $this->fullName;
    }

    /**
     * @param string $fullName
     */
    public function setFullName($fullName)
    {
        $this->fullName = $fullName;
    }

    /**
     * @return string
     */
    public function getLastName()
    {
        return $this->lastName;
    }

    /**
     * @param string $lastName
     */
    public function setLastName($lastName)
    {
        $this->lastName = $lastName;
    }

    /**
     * @return string
     */
    public function getTeam()
    {
        return $this->team;
    }

    /**
     * @param string $team
     */
    public function setTeam($team)
    {
        $this->team = $team;
    }

    public function exchangeArray($data)
    {
        $this->playerId     = (!empty($data['player_id'])) ? $data['player_id'] : null;
        $this->gsisName = (!empty($data['gsis_name'])) ? $data['gsis_name'] : null;
        $this->fullName  = (!empty($data['full_name'])) ? $data['full_name'] : null;
        $this->lastName  = (!empty($data['last_name'])) ? $data['last_name'] : null;
        $this->team  = (!empty($data['team'])) ? $data['team'] : null;

    }

    public function toJson() {
        return json_encode(array(
            'playerId' => $this->getPlayerId(),
            'gsisName' => $this->getGsisName(),
            'fullName' => $this->getFullName(),
            'lastName' => $this->getLastName(),
            'team' => $this->getTeam(),
        ));
    }
}