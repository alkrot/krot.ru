/*document.getElementsByName('group')[0].oninput = function(e){
	var data = ajax('list.php','type=g&q='+this.value);
	clearChildren('groups');
	var groups = document.getElementById('groups');
	for(var i = 0, l = data.length; i < l; i++){
		var el = document.createElement('option');
		el.innerText = data[i]['name'];
		groups.appendChild(el);
	}
};

document.getElementsByName('equipment')[0].oninput = function(e){
	var group = document.getElementsByName('group')[0].value;
	var data = ajax('list.php','type=e&g='+group+'&q='+this.value);
	console.log(data);
}*/

document.getElementById('autch').onclick = function(e){
	var formA = document.getElementsByClassName('autchForm')[0];
	if(formA.style.opacity < 1){
		formA.style.opacity = 1;
	}else{
		formA.style.opacity = 0;
	}
}