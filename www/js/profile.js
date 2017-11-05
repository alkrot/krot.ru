function getListStatus(){
	ajax_p('list.php','name=liststatus',function(data){
		var list = document.getElementsByName('status');
		for(var item in data){
			addOption(list[0],data[item].status,data[item].id);
			if(list.length > 1) addOption(list[1],data[item].status,data[item].id);
		}
	});
}					 
//Создание формы добавление или изменения заявки
function createFrom(){
	var allShow = document.getElementById('filter').cloneNode(true);
	allShow.id = 'allShowDiv';
var mass = allShow.querySelectorAll('select,input[type="date"],label,img[id="btnPrint"],img[id="btnCreate"],input[name="attachment"],input[type="reset"],input[name="contact"],div[id="btnCreate"],div[id="btnPrint"],div[id="btnVolume"]');
	for(var ch in mass ){
		if( typeof mass[ch] == 'object' && mass[ch].id != "status") allShow.removeChild(mass[ch]);
		else if(mass[ch].id == "status"){
			mass[ch].removeChild(mass[ch].options[1]);
		}
	}
	var inp = allShow.querySelector("input[name='series']");
	inp.id = 'series';
	inp.title = 'ID номер (Обязательно)';
	inp.required = true;
	inp.setAttribute('onchange','atc(this);');
	allShow.querySelector('input[type="hidden"]').value = 'update';
	var btn = allShow.querySelector('input[type="submit"]');
	btn.value = 'Изменить';

	allShow.querySelector('input[name="equipment"]').title = 'Оборудование (Обязательно)';
	if(localStorage.user_role < 3) allShow.querySelector('select[name=status]').setAttribute('disabled',true);																	 
	
	var cls = "<div style='text-align: right;'><input style='display: inline;' type='button' onclick='allShowClose(\"allShow\");' value='Закрыть'></div>";
	allShow.innerHTML = cls + allShow.innerHTML;
	var field = [
					getInp('type_equipment','ltype_equipment','Тип','','','',true),
					'Гарантия: ' + getInp('seal','','','checkbox','seal'),
					getText('cause','Причина'),
					getInp('attachment','lattachment','Заказчик','','','',true),
					getInp('address','laddress','Адрес (Только для таксафонов и ПКД)','tel'),
					getText('contact','Контактное лицо, номер телефона'),
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
	el.setAttribute('onmouseenter','getList(this)');
	el.setAttribute('placeholder','Исполнитель');
	filter.insertBefore(el,filter.firstChild);
}

document.getElementById('name').innerText = localStorage.user_login;


document.getElementById('btnVolume').onclick = function(e){
	if(localStorage.soundPush == 1){
		localStorage.soundPush = 0;
		this.className = "volume_off";
		this.setAttribute('title',"Звук уведомления выключен");
	}else{
		localStorage.soundPush = 1;
		this.className = "volume_on";
		this.setAttribute('title','Звук уведомления включен');
	}
};

document.getElementById('status').onchange = function(e){
	localStorage.requestStatus = this.value;
};

// Экспорт в Excel ctrl+p
document.onkeydown = function(e){
	if(e.ctrlKey && e.keyCode == 80){
		exportToXlsx();
        e.preventDefault();
	}
};

//Экспорт в Excel
function exportToXlsx(ext){
	var frm = document.getElementById('filterForm');
	var params = buildQueryString(formToObj(frm));
	window.open('http://' + location.host + '/php/export.php?' + params + ((ext) ? ("&" +ext) : ''),"Экспорт");
}

function printForm() {
    exportToXlsx("type=print");
}

//Добавление значения в доступные группы из подсказчика
document.getElementById('lvgroup').onclick = function (e) {
	addGroup(this,'vgroup');
}

function addGroup(el,id) {
    var grp = el.options[el.selectedIndex].value;
    var txt = document.getElementById(id);
    var res = txt.value.split(',');
    res[res.length - 1] = grp;
    txt.value = res.join(',');
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
//Создание интерфейса исходя из прав доступа
if(localStorage.user_role == 1){
	getListStatus();									  
	createfield();
	document.querySelector("input[type='submit']").style.display = "none";
	document.getElementById("filterForm").onsubmit = function () {
        return false;
    }
    document.getElementById("btnCreate").style.display = "none";
    document.getElementById("info").innerHTML = "Доступные группы:<br>" + localStorage.user_access_group.replace(',','<br>');
}

if(localStorage.user_role > 1){
	getListStatus();												  
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

	var frm_edit = document.getElementById("regform").querySelector("form").cloneNode(true);
	frm_edit.querySelector('button[type="submit"]').innerText = "Сохранить";
	var hide = frm_edit.querySelector('input[type="hidden"]');
	hide.value = "update_users";
	var user_id = hide.cloneNode(true);
	user_id.name = "user_id";
	user_id.value = "";
    frm_edit.insertBefore(user_id,frm_edit.lastChild);
    frm_edit.className = "form hideform updateFormUser";
	var close = document.createElement("div");
	close.style.textAlign = "right";
	close.innerHTML = getLinkBtn("Закрыть","allShowClose('updateFormUser')");
	frm_edit.insertBefore(close,frm_edit.firstChild);
	frm_edit.id = "updateFormUser";
	frm_edit.classList.add("updateFormUser");
	frm_edit.querySelector("textarea[list='lvgroup']").setAttribute("list","lwgroup");
    frm_edit.querySelector("textarea[name='vgroup']").id = "wgroup";
	frm_edit.querySelector("select[id='lvgroup']").id = "lwgroup";
	frm_edit.querySelector("select[id='lwgroup']").onclick = function (e) { addGroup(this,"wgroup");  };

	var frm = document.getElementById("regform").cloneNode();
	frm.id = 'user_list';
	frm.innerHTML = "<div id='users'></div><div class='btnControl'>{0}".format(getLinkBtn('Еще',"showList('users','users')"));
	
	var content = document.getElementsByClassName('content')[0];
	content.insertBefore(frm,content.firstChild);
	content.insertBefore(frm_edit,content.lastChild);
	
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
	cloneBtn(el,"Добавить статус","addStatus();");
}

function addStatus(){
	var status = prompt("Введите статус для добвления","");
	if(status.length > 0){
		ajax_p("script.php","status="+status+"&type=addStatus",function(data){
			alertJQ(data.messages);
			if(data.data.id > 0){
				var list = document.getElementsByName('status');
				addOption(list[0],data.data.status,data.data.id);
				if(list.length > 1) addOption(list[1],data.data.status,data.data.id);
			}
		});
	}
}							   
//Копирование кнопки и изменене значения и добавление в верхнюю панель
function cloneBtn(el,val,func){
	var el_clone = el.cloneNode(true);
	el_clone.value = val;
	el_clone.setAttribute('onclick',func);
	document.getElementById('btnControl').appendChild(el_clone);
 }

//Закрытие формы изменения или добавление заявки
function allShowClose(id){
	document.getElementById(id).style.opacity = '0';
	document.getElementById(id).style.zIndex = '-1000';
	document.getElementById(id).reset();
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
				document.getElementById('status').value = data.items[0].status_id;
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
	return "<input type='{3}' name = '{0}' id='{0}' list='{1}' placeholder='{2}' title='{2} {7}' value='{4}' onmouseenter='getList(this);' {5} {6}>".format(name,list,plc,type ? type : 'text',val ? val : '',off ? off : '',required ? 'required' : '',required ? '(Обязательно)': '');
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
				div.innerHTML = "<span onclick='" + ((type == 'show_users') ? "showUpdateForm(this);' style='cursor: pointer;' title='" + data[i].fullname + "'" :
					"'") + ">" + ((data[i].login) ? data[i].login : data[i].name) + "</span>" + getLinkBtn(txt,'del(this,"'+listid+'","'+del+'")');
				frm.appendChild(div);
			}
			frm.scrollTop = frm.scrollHeight;
		}else {
			alert('больше нет');
		}
	});
	
}

