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

    if($_GET["type"] == "print"){
        $i = 1;
        echo "
            <style>table {
                           border-collapse: collapse;
                           width: 100%;
                           font-size: 1.0em;
                           text-align: center;
                    }
                    th {
                        background: whitesmoke;
                        height: 50px;
                    }
                    .ext {
                        text-align: right;
                        border-right: hidden;
                        vertical-align: text-bottom;
                    }
                    tr:last-child, tr:nth-last-child(2),tr:nth-last-child(3) {
                        border-bottom: hidden;
                        border-right: hidden;
                        border-left: hidden;
                        height: 50px;
                    }
                    td[colspan]{
                        text-align: left;
                    }
                    tr:nth-last-child(4){
                        height: 50px;
                        border: hidden;
                        border-top: black;
                    }
                    td {
                        empty-cells: hide;
                    }
                    
                    @media print {
                        a,input {
                            display: none;
                        }
                    }
                    
                    input {
                        cursor: pointer;
                    }
                    caption {
                        padding: 50px;
                        font-size: 24px;
                        font-weight: bolder;
                    }
            </style>";
        echo "<a href='{$_SERVER["HTTP_REFERER"]}'>Вернуться</a> <input type='button' onclick='print();' value='Печать'>";
        echo "<table border='1'><caption>Акт приема передачи оборудования</caption><col width='10px'><tr><th>№</th><th>Оборудование</th><th>Сер. Зав. Ном.<br>Номер</th><th>Статус</th></tr>";
        foreach ($res as $val){
            echo "<tr><td>".$i++."</td><td>{$val['equipment']}</td><td>{$val['series']}</td><td>".getStatus(intval($val['status']))."</td></tr>";
        }
        echo "<tr><td colspan='4'></td>";
        echo "<tr><td class='ext'>Принял:</td><td colspan='3'>____________/________________________<br><sup><sub>         (Подпись)                     (ФИО)</sub></sup></td></tr>";
        echo "<tr><td class='ext'>Сдал:</td><td colspan='3'>____________/________________________<br><sup><sub>         (Подпись)                     (ФИО)</sub></sup></td></tr>";
        echo "<tr><td class='ext'>Дата: </td><td colspan='3'>___\"____________\"20__г.</td></tr>";
        echo "</table>";
        exit;
    }

	$filename = "report.xlsx";
	header('Content-disposition: attachment; filename="'.XLSXWriter::sanitize_filename($filename).'"');
	header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	header('Content-Transfer-Encoding: binary');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	
	$writer = new XLSXWriter();
	$sheet_options = array('autofilter'=>true,'freeze_pane' => array(1, 11));
	$styles = array('halign'=>'left');
    $isRole = intval($role) > 1;
    if($isRole)
        $writer->writeSheetHeader('Отчет', array('ID номер' => 'string', 'Оборудование' => 'string', 'Тип' => 'string', 'Cтатус' => 'string', 'Заказчик' => 'string', 'Произвел ремонт' => 'string', 'Примечание' => 'string', 'Заявка от' => 'date', 'Выданно' => 'date'), array(), $sheet_options);//optional
    else
        $writer->writeSheetHeader('Отчет', array('ID номер' => 'string', 'Оборудование' => 'string', 'Тип' => 'string', 'Cтатус' => 'string', 'Заказчик' => 'string','Выданно' => 'date'), array(), $sheet_options);//optional

    foreach ($res as $val) {
        $row[] = $val['series'];
        $row[] = $val['equipment'];
        $row[] = $val['type_equipment'];
        $row[] = getStatus(intval($val['status']));
        $row[] = $val['attachment_name'];
        if($isRole) {
            $row[] = $val['got'];
            $row[] = $val['note'];
            $row[] = formatToEx($val['receipt']);
        }
        $row[] = formatToEx($val['issued']);
        $writer->writeSheetRow('Отчет', $row, $styles);
        unset($row);
    }
    $writer->writeToStdOut();
    exit;
?>