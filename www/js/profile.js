//Создание формы добавление или изменения заявки
function createFrom(){
	var allShow = document.getElementById('filter').cloneNode(true);
	allShow.id = 'allShowDiv';
	var mass = allShow.querySelectorAll('select,input[type="date"],label,img[id="btnPrint"]');
	for(var ch in mass ){
		if( typeof mass[ch] == 'object' && mass[ch].id != "status") allShow.removeChild(mass[ch]);
		else if(mass[ch].id == "status"){
			mass[ch].removeChild(mass[ch].options[1]);
		}
	}
	var inp = allShow.querySelector("input[name='series']");
	inp.id = 'series';
	inp.title = 'ID номер';
	inp.required = true;
	inp.setAttribute('onchange','atc(this);');
	allShow.querySelector('input[type="hidden"]').value = 'update';
	var btn = allShow.querySelector('input[type="submit"]');
	btn.value = 'Изменить';
	
	var cls = "<div style='text-align: right;'><input style='display: inline;' type='button' onclick='allShowClose();' value='Закрыть'></div>";
	allShow.innerHTML = cls + allShow.innerHTML;
	var field = [
					//getInp('equipment','lequipment','Оборудование','','','',true),
					getInp('type_equipment','ltype_equipment','Тип','','','',true),
					'Гарантия: ' + getInp('seal','','','checkbox','seal'),
					getText('cause','Причина'),
					getInp('attachment','lattachment','Заказчик','','','',true),
					getInp('address','','Адрес','tel'),
					getText('contact','Контактное лицо'),
					getInp('group','lgroup','Исполнитель','','','disabled',true),
					getInp('got','lgot','Произвел ремонт'),
					getText('note','Примечание'),
					'<br>Дата выдачи:' + getInp('issued','','Дата выдачи','date'),
					getInp('req_id','','','hidden')
				];
	var div2 = document.createElement('div');
	div2.innerHTML = field.join(' ');
	allShow.insertBefore(div2,allShow.children[4]);
	var frm = document.getElementById('allShow');
	frm.insertBefore(allShow,frm.firstChild);
	frm.style.opacity = '0';
}

//Создание поля отдел
function createfield(){
	var filter = document.getElementById('filter');
	var el = document.createElement('input');
	el.setAttribute('type','text');
	el.setAttribute('name','group');
	el.setAttribute('id','group');
	el.setAttribute('list','lgroup');
	el.setAttribute('oninput','getList(this)');
	el.setAttribute('placeholder','Отдел');
	filter.insertBefore(el,filter.firstChild);
}

document.getElementById('name').innerText = localStorage.user_login;

// Экспорт в Excel ctrl+p
document.onkeydown = function(e){
	if(e.ctrlKey && e.keyCode == 80){
		exportToXlsx();
		e.preventDefault();
	}
};

//Экспорт в Excel
function exportToXlsx(){
	var frm = document.getElementById('filterForm');
	var params = buildQueryString(formToObj(frm));
	location.href = 'http://' + location.host + '/php/export.php?' + params;
}

//Добавление значения в доступные группы из подсказчика
document.getElementById('lvgroup').onclick = function(e){
	var grp = this.options[this.selectedIndex].value;
	var txt = document.getElementById('vgroup');
	var res = txt.value.split(',');
	res[res.length - 1] = grp;
	txt.value = res.join(',');
}

//Создание интерфейса исходя из прав доступа
if(localStorage.user_role == 1){
	createfield();
}

if(localStorage.user_role > 1){
	createFrom();
}

if(localStorage.user_role > 2){
	var el = document.createElement('input');
	el.setAttribute('type','button');
	el.setAttribute('onclick','showForm(false,"add");');
	el.setAttribute('value','Создать заявку');
	document.getElementById('btnControl').appendChild(el);
}

if(localStorage.user_role > 3){
	createfield();
	el = document.createElement('input');
	el.setAttribute('type','button');
	el.setAttribute('onclick',"showRegForm('regform');");
	el.setAttribute('value','Регестрация пользователя');
	
	var frm = document.getElementById("regform").cloneNode();
	frm.id = 'user_list';
	frm.innerHTML = "<div id='users'></div><div class='btnControl'>{0}".format(getLinkBtn('Еще',"showList('users','users')"));
	
	var content = document.getElementsByClassName('content')[0];
	content.insertBefore(frm,content.firstChild);
	
	var frm2 = frm.cloneNode(true);
	frm2.id = 'group_list';
	frm2.querySelector("[id='users']").id = 'gil';
	frm2.querySelector("input[type='button']").setAttribute('onclick',"showList('gil','group')");
	content.insertBefore(frm2, content.children[1]);
	
	var input = document.createElement('input');
	input.id = 'add_group';
	input.setAttribute('type','text');
	input.setAttribute('placeholder','Добавить по enter');
	input.onkeydown = addLisGA;
	frm2.appendChild(input);
	
	var frm3 = frm2.cloneNode(true);
	frm3.id = 'attachment_list';
	frm3.querySelector("[id='gil']").id = 'ail';
	frm3.querySelector("input[type='button']").setAttribute('onclick',"showList('ail','attachment')");
	frm3.querySelector("input[type=text]").id = "add_attachment";
	frm3.querySelector("input[type=text]").onkeydown = addLisGA;
	content.insertBefore(frm3,content.children[2]);
	
	
	document.getElementById('btnControl').appendChild(el);
	cloneBtn(el,"Список пользователей","showRegForm('user_list','users');");
	cloneBtn(el,"Исполнители","showRegForm('group_list','group');");
	cloneBtn(el,"Заказчики","showRegForm('attachment_list','attachment');");
}

