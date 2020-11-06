<?
	require_once "exportFunctions.php";

	$role = intval($_SESSION['user']['role']);
	$get = $_GET;
	$gid = intval($_SESSION['user']['group_id']);
	if(!$role){
		echo "Нет прав";
		exit;
	}

	$group = getName('group','name',$get['group']);
	if($role == 4 || $role == 1 && $_SESSION['user']['access_group'] && in_array($group,$_SESSION['user']['access_group']) && $group) $get['group'] = $get['group'];
	else $get["group"] = $gid;

	$exFunctions = new ExportFunctions($get);
	switch($_GET['type']){
		case "print":
			$exFunctions->ExportPrint();
		break;
		case "act":
			$exFunctions->ExportAct();
		break;
		case "stats":
			$exFunctions->ExportStats();
		break;
		default:
			$exFunctions->ExportReport($role);
	}
	exit;
?>