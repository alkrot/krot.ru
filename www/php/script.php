<?
	require_once 'config.php';
	require_once 'func.php';
	header('Content-Type: text/html; charset=utf-8', true);
	date_default_timezone_set('Etc/GMT-3');
	if($_SERVER['REQUEST_METHOD']=='POST'){
		switch($_POST['type']){
			case 'request':
				$field = array('series','equipment','type_equipment','contact','cause');
				$data = $db->filterArray($_POST,$field);
				$data['seal'] = ($_POST['seal'] == "sealYes") ? true : false;
				$data['group_id'] = intval(getId('group','name',$_POST['group']));
				$data['attachment_id'] = intval(getId('attachment','name',$_POST['attachment']));
				echo into('list',$data,"Заявка отправлена");
			break;
			case 'register':
				if(intval($_SESSION['user']['role']) === 4){
					
					if(!($_POST['password'] && $_POST['login'] && $_POST['group'])){
						echo json_encode(array("error"=>"Заполните все поля"));
						exit;
					}

					$isUser = $db->getRow("SELECT * FROM users where login = ?s",$_POST['login']);
					
					if($isUser){
						echo json_encode(array('messages'=>'Пользователь есть'));
						exit;
					}
					$field = array('login','password','role');
					$data = $db->filterArray($_POST,$field);
					$data['password'] = sha1($data['password'].sha1($data['login']));
					$data['group_id'] = intval(getId('group','name',$_POST['group']));
					$data['access_group'] = json_encode(explode(',',$_POST['vgroup']));
					echo into('users',$data,"Пользователь добавлен");
				}else{
					echo json_encode(array("error"=>"Нет прав"));
				}
			break;
			case 'show_users':
				if(intval($_SESSION['user']['role']) < 4) exit;
				echo getListAdmin(array("id","login"),"users",intval($_POST['offset']));
			break;
			case 'show_group':
				if(intval($_SESSION['user']['role']) < 4) exit;
				echo getListAdmin(array("id","name"),"group",intval($_POST['offset']));
			break;
			case "add_group":
				if(intval($_SESSION['user']['role']) < 4) exit;
				$field = $db->filterArray($_POST,array("name"));
				echo into('group',$field,'Группа добавлена');
			break;
			case 'add_attachment':
				if(intval($_SESSION['user']['role']) < 4) exit;
				$field = $db->filterArray($_POST,array("name"));
				echo into('attachment',$field,'Принадлежность добавлена');
			break;
			case 'show_attachment':
				if(intval($_SESSION['user']['role']) < 4) exit;
				echo getListAdmin(array("id","name"),"attachment",intval($_POST['offset']));
			break;
			case 'delete_users':
				if(intval($_SESSION['user']['role']) < 4) exit;
				echo deleteTable("users",intval($_POST['id']),"Пользователь удален");
			break;
            case  'show_user':
                if(intval($_SESSION['user']['role']) < 4) exit;
                echo show_user($_POST['id']);
            break;
            case 'update_users':
                if(intval($_SESSION['user']['role']) < 4) exit;
                $data = $db->filterArray($_POST,array("login","role"));
                if(strlen(trim($_POST['password'])) > 0){
                    $data["password"] = sha1($_POST['password'].sha1($data['login']));
                }
                $data["group_id"] = getId('group','name',$_POST['group']);
                $data["access_group"] = json_encode(explode(',',$_POST["vgroup"]));
                echo update('users',$data,"Данные изменены",$_POST['user_id']);
            break;
			case 'update_group':
				if(intval($_SESSION['user']['role']) < 4) exit;
				$data = $db->filterArray($_POST,array("name"));
				echo update('group',$data,'Название изменено',intval($_POST['id']));
			break;
			case 'update_attachment':
				if(intval($_SESSION['user']['role']) < 4) exit;
				$data = $db->filterArray($_POST,array("name"));
				echo update('attachment',$data,'Название изменено',intval($_POST['id']));
			break;
			case 'show':
				$role = intval($_SESSION['user']['role']);
				$access_group = $_SESSION['user']['access_group'];
				$post = $_POST;
				$gid = intval($_SESSION['user']['group_id']);
				
				if($role === 4){
					$post['group'] = intval(getId('group','name',$post['group']));
				}
				else if($role === 1 && $access_group && in_array($post['group'],$access_group)){ 
					$post['group'] = intval(getId('group','name',$post['group'])); 
				}
				else{ 
					$post['group'] = $gid;
				}
				
				$count = 0;
				$offset = ($post['offset'] > 0) ? $post['offset'] : 0;
				$show['items'] = getTable($post,$count,$offset);
				$show += $count;
				echo json_encode($show);
			break;
			case 'update':
				$role = intval($_SESSION['user']['role']);
				$gid = intval($_SESSION['user']['group_id']);
				$data = getData($_POST,$role);
				echo update('list',$data,'Обновлено',$_POST['req_id']);
			break;
			case 'add':
				$role = intval($_SESSION['user']['role']);
				$gid = intval($_SESSION['user']['group_id']);
				$data = getData($_POST,$role);
				if(!$data['group_id']) $data['group_id'] = $gid;
				echo into('list',$data,'Добавленно');
			break;
			case 'delete':
				$role = intval($_SESSION['user']['role']);
				if($role === 4){
					$id = intval($_POST['id']);
					$del = $db->query('DELETE FROM list WHERE id = ?i',$id);
					if($del) echo json_encode(array("messages" => "Удалено"));
				}else exit;
			break;
		}
	}
?>