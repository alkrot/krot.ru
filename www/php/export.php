<?
	ini_set('max_execution_time', 900);
	require_once 'config.php';
	require_once 'func.php';
	require_once 'excel/XLSXWriter.php';
	$role = intval($_SESSION['user']['role']);
	$get = $_GET;
	$gid = intval($_SESSION['user']['group_id']);
	if(!$role){
		echo "Нет прав";
		exit;
	}
	if($role == 4 || $role == 1 && $_SESSION['user']['access_group'] && in_array($get['group'],$_SESSION['user']['access_group']) && $get['group']) $get['group'] = intval(getId('group','name',$get['group']));
	else $get["group"] = $gid;
	$count = 0;
	$res = getTable($get,$count);
	$res = getTable($get,$count,0,$count["count"]);
	
	date_default_timezone_set('Etc/GMT-3');
	
	$filename = "report.xlsx";
	header('Content-disposition: attachment; filename="'.XLSXWriter::sanitize_filename($filename).'"');
	header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	header('Content-Transfer-Encoding: binary');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	
	$writer = new XLSXWriter();
	$sheet_options = array('autofilter'=>true,'freeze_pane' => array(1, 11));
	$styles = array('halign'=>'left');
	
	$writer->writeSheetHeader('Отчет', array('ID номер'=>'string','Оборудование'=>'string','Тип'=>'string','Cтатус'=>'string','Принадлежность'=>'string','Произвел ремонт'=>'string','Примечание'=>'string','Заявка от'=>'date','Начала ремонта'=>'date','Конец ремонта'=>'date','Выданно'=>'date'),array(),$sheet_options);//optional

	foreach($res as $val){
		$row[] = $val['series'];
		$row[] = $val['equipment'];
		$row[] = $val['type_equipment'];
		$row[] = getStatus(intval($val['status']));
		$row[] = $val['attachment_name'];
		$row[] = $val['got'];
		$row[] = $val['note'];
		$row[] = formatToEx($val['receipt']);
		$row[] = formatToEx($val['start_repair']);
		$row[] = formatToEx($val['end_repair']);
		$row[] = formatToEx($val['issued']);
		$writer->writeSheetRow('Отчет',$row,$styles);
		unset($row);
	}
	$writer->writeToStdOut();
	exit;
?>