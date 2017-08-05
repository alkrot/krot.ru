<?	
	session_start();
	require_once 'safemysql.class.php';
	$opts = array(
		'user'    => 'root',
		'pass'    => '',
		'db'      => 'journal',
		'charset' => 'utf8'
	);
	
	$db = new SafeMySQL($opts); // with some of the default settings overwritten
?>
