<?
	header('Content-Type: text/html; charset=utf-8', true);
	function getTable($post,&$count,$offset=0,$len=5){
		global $db;
		$sql = array();
		$query = 'WHERE ';
		
		$sql[] = ($post['series']) ? $db->parse('series = ?s',$post['series']) : false;
		$sql[] = ($post['equipment']) ? $db->parse('equipment = ?s',$post['equipment']) : false;
		$sql[] = ($post['status'] !== Null) ? $db->parse('status = ?i',$post['status']) : false;
		$sql[] = (intval($post['group']) > 0) ? $db->parse('group_id = ?i',$post['group']) : false;
		$sql[] = ($post['id'] > 0) ? $db->parse('`list`.id = ?i',$post['id']) : false;
		if($post['stDate'] && $post['endDate']){
			switch($post['typeDate']){
				case 1:
					$sql[] = getQDate('receipt',$post['stDate'],$post['endDate']);
				break;
				case 2:
					$sql[] = getQDate('start_repair',$post['stDate'],$post['endDate']);
				break;
				case 3:
					$sql[] = getQDate('end_repair',$post['stDate'],$post['endDate']);
				break;
				case 4:
					$sql[] = getQDate('issued',$post['stDate'],$post['endDate']);
				break;
				default:
					
					$d[] = getQDate('receipt',$post['stDate'],$post['endDate']);
					$d[] = getQDate('start_repair',$post['stDate'],$post['endDate']);
					$d[] = getQDate('end_repair',$post['stDate'],$post['endDate']);
					$d[] = getQDate('issued',$post['stDate'],$post['endDate']);
					$sql[] = '('.implode(' OR ',$d).')';
				break;
			}
		}
		
		$sql = array_filter($sql);
		if(count($sql) > 0) $query .= implode(' AND ',$sql);
		else $query = '';
		$count = $db->getRow("SELECT COUNT(*) AS count FROM list ?p",$query);
		$data = $db->getAll("SELECT `list`.id, `series`,`equipment`,`type_equipment`, `attachment`.name AS attachment_name, `address`, `contact`,`group`.name AS group_name, `got`,`note`, `status`,`receipt`,`start_repair`,`end_repair`,`issued`,`seal`,`cause` FROM `list` LEFT JOIN `group` ON `group`.id = `list`.group_id  LEFT JOIN `attachment` ON `attachment`.id = `list`.attachment_id ?p ORDER BY `list`.id LIMIT ?i,?i",$query,$offset,$len);
		return $data;
	}
	
	function getQDate($col,$stDate,$endDate){
		global $db;
		return $db->parse('DATE(?n) BETWEEN ?s AND ?s',$col,$stDate,$endDate);
	}
	
	function into($table,$data,$messages){
		global $db;
		try{
			$res = $db->query("INSERT INTO ?n SET ?u",$table,$data);
			if($res) return json_encode(array("messages"=>$messages));
			return;
		}catch(\Exception $er){
			if(strpos($er->getMessage(),'Duplicate entry') >= 0)
				return json_encode(array("error"=>"Это уже есть"));
		}
	}
	
	function update($table,$data,$messages,$id){
		global $db;
		$res = $db->query("UPDATE ?n SET ?u WHERE `id` = ?i",$table,$data,intval($id));
		if($res) return json_encode(array("messages"=>$messages));
		return;
	}
	
	function getData($post,$role){
		global $db;
		$field = array('series','equipment','type_equipment','address','contact','got','status','note','issued','cause');
		$data = $db->filterArray($post,$field);
		$data['attachment_id'] = intval(getId('attachment','name',$post['attachment']));
		$data['seal'] = ($post['seal']) ? true : false;
		$getid = array('id'=>$post['req_id']);
		$items = getTable($getid,$count);
		if($role === 4) $data['group_id'] = intval(getId('group','name',$post['group']));
		if($data['status'] == 2 && $items[0]['status'] == 1) $data['start_repair'] = date("Y-m-d H:i:s");
		if(($data['status'] == 3 || $data['status'] == -1) && ($items[0]['status'] == 1 || $items[0]['status'] == 2) ){
			if($items[0]['start_repair'] === '0000-00-00 00:00:00') $data['start_repair'] = date("Y-m-d H:i:s");
			$data['end_repair'] = date("Y-m-d H:i:s");
		}
		return $data;
	}
	
	function getId($table,$filed,$val){
		global $db;
		$data = $db->getRow("SELECT * FROM ?n WHERE ?n = ?s",$table,$filed,$val);
		return $data["id"];
	}
	
	function getList($col,$table,$val){
		global $db;
		$query = $val."%";
		$res = $db->getAll("SELECT DISTINCT ?n AS name FROM ?n WHERE ?n LIKE ?s LIMIT 5",$col,$table,$col,$query);
		if($_SESSION['user']['role'] == 1){
			$res = array_filter($res,function($var){
				$access_group = $_SESSION['user']['access_group'];
				if(in_array($var['name'],$access_group)) return $var;
			});
		}
		if($res) return json_encode($res);
	}
	
	function getStatus($status){
		switch($status){
			case -1:
				return 'Отказанно';
			break;
			case 1:
				return 'На расмотрении';
			break;
			case 2:
				return 'В ремонте';
			break;
			case 3:
				return 'Отремонтировано';
			break;
            case 4:
                return 'Проверенно';
            break;
            case 5:
                return 'Настроено';
            break;
		}
	}
	
	function formatToEx($indate){
		if($indate == '0000-00-00 00:00:00') return;
		$date = new DateTime($indate);
		$res = $date->format('YYYY-m-d');
		return $res;
	}

	function getListAdmin($col,$table,$offset){
		global $db;
		$data = $db->getAll("SELECT ?n,?n FROM ?n ORDER BY id LIMIT ?i,5",$col[0],$col[1],$table,$offset);
		return json_encode($data);
	}
	
	function deleteTable($table,$id,$msg){
		global $db;
		$del = $db->query('DELETE FROM ?n WHERE id = ?i',$table,$id);
		if($del) return json_encode(array("messages"=>$msg));
	}
?>