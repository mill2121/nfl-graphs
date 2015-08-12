<?php

namespace NflGraphs\View\Helper;
use Zend\View\Helper\AbstractHelper;
use Zend\Json\Json;

class NgInit extends AbstractHelper
{
    public function __invoke($varName)
    {
        if (is_array($varName)) {
            $output = array();
            foreach ($varName as $key => $name) {
                if ($this->view->$name != null) {
                    if (!is_int($key)) {
                        $keyNm = $key;
                    } else {
                        $keyNm = $name;
                    }
                    $output[] = $keyNm . '=' . htmlspecialchars(Json::encode($this->view->$name), ENT_QUOTES) . ';';
                }
            }
            if (count($output) > 0) {
                return "ng-init='" . implode('', $output) . "'";
            }
        } else {
            if ($this->view->$varName != null) {
                if (is_array($this->view->$varName)) {
                    $output = array();
                    foreach ($this->view->$varName as $key => $name) {
                        $output[] = htmlspecialchars(Json::encode($name), ENT_QUOTES) . ',';
                    }
                    return "ng-init='$varName=[" . implode('', $output) . "]'";
                } else {
                    return "ng-init='$varName=" . htmlspecialchars(Json::encode($this->view->$varName), ENT_QUOTES) . ";'";
                }
            }
        }
        return null;
    }
}