<?
	require_once __DIR__ . '/Classes/PHPExcel.php';
	require_once __DIR__ . '/Classes/PHPExcel/Writer/Excel2007.php';
	require_once __DIR__ . '/Classes/PHPExcel/IOFactory.php';	
	
	/**
		* Вспомогательный класс экспорта, 
		*для обобщения функций используемых для работы с эксель
	*/
	class ExcelExport {
		
		/**
		 	* Объект эксель
		 */
		private static $xls;
		
		/**
		 	* Лист эксель
		 */
		private static $sheet;

		/**
			* Наименование шаблона
		*/
		private static $nameTemplate;
		
		/**
		 	* Чтение шаблона Эксель
			* @param string $nameTemplate название шаблона
		*/
		public static function ReadTemplate($nameTemplate){
			self::$xls = PHPExcel_IOFactory::load(__DIR__ . '/templates/'.$nameTemplate.'.xlsx');
			ExcelExport::ChoiseSheet(null);
			self::$nameTemplate = $nameTemplate;
		}
		
		/** 
			* Выбор активного листа
			* @param int|null $index - номер листа, если null то текущий активный лист
		*/
		public static function ChoiseSheet($index){
			if($index == null){
				self::$sheet = self::$xls->getActiveSheet();
			}
		}

		/**
		 * Установить границы для таблицы
		 * @param string $range - диапазон строкой
		 */
		public static function SetTables($range){
			$border = array(
				'borders'=>array(
					'allborders' => array(
						'style' => PHPExcel_Style_Border::BORDER_THIN,
						'color' => array('rgb' => '000000')
					)
				)
			);
			 
			self::$sheet->getStyle($range)->applyFromArray($border);
		}
		
		/**
			* Установка значения в ячейку
			* @param int $row индекс строки
			* @param int $col индекс колонки
			* @param mixed $val - значение
		*/
		public static function SetCellValue($row, $col, $val){
			$cell = self::$sheet->getCellByColumnAndRow($col,$row);
			$cell->setValue($val);
		}
		
		/**
			* Установка значения в ячейку типа даты
			* @param int $row индекс строки
			* @param int $col индекс колонки
			* @param mixed $val - значение
		*/
		public static function SetCellValueDate($row, $col, $val){
			$val = PHPExcel_Shared_Date::PHPToExcel($val);
			$cell = self::$sheet->getCellByColumnAndRow($col,$row);
			$cell->setValue($val);
			
			self::$sheet->getStyleByColumnAndRow($col,$row)->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_DATE_YYYYMMDD2);
		}
		
		/**
		 	* Вернуть значение из ячейки
			* @param int $row индекс строки
			* @param int $col индекс колонки
		*/
		public static function GetCellValue($row,$col){
			$cell = self::$sheet->getCellByColumnAndRow($col,$row);
			return $cell->getValue();
		}
		
		/**
			* Отдача на скачивание пользователю
		*/
		public static function Save(){
			header("Expires: Mon, 1 Apr 1974 05:00:00 GMT");
			header("Last-Modified: " . gmdate("D,d M YH:i:s") . " GMT");
			header("Cache-Control: no-cache, must-revalidate");
			header("Pragma: no-cache");
			header("Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			header("Content-Disposition: attachment; filename=".self::$nameTemplate.".xlsx");
			 
			$objWriter = new PHPExcel_Writer_Excel2007(self::$xls);
			$objWriter->save('php://output'); 
			exit();
		}
	}
?>