function getPermission(){
	if(getBrowser().browser == "ie") return false;
	try{
		switch (Notification.permission.toLowerCase() ) {
			case "granted":
				return true;
				break;
			case "denied":
				return false;
				break;

			case "default":
				var permission,
				 timer = setTimeout( function() { permission = "default" }, 500 );
				Notification.requestPermission( function(state){ clearTimeout(timer); permission = state } );
				return permission.toLowerCase() == "granted";
		}
	}catch(err){
		console.log(err);
	}
}
	
function sendNotify(group){
	var notify = new Notification(group,{
		tag: "equipments",
		body: "Поступило новое оборудование",
		icon: "image/icon.ico"
	});
}

function sendIe(group){
	var left = screen.width - 50;
	var top = screen.height - 50;
	var newWin = window.open("about:blank","notify","width=200,height=200,left={0},top={1},location=no,menubar=no,status=no".format(left,top));
	newWin.document.write("<title>Уведомление</title>" + group +"<br> Поступило новое оборудование");
}

function soundPlay(){
	var audio = new Audio();
	audio.src = "sound/rington.mp3";
	audio.play();
}

function Push(group){
	if(getPermission()){
		sendNotify(group);
	}else{
		sendIe(group);
	}
	if(localStorage.soundPush != 0)
		soundPlay();
	if(localStorage.requestStatus == 1)
		next();
}