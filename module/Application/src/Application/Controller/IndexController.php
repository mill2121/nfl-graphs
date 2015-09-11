<?php

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Debug\Debug;

class IndexController extends AbstractActionController
{
    protected $playerTable;

    public function indexAction()
    {
        $playerData = $this->getPlayerTable()->getPlayerData();
        $gameData = $this->getPlayerTable()->getGameData();
        return new ViewModel(array(
            'playerData' => $playerData,
            'gameData' => $gameData
        ));
    }

    /**
     * For the initial load, the data is gotten through the indexAction, but this is the action for refreshing data
     * @return JsonModel
     */
    public function getPlayerDataAction()
    {
        $playerData = $this->getPlayerTable()->getPlayerData();
        $gameData = $this->getPlayerTable()->getGameData();
        return new JsonModel(array(
            'playerData' => $playerData,
            'gameData' => $gameData
        ));
    }

    /**
     * Get the play by play data for the drives graph, based on the driveFilter given
     * @return JsonModel
     */
    public function getPlayDataAction()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $driveFilter = $data['driveFilter'];
        $playData = $this->getPlayerTable()->getPlayData($driveFilter);
        return new JsonModel(array(
            'playData' => $playData
        ));
    }

    public function getPlayerTable()
    {
        if (!$this->playerTable) {
            $sm = $this->getServiceLocator();
            $this->playerTable = $sm->get('Players\Model\PlayerTable');
        }
        return $this->playerTable;
    }
}
