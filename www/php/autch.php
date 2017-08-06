<?
	require_once 'config.php';
	
	if($_GET['type'] == 'out'){
		unset($_SESSION['user']);
		echo json_encode(array('messages'=>'Вы вышли'));
		exit;
	}
	
	if($_SESSION['user']){
		echo json_encode($_SESSION['user']);
		exit;
	}
	
	$login = $_GET['login'];
	$pass = sha1($_GET['pass'].sha1($login));
	$data = $db->getRow("SELECT * FROM users WHERE login = ?s AND password = ?s",$login,$pass);
	
	if($data["role"]){
		$_SESSION['user'] = array(
			'id'=> $data['id'],
			'login'=> $data['login'],
			'fullname'=>$data['fullname'],
			'role'=>$data['role'],
			'group_id'=>$data['group_id'],
			'access_group' => json_decode($data['access_group'],true)
		);
		echo json_encode($_SESSION['user']);
	}elseif($login && $pass && !$_SESSION)
	{
		echo json_encode(array("error"=>"Проверьте правильность логина и пароля"));
	}else{
		echo json_encode(array("error"=>"Вы не авторизованы"));
	}
?>