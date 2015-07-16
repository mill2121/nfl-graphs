<?php

namespace Players\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class PlayersController extends AbstractActionController
{
    protected $playerTable;

    public function indexAction()
    {
        return new ViewModel(array(
            'players' => $this->getPlayerTable()->fetchAll()
        ));
    }

    public function viewPlayerAction()
    {
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