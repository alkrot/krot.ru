<?
	require_once 'config.php';
	require_once 'func.php';
	header('Content-Type: text/html; charset=utf-8', true);
	$get = $_POST;
	
	//������ ��� ������� �� ������
	switch(true){
		case ($get['name'] == 'group' || $get['name'] == 'vgroup'):
			echo getList('name','group',$get['val']);
		break;
		case ($get['name'] == 'attachment'):
			echo getListTable($get['name']);
		break;
		case ($get['name'] == 'series'):
			echo getList('series','list',$get['val']);
		break;
		case ($get['name'] == 'mark_equipment'):
			echo getListTable($get['name']);
		break;
		case ($get['name'] == 'type_equipment'):
			echo getListTable($get['name']);
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
		case ($get['name'] == 'got'):
			echo getList('got','list',$get['val']);
		break;
		case ($get['name'] == 'liststatus'):
			echo getListTable($get['name']);
		break;
	}
?>