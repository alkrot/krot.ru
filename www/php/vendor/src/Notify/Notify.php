<?php
/**
 * Created by PhpStorm.
 * User: usesuser
 * Date: 16.09.2017
 * Time: 12:19
 */

namespace Notify;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Notify implements MessageComponentInterface
{
    protected $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }

    public  function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
    }

    public  function onMessage(ConnectionInterface $from, $msg)
    {
       foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
       }
    }

    public  function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->close();
    }
}