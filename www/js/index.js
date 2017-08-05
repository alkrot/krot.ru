document.getElementById('autch').onclick = function(e){
	var formA = document.getElementsByClassName('autchForm')[0];
	if(formA.style.opacity < 1){
		formA.style.opacity = 1;
	}else{
		formA.style.opacity = 0;
	}
}