function showUpdateForm(el) {
	var user_id = el.parentNode.id;
	var form = document.getElementById("updateFormUser");
	form.style.display = "block";
	form.style.opacity = 1;
	form.style.zIndex = 5000;
	form.querySelector("input[name='user_id']").value = user_id;
	ajax_p("script.php","type=show_user&id="+user_id,function (data) {

		form.querySelector("input[name='login']").value = data.login;
		form.querySelector("input[name='fullname']").value = data.fullname;
		form.querySelector("input[name='group']").value = data.group;
		form.querySelector("textarea[id='wgroup']").value = (data['access_group']) ? data['access_group'].join(',') : '';
		form.querySelector("input[name='role']").value = data.role;

		form.style.display = "block";
		form.style.opacity = 1;
		form.style.zIndex = 5000;
    });
	return;
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
				req.innerHTML = '<strong>ID номер:</strong> {0}<br><strong>Оборудование:</strong> {1}<br><strong>Тип:</strong> {2}<br><strong>Статус: </strong> {3}<br><strong>От кого:</strong> {4}<br><strong>Произвел ремонт:</strong> {8}<br><strong>Примечание:</strong> {5}<br><sup><strong>Заявка от:</strong> {6} <strong>Выданно:</strong> {7} </sup><br>'
								.format(items.series,
										items.equipment,
										items.type_equipment,
										items.status,
										(items.attachment_name) ? items.attachment_name : 'Неизвестно',
										items.note,
										items.receipt,
										items.issued,
										items.got
									);

				if(localStorage.user_role > 1) req.innerHTML += getLinkBtn('посмотреть','showForm(this,"look")');
				if(localStorage.user_role > 2) req.innerHTML += getLinkBtn('удалить','del(this)');
				table.appendChild(req);
			}
			
			document.getElementById('nameGroup').innerText = (localStorage.user_role == 4 && document.getElementsByName('group')[2].value.length == 0) ? 'Все' : data.items[0].group_name;
			
			if((document.getElementById('next').style.display = 'none' || !document.getElementById('next').style.display) && data.count > 5){
				document.getElementById('next').style.display = 'inline';
			}
			document.getElementById('showCount').innerText = document.getElementById('data').querySelectorAll('div').length;
			if(offset > 0) table.scrollTop = table.scrollHeight;
		}else{
			if(!offset){
				alertJQ("Показать нечего");
				table.innerHTML = '';
			}else {
				alertJQ("Данные полностью показаны");
			}
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
			alertJQ(data.messages);
		}else{
			alert("фиг знает");
		}
	});
}
//Измененая кнопка, для разныйфункций
function getLinkBtn(txt, func){
	return " <input type='button' onclick="+func+"; value='" + txt + "'>";
}

//Добавление Отдела или группы
function addLisGA(e){
	if(e.keyCode == 13){
		var params = "type=" + this.id + "&name=" + this.value;
        document.getElementById(this.id).value = "";
		ajax_p('script.php',params,function(data){
			if(data.messages){
				alert(data.messages);
			}else alert(data.error);
		});
	}
}