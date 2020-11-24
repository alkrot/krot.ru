<?php
    require 'vendor/autoload.php';

    /**
     * Класс дя вспомогательных обобщенных функций ворд
     */
    class WordExport {

        /**
         * Объект ворд
         */
        private static $word;

        /**
         * Наименование шаблона
         */
        private static $nameTemplate;

        /**
         * Чтение шаблона Ворд
         * @param string $nameTemplate название шаблона
         */
        public static function ReadTemplate($nameTemplate){
            self::$word = new \PhpOffice\PhpWord\Template(__DIR__.'/templates/'.$nameTemplate.'.docx');
            self::$nameTemplate = $nameTemplate;
        }

        /**
         * Функция замены макропеременных
         * @* @param array $arraNameValue массив где ключ искомое слова значение замена
         */
        public static function FindReplace($arraNameValue){
            self::$word->setValues($arraNameValue);
        }

        /**
         * Отдача на скачивание пользователю
         */
        public static function Save(){
            header( "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessing‌​ml.document" );// you should look for the real header that you need if it's not Word 2007!!!
            header( 'Content-Disposition: attachment; filename='.self::$nameTemplate.".docx");
            self::$word->saveAs("php://output");
        }
    }
?>