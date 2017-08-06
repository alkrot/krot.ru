<?
	require_once 'config.php';
	require_once 'func.php';
	header('Content-Type: text/html; charset=utf-8', true);
	$get = $_POST;
	switch(true){
		case ($get['name'] == 'group' || $get['name'] == 'vgroup'):
			echo getList('name','group',$get['val']);
		break;
		case ($get['name'] == 'attachment'):
			echo getList('name',$get['name'],$get['val']);
		break;
		case ($get['name'] == 'series'):
			echo getList('series','list',$get['val']);
		break;
		case ($get['name'] == 'equipment'):
			echo getList('equipment','list',$get['val']);
		break;
		case ($get['name'] == 'type_equipment'):
			echo getList('type_equipment','list',$get['val']);
		break;
        case ($get['name'] == 'cause'):
            echo getList('cause','list',$get['val']);
        break;
        case  ($get['name'] == 'address'):
            echo  getList('address','list',$get['val']);
        break;
        case ($get['name'] == 'contact'):
            echo getList('contact','list',$get['val']);
        break;
	}
?>