//Копирование кнопки и изменене значения и добавление в верхнюю панель
function cloneBtn(el,val,func){
	var el_clone = el.cloneNode(true);
	el_clone.value = val;
	el_clone.setAttribute('onclick',func);
	document.getElementById('btnControl').appendChild(el_clone);
 }

//Закрытие формы изменения или добавление заявки
function allShowClose(){
	document.getElementById('allShow').style.opacity = '0';
	document.getElementById('allShow').style.zIndex = '-1000';
	document.getElementById('allShow').reset();
}

//Открытие формы изменения или добавление заявки
function showForm(el,type){
	if(type == 'look'){
		var el_look_id = el.parentNode.id;
		var params = 'type=show&id='+el_look_id;
		ajax_p('script.php',params,function(data){
			if(data.items && data.count > 0){
				document.getElementById('series').value = data.items[0].series;
				document.getElementById('equipment').value = data.items[0].equipment;
				document.getElementById('type_equipment').value = data.items[0].type_equipment;
				document.getElementById('seal').checked = data.items[0].seal == 1 ? true : false;
				document.getElementById('cause').value = data.items[0].cause;
				document.getElementById('attachment').value = data.items[0].attachment_name;
				document.getElementById('address').value = data.items[0].address;
				document.getElementById('contact').value = data.items[0].contact;
				document.getElementById('got').value = data.items[0].got;
				document.getElementById('note').value = data.items[0].note;
				document.getElementById('status').value = data.items[0].status;
				document.getElementById('group').value = data.items[0].group_name;
				document.getElementById('req_id').value = el_look_id;
				document.getElementById('issued').value = data.items[0].issued.split(' ')[0];
			}
		});
		replceForm('Изменить','update');
	}
	
	if(type == 'add'){
		replceForm('Добавить',type);
		document.getElementById('status').value = 1;
	}
	
	document.getElementById('allShow').style.opacity = '1';
	document.getElementById('allShow').style.zIndex = '1000';
}

//Измение типа формы изменения или добавление заявки
function replceForm(btn,type,off){
	document.getElementById("allShow").querySelector("input[type='submit']").value = btn;
	document.getElementById("allShow").querySelector("input[name='type']").value = type;
	if(+localStorage.user_role === 4) document.getElementById('group').disabled = false;
}

//Формирование input элементов для формы изменения или добавление заявки
function getText(name,plc){
	return "<textarea name='{0}' id='{0}' cols='22' rows='3' placeholder='{1}' title='{1}'></textarea>".format(name,plc);
}

//Формирование input элементов для формы изменения или добавление заявки
function getInp(name,list,plc,type,val,off,required){
	return "<input type='{3}' name = '{0}' id='{0}' list='{1}' placeholder='{2}' title='{2}' value='{4}' oninput='getList(this);' {5} {6}>".format(name,list,plc,type ? type : 'text',val ? val : '',off ? off : '',required ? 'required' : '');
}

//выбор показа списка куда выводить инофрмацию, пользователи, отделы или принадлежность
function showRegForm(idDiv,type){
	var frm = document.getElementById(idDiv);
	
	if(frm.style.display == 'none' || !frm.style.display){
			switch(idDiv){
				case 'user_list':
					showList('users',type,true);
				break;
				case 'group_list':
					showList('gil',type,true);
				break;
				case 'attachment_list':
					showList('ail',type,true);
				break;
			}
		frm.style.display = 'block';
	}else{
		frm.style.display = 'none';
	}
}

//Показ списка в зависимости от входящего типа
function showList(listid,type,update){
	var frm = document.getElementById(listid);
	var offset = frm.querySelectorAll('div').length;
	if(update){
		frm.innerHTML = '';
		offset = 0;
	}
	var isGA = (type == 'group' || type == 'attachment');
	var del = (!isGA ? 'delete_' : 'update_') + type;
	type = 'show_' + type;
	var txt = isGA ? 'Изменить' : 'Удалить';
	ajax_p('script.php','type='+type+'&offset='+offset,function(data){
		if(data && data.length > 0){
			for(var i in data){
				var div = document.createElement('div');
				div.id = data[i].id;
				div.innerHTML = ((data[i].login) ? data[i].login : data[i].name) + getLinkBtn(txt,'del(this,"'+listid+'","'+del+'")');
				frm.appendChild(div);
			}
			frm.scrollTop = frm.scrollHeight;
		}else {
			alert('больше нет');
		}
	});
	
}

