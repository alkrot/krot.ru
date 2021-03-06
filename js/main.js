//get запрос
function ajax(script,params){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/php/'+script+'?' + params, false);
	xhr.send();
	if(xhr.status != 200){
		alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
		return;
	} else {
		try{
			return response = JSON.parse(xhr.responseText);
		}catch(err){
			console.log(err);
			console.log(xhr.responseText);
		}
	}
};

//post запрос
function ajax_p(script,params,callback){
	var xhr = new XMLHttpRequest();
	xhr.open('POST','/php/'+script,true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				try {
					if(xhr.responseText) callback(JSON.parse(xhr.responseText));
				}catch (err){
					console.log(err);
					console.log(xhr.responseText);
				}
			}
		}
	}
	xhr.send(params);
}

//Авторизация
function authentication(){
	var login = document.getElementsByName('login')[0].value;
	var pass = document.getElementsByName('pass')[0].value;
	if(login && pass){
		var data = ajax('autch.php','login='+login+'&pass='+pass);
		if(!data['error']){
			location.href = 'http://' + location.hostname + '/profile.html';
		}else{
			alert(data['error']);
		}
	}else{
		alert('Заполните все поля логина и пароля');
	}
}

//Очистка datalist
function clearChildren(parent_id){
	var childArray = document.getElementById(parent_id).children;
	if (childArray.length > 0) {
		document.getElementById(parent_id).removeChild(childArray[0]);
		clearChildren(parent_id);
	}
};
//Отправка формы
function send(iForm){
	var params = buildQueryString(formToObj(iForm));
	console.log(params);
	ajax_p('script.php',params,function(data){
		if(data.messages){
			alertJQ(data.messages);
			if(params.indexOf("type=update") > 0){
				iForm.style.opacity = '0';
				iForm.style.zIndex = '-1000';
			}
			iForm.reset();
		}else {
            alertJQ(data.error);
        }
	});
	return false;
}
//Сообщение о проделенной операции
function alertJQ(messages) {
    $("#message").html(messages);
	$("#message").fadeIn(1000);
	$("#message").fadeOut(2000);
}

/*Функция вывода автосписка*/
function getList(el){
	var val = (el.id == "vgroup" || el.id == "wgroup") ? el.value.split(/[\s,]+/) : el.value;

	params = 'name=' + el.name + '&val=' + ((typeof val == "object") ? val[val.length - 1] : val);
	var list_id = el.getAttribute('list');
	if(el.list == null){
		if(!list_id) return false;
		el.list = document.getElementById(list_id);
	}

	if(getBrowser().browser != "ie")
		clearChildren(el.list.id);
	else
		clearChildren(list_id);

	ajax_p('list.php',params,function(data){
		for(var obj in data){
			el.list.innerHTML += '<option value="{0}" uid="{1}">{0}'.format((el.id == 'contact') ? data[obj].name.replace(/[^а-яё\s\.]/gi,'') : data[obj].name,data[obj].id);
		}
		if(el.name.indexOf('group') >= 0){
            localStorage.send_group_id = data[0].id;
		}
	});
	
}

function getGroup(el) {
	ajax_p('list.php','name=group&val=',function (data) {
		for(var obj in data){
			el.innerHTML += data[obj].name +"<br>";
		}
    })
}

function clickList(el){
	var val = el.value;
	localStorage.send_group_id = val;
}

//Подстановка значений из базы по номеру
function atc(e){
	var params = 'type=show&series=' + e.value;
	ajax_p('script.php',params,function(data){
		if(data.count > 0 && data.items){
			console.log(data);
			document.getElementById('group').value = data.items[0].group_id;
			document.getElementById('equipment').value = data.items[0].equipment_id;
			document.getElementById('type_equipment').value = data.items[0].tEquipmentId;
			document.getElementById('attachment').value = data.items[0].attachment_id;
			document.getElementById('cause').value = data.items[0].cause;
			document.getElementById('contact').value = data.items[0].contact;
			localStorage.send_group_id = data.items[0].group_id;
		}
	});
}

//
// Создает объект содержащий successful-controls указанной формы.
//
function formToObj(form) {
	var els = form ? form.elements : '', map = {}, el, i = 0;
	while ( el = els[i++] )
		if ( el.name != '' && !el.disabled )    // Элементы без имени и disabled не successful-controls
			switch ( el.type.toLowerCase() ) {
			case 'checkbox':
			case 'radio':                       // Только выбранные (checked) checkbox'ы и
				if ( el.checked )               // radio-элементы считаются successful-controls
					map[el.name] = el.value;
				break;
			case 'select-multiple':
				var opt = el.options, lst = [], j = 0, o;
				while ( o = opt[j++] )
					if ( o.selected )                         // Только выбранные (selected) опции (options)
						lst[lst.length] = o.value || o.text;  // считаются successful-controls
				if ( lst.length )                             // Добавляем масссив значений опции если он не пустой
					map[el.name] = lst;
				break;
			case 'select-one':                                // select-one добавляем скаляром (не в масссив)
				if(!el.value) break;
			default:
				map[el.name] = el.value;
			case 'reset':                                     // reset не отправляется даже если имеет name
				break;
			};
	return map;
}
function buildQueryString(map, amp) {
	// требуется заплатка для движков без forEach (MSIE)
	var url = [], k, v;
	for (k in map) {
		v = map[k];
		( v instanceof Array ? v : [v] ).forEach(
			function(e){ url.push(encodeURIComponent(k) + '=' + encodeURIComponent(e)) }
		)
	}
	return url.join(amp || '&');
}

function addOption (oListbox, text, value, isDefaultSelected, isSelected)
{
		var oOption = document.createElement("option");
		oOption.appendChild(document.createTextNode(text));
		oOption.setAttribute("value", value);
		if (isDefaultSelected) oOption.defaultSelected = true;
		else if (isSelected) oOption.selected = true;
		oListbox.appendChild(oOption);
}

function getListSelect(name,el){
	ajax_p('list.php','name=' + name,function(data){
		var list = document.getElementsByName(el);
		for(var item in data){
			var i = 0;
			for(var t in list){
				addOption(list[i],data[item].name,data[item].id);
				if(list.length == ++i) break;
			}
		}
	});
}