<?
	header('Content-Type: text/html; charset=utf-8', true);
	//Показать главнную таблицу с заявками
	function getTable($post,&$count,$offset=0,$len=5){
		global $db;
		$sql = array();
		$query = 'WHERE ';
		$aid = intval($post['attachment']);
		$sql[] = ($post['series']) ? $db->parse('series = ?s',$post['series']) : false;
		$sql[] = ($post['equipment']) ? $db->parse('equipment = ?s',$post['equipment']) : false;
		$sql[] = ($post['status'] !== Null) ? $db->parse('status_id = ?i',$post['status']) : false;
		$sql[] = (intval($post['group']) > 0) ? $db->parse('group_id = ?i',$post['group']) : false;
		$sql[] = ($post['id'] > 0) ? $db->parse('`list`.id = ?i',$post['id']) : false;
		$sql[] = ($aid > 0) ? $db->parse('`list`.attachment_id=?i',$aid) : false;
		$sql[] = ($post['contact']) ? $db->parse('`list`.contact LIKE ?s',$post['contact'].'%') : false;
		if($post['stDate'] && $post['endDate']){
			switch($post['typeDate']){
				case 1:
					$sql[] = getQDate('receipt',$post['stDate'],$post['endDate']);
				break;
				case 2:
					$sql[] = getQDate('repairs',$post['stDate'],$post['endDate']);
				break;
				case 3:
					$sql[] = getQDate('receiving',$post['stDate'],$post['endDate']);
				break;
				case 4:
					$sql[] = getQDate('issued',$post['stDate'],$post['endDate']);
				break;
				default:
					$d[] = getQDate('receipt',$post['stDate'],$post['endDate']);
					$d[] = getQDate('repairs',$post['stDate'],$post['endDate']);
					$d[] = getQDate('issued',$post['stDate'],$post['endDate']);
					$d[] = getQDate('receiving',$post['stDate'],$post['endDate']);
					$sql[] = '('.implode(' OR ',$d).')';
				break;
			}
		}
		
		$sql = array_filter($sql);
		if(count($sql) > 0) $query .= implode(' AND ',$sql);
		else $query = '';
		$count = $db->getRow("SELECT COUNT(*) AS count FROM list ?p",$query);
		$data = $db->getAll("SELECT `list`.id,`list`.status_id,`series`,`mark_equipment`.name as equipment,`list`.`equipment` as equipment_id,`type_equipment`.name as type_equipment,`list`.tEquipmentId, `attachment`.name AS attachment_name, `attachment`.id AS attachment_id, `address`, `contact`,
		`group`.name AS group_name,`group`.id AS group_id,`got`,`note`, `status`,`receipt`,`receiving`,`repairs`,`issued`,`seal`,`cause`, 
		`mat1`,`mat2`,`mat3`,`mat4`,`mat5`,`mat6`,
		`mat1Count`,`mat2Count`,`mat3Count`,`mat4Count`,`mat5Count`,`mat6Count`
		FROM `list` 
		LEFT JOIN `group` ON `group`.id = `list`.group_id  
		LEFT JOIN `attachment` ON `attachment`.id = `list`.attachment_id 
		LEFT JOIN `liststatus` ON `list`.status_id = `liststatus`.id
		LEFT JOIN `type_equipment` ON `type_equipment`.id =  `list`.tEquipmentId
        LEFT JOIN `mark_equipment` ON `mark_equipment`.id = `list`.`equipment` ?p ORDER BY `list`.id LIMIT ?i,?i",$query,$offset,$len);
		return $data;
	}
	
	//Показать данные пользователя
	function show_user($user_id){
	    global $db;
	    $data = $db->getAll("SELECT * FROM users WHERE id = ?i",$user_id);
	    $data[0]["access_group"] = json_decode($data[0]["access_group"],true);
	    $data[0]["group"] = getName('group','name',$data[0]['group_id']);
	    return json_encode($data[0]);
    }

	//Вернтуь имя значение колонки по id
    function getName($table,$col,$id){
	    global $db;
	    $data = $db->getRow("SELECT ?n FROM ?n WHERE id=?i",$col,$table,$id);
	    return $data[$col];
    }
	
	//Формарирование sql запроса для фильтра по дате
	function getQDate($col,$stDate,$endDate){
		global $db;
		return $db->parse('DATE(?n) BETWEEN ?s AND ?s',$col,$stDate,$endDate);
	}
	
	//Вставка новый записи
	function into($table,$data,$messages){
		global $db;
		try{
			$res = $db->query("INSERT INTO ?n SET ?u",$table,$data);
			$datares = $db->getRow("SELECT * FROM ?n ORDER BY id DESC LIMIT 1",$table);
			if($res) return json_encode(array("messages"=>$messages,"data"=>$datares));
			return;
		}catch(\Exception $er){
			if(strpos($er->getMessage(),'Duplicate entry') >= 0)
				return json_encode(array("error"=>"Это уже есть"));
		}
	}
	
	//Обновление таблицы по id
	function update($table,$data,$messages,$id){
		global $db;
		$res = $db->query("UPDATE ?n SET ?u WHERE `id` = ?i",$table,$data,intval($id));
		if($res) return json_encode(array("messages"=>$messages));
		return;
	}
	
	//Формирование полей для sql запроса на вставку
	function getData($post,$role){
		global $db;

		$field = array('series','equipment','address','contact','got','note','repairs','receiving','issued','cause');
		$matName = array('mat1','mat2','mat3','mat4','mat5','mat6');
		$field = array_merge($field, $matName);

		$data = $db->filterArray($post,$field);

		foreach ($matName as $mat) {
			$matNameCount = $mat.'Count';
			$data[$matNameCount] = intval($post[$matNameCount]);
		}

		if($_POST['status'] !== Null && intval($_POST['status']) > 0)$data['status_id'] = intval($_POST['status']);
		$data['attachment_id'] = intval($post['attachment']);
		$data['seal'] = ($post['seal']) ? true : false;
		$data['tEquipmentId'] = $_POST['type_equipment'];
		$getid = array('id'=>$post['req_id']);
		$items = getTable($getid,$count);
		if($role === 4) $data['group_id'] = intval($post['group']);
		return $data;
	}
	
	//Для возвращение id по полю
	function getId($table,$filed,$val){
		global $db;
		$data = $db->getRow("SELECT * FROM ?n WHERE ?n = ?s",$table,$filed,$val);
		return $data["id"];
	}
	
	function getListTable($table){
		global $db;
		$data = $db->getAll("SELECT * FROM ?n",$table);
		if($data) return json_encode($data);
	}	
	//Данные для подсказчики заполнения datalist
	function getList($col,$table,$val){
		global $db;
		$res = $db->getAll("SELECT DISTINCT ?n AS name".($table == 'group' ? ',id' : '')." FROM ?n WHERE ?n LIKE ?s LIMIT 10",$col,$table,$col,"%".$val."%");
		if($_SESSION['user']['role'] == 1 && $table == "group"){
			$res = array_filter($res,function($var){
				$access_group = $_SESSION['user']['access_group'];
				if(in_array($var['name'],$access_group)) return $var;
			});
		}
		if($res) return json_encode($res);
	}
	
	//Форматирование времени для excel
	function formatToEx($indate){
		if($indate == '0000-00-00 00:00:00') return;
		$date = new DateTime($indate);
		$res = $date->format('YYYY-m-d');
		return $res;
	}
	
	//Форматирование времени для excel
	function formatToEx2($indate){
		if($indate == '0000-00-00 00:00:00') return;
		$date = new DateTime($indate);
		$res = $date->format('Y-m-d');
		return $res;
	}
	
	//Вывод списков для администратора Пользователи,Исполнители,Заказчики
	function getListAdmin($col,$table,$offset){
		global $db;
		if($table == "users")
		    $data = $db->getAll("SELECT ?n,?n,?n FROM ?n ORDER BY id LIMIT ?i,5",$col[0],$col[1],$col[2],$table,$offset);
		else
		    $data = $db->getAll("SELECT ?n,?n FROM ?n ORDER BY id LIMIT ?i,5",$col[0],$col[1],$table,$offset);
		return json_encode($data);
	}
	
	//Удаление из таблицы
	function deleteTable($table,$id,$msg){
		global $db;
		$del = $db->query('DELETE FROM ?n WHERE id = ?i',$table,$id);
		if($del) return json_encode(array("messages"=>$msg));
	}
?>