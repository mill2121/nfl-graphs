<?php

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class IndexController extends AbstractActionController
{
    protected $playerTable;

    public function indexAction()
    {
        $playerData = $this->getPlayerTable()->getPlayerData();
        return new ViewModel(array(
            'playerData' => $playerData
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
