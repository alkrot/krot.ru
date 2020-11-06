<?php
/**
 * Created by PhpStorm.
 * User: usesuser
 * Date: 16.09.2017
 * Time: 12:23
 */
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Notify\Notify;

require  dirname(__DIR__) . '/vendor/autoload.php';

$server = IoServer::factory(
    new WsServer(
        new Notify()
    ), 8080
);

$server->run();