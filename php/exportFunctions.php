<?

require_once 'config.php';
require_once 'func.php';
require_once "excel/PHPExport.php";
require_once 'excel/XLSXWriter.php';
date_default_timezone_set('Etc/GMT-3');

/**
 * Обобщенный класс функций экспорта
 */
class ExportFunctions {
    private $get;

    /**
     * Конструктор класса
     * @param $get запрос
     */
    function __construct($get){
        $this->get = $get;
    }

    /**
     * Статистика
     */
    public function ExportStats()
    {
        PHPExport::ReadTemplate("stats");
        $res = getTable($this->get,$count);
        $res = getTable($this->get,$count,0,$count["count"]);
        
        $row = 3;
        $col = 0;

        foreach($res as $val){
            $receiving = formatToEx2($val['receiving']);
            $repairs = formatToEx2($val['repairs']);
            
            if($receiving != null) PHPExport::SetCellValueDate($row,$col,$receiving);	
            if($repairs != null) PHPExport::SetCellValueDate($row, $col+1,$repairs);
            PHPExport::SetCellValue($row,$col+2, $val['attachment_name']);
            PHPExport::SetCellValue($row,$col+3, $val['equipment']);
            PHPExport::SetCellValue($row,$col+4, $val['series']);
            PHPExport::SetCellValue($row,$col+5, $val['cause']);
            PHPExport::SetCellValue($row,$col+6, $val['got']);
            PHPExport::SetCellValue($row,$col+7, $val['note']);
            
            $row++;
        }

        $range = "A3:W".($row-1);
        PHPExport::SetTables($range);
        
        PHPExport::Save();
    }

    /**
     * Акт
     */
    public function ExportAct(){
        PHPExport::ReadTemplate("act");
        $res = getTable($this->get,$count,0,1);
        $val = $res[0];
        $type_equipment = $val["type_equipment"];
        $equipment = $val["equipment"];
        $series = $val["series"];
        $attachment_name = $val["attachment_name"];
        $cause = $val["cause"];

        $name = $type_equipment.": ".$equipment." S/N: ".$series." ".$attachment_name;
        $col = 1;
        $row = 4;

        PHPExport::SetCellValue($row,$col,$name);

        $row = 23;
        $col = 4;
        PHPExport::SetCellValue($row,$col,$cause);

        PHPExport::Save();
    }


    public function ExportReport($role){
        $res = getTable($this->get,$count);
        $res = getTable($this->get,$count,0,$count["count"]);
        
        $filename = "report.xlsx";
        header('Content-disposition: attachment; filename="'.XLSXWriter::sanitize_filename($filename).'"');
        header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        header('Content-Transfer-Encoding: binary');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
	
        $writer = new XLSXWriter();
        $sheet_options = array('autofilter'=>true,'freeze_pane' => array(1, 13));
        $styles = array('halign'=>'left');
        $isRole = intval($role) > 1;
        if($isRole)
            $writer->writeSheetHeader('Отчет', array(
            'ID номер' => 'string', 
            'Оборудование' => 'string', 
            'Тип' => 'string', 
            'Cтатус' => 'string', 
            'Исполнитель'=>'string',
            'Заказчик' => 'string',
            'Произвел ремонт' => 'string', 
            'Примечание' => 'string', 
            'Ремонт'=>'date',
            'Заявка от' => 'date',
            'Дата приема'=>'date',
            'Выданно' => 'date'), array(), $sheet_options);//optional
        else
            $writer->writeSheetHeader('Отчет', array('ID номер' => 'string', 'Оборудование' => 'string', 'Тип' => 'string', 'Cтатус' => 'string','Исполнитель'=>'string','Заказчик' => 'string','Заявка от' => 'date','Дата приема' => 'date','Выданно' => 'date'), array(), $sheet_options);//optional

        foreach ($res as $val) {
            $row[] = $val['series'];
            $row[] = $val['equipment'];
            $row[] = $val['type_equipment'];
            $row[] = $val['status'];
            $row[] = $val['group_name'];
            $row[] = $val['attachment_name'];
            if($isRole) {
                $row[] = $val['got'];
                $row[] = $val['note'];
                $row[] = formatToEx($val['repairs']);
            }
		
            $row[] = formatToEx($val['receipt']);
            $row[] = formatToEx($val['receiving']);
            $row[] = formatToEx($val['issued']);
            $writer->writeSheetRow('Отчет', $row, $styles);
            unset($row);
        }
        $writer->writeToStdOut();
    }

    public function ExportPrint(){
        $res = getTable($this->get,$count);
        $res = getTable($this->get,$count,0,$count["count"]);

        $i = 1;
        echo "
            <style>table {
                           border-collapse: collapse;
                           width: 100%;
                           font-size: 1.0em;
                    }
					
					tr:first-child {
						text-align: center
					}
					
					.num {
						text-align: center;
						width: 1px
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
						vertical-align: text-bottom;
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
        echo "<table border='1'><caption>Акт приема передачи оборудования</caption><col width='10px'><tr><th class='num'>№</th><th>Оборудование</th><th>Сер. Зав. Ном.<br>Номер</th><th>Статус</th></tr>";
        foreach ($res as $val){
            echo "<tr><td class='num'>".$i++."</td><td>{$val['equipment']}</td><td>{$val['series']}</td><td>".$val['status']."</td></tr>";
        }
        echo "<tr><td colspan='4'></td>";
        echo "<tr><td class='ext'>Принял:</td><td colspan='3'>____________/________________________<br><sup><sub>         (Подпись)                     (ФИО)</sub></sup></td></tr>";
        echo "<tr><td class='ext'>Сдал:</td><td colspan='3'>____________/________________________<br><sup><sub>         (Подпись)                     (ФИО)</sub></sup></td></tr>";
        echo "<tr><td class='ext'>Дата: </td><td colspan='3'>___\"____________\" 20__г.</td></tr>";
        echo "</table>";
        exit;
    }
}
?>