//Показ следующих заявок
function next(){
	var frm = document.getElementById('filterForm');
	var count = document.getElementById('data').querySelectorAll('div').length;
	show(frm,count);
}

//Показ заявок
function show(iForm,offset){
	var params = buildQueryString(formToObj(iForm));
	var table =  document.getElementById('data');
	
	if(+offset > 0){
		params = params + '&offset=' + offset;
	}
	
	if(localStorage.user_role == 1 && localStorage.user_access_group.indexOf(iForm.elements.group.value) === -1){
		alert("Эту группу вы не можете просматривать!");
		return false;
	}
	
	ajax_p('script.php',params,function(data){
		
		if(data.items.length > 0 && data.count > 0){
			if(!offset) table.innerHTML = '';
			document.getElementById('allCount').innerText = data.count;
			
			for(var obj in data.items){
				var items = data.items[obj];
				var req = document.createElement('div');
				req.id = items.id;
				if(data.items[obj].status == 1){
					var day = Math.ceil((+new Date() - +new Date(items.receipt)) / (1000 * 3600 * 24));
					req.style.background = (day >= 35 && day < 45) ? 'rgba(249, 255, 11, 0.21)' : (day >= 45) ? 'rgba(255, 11, 11, 0.21)': '';
				}
				req.className = 'form list';
				req.innerHTML = '<strong>ID номер:</strong> {0}<br><strong>Оборудование:</strong> {1}<br><strong>Тип:</strong> {2}<br><strong>Статус: </strong> {3}<br><strong>От кого:</strong> {4}<br><strong>Произвел ремонт:</strong> {10}<br><strong>Примечание:</strong> {5}<br><sup><strong>Заявка от:</strong> {6} <strong>Начала ремонта:</strong> {7} <strong>Конец ремонта:</strong> {8} <strong>Выданно:</strong> {9} </sup><br>'
								.format(items.series,
										items.equipment,
										items.type_equipment,
										getStatus(items.status),
										(items.attachment_name) ? items.attachment_name : 'Неизвестно',
										items.note,
										items.receipt,
										items.start_repair,
										items.end_repair,
										items.issued,
										items.got
									);

				if(localStorage.user_role > 1) req.innerHTML += getLinkBtn('посмотреть','showForm(this,"look")');
				if(localStorage.user_role == 4) req.innerHTML += getLinkBtn('удалить','del(this)');
				table.appendChild(req);
			}
			
			document.getElementById('nameGroup').innerText = (localStorage.user_role == 4 && document.getElementsByName('group')[2].value.length == 0) ? 'Все' : data.items[0].group_name;
			
			if((document.getElementById('next').style.display = 'none' || !document.getElementById('next').style.display) && data.count > 5){
				document.getElementById('next').style.display = 'inline';
			}
			document.getElementById('showCount').innerText = document.getElementById('data').querySelectorAll('div').length;
			if(offset > 0) table.scrollTop = table.scrollHeight;
		}else{
			alertJQ("Показать нечего");
		}
	});
}

//Показа элемента с помощью прозрачности, но похоже негде не используется
function opacity(element, speed){
    setInterval(function(){
		if(+element.style.opacity < 1) element.style.opacity = +element.style.opacity + 0.5;
    }, speed)
}

//По умолчанию для удаления, возможно использовать для изменения
function del(el,content,type){
	content = (content) ? content : 'data';
	type = (type) ? type : 'delete';
	var val = null;
	if(type.indexOf('update_') >= 0){
		val = prompt('Введите новое название',el.parentNode.innerText.trim());
		if(val == null) return;
	}
	var del_id_el = el.parentNode.id;
	var div = document.getElementById(del_id_el);
	var params = 'id=' + del_id_el + '&type='+type +'&name=' + val;
	ajax_p('script.php',params,function(data){
		if(data.messages){
			if(val == null) document.getElementById(content).removeChild(div);
			else el.parentNode.innerHTML = el.parentNode.innerHTML.replace(el.parentNode.innerText,val);
			alert(data.messages);
		}else{
			alert("фиг знает");
		}
	});
}
//Измененая кнопка, для разныйфункций
function getLinkBtn(txt, func){
	return " <input type='button' onclick="+func+"; value='" + txt + "'>";
}

//Вывод статуса в текстовый вид
function getStatus(stat){
	switch(Number(stat)){
		case 1:
			return 'На расмотрении';
		break;
		case 2:
			return 'В ремонте';
		break;
		case 3:
			return 'Отремонтировано';
		break;
		case  4:
			return 'Проверено';
		break;
		case 5:
			return 'Настроено';
		break;
		case -1:
			return 'Отказанно';
		break;
		default:
			return 'Неизвестно';
		break;
	}
}

//Добавление Отдела или группы
function addLisGA(e){
	if(e.keyCode == 13){
		var params = "type=" + this.id + "&name=" + this.value;
		ajax_p('script.php',params,function(data){
			if(data.messages){
				alert(data.messages);
			}else alert(data.error);
		});
	}
}