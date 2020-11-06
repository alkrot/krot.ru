(function () {

var _lengths = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31];

var now = new Date();
var _year = now.getFullYear();
var _month = now.getMonth();
var _day = now.getDate();

function _mend(val) {
	val = val + "";
	return val.length == 1 ? 0 + val : val;
}

function _default(settings, defaultProps) {
	if (!settings) settings = {};
	for (var i in defaultProps) if ( !(i in settings) ) settings[i] = defaultProps[i];
	return settings;
}

function _checkdate(d, m, y, bottom, top) {
	return new Date(d, m, y) < new Date(bottom) || new Date(d, m, y) > new Date(top);
}

function _setMonth(month, year, scope) {
	var daybox = scope.daybox;

	if (scope.range) {
		var range = scope.range.split(" ");
		var bottom = range[0] + " " + range[1] + " " + range[2];
		var top = range[3] + " " + range[4] + " " + range[5];
	}

	while (daybox.firstChild) daybox.removeChild(daybox.firstChild);

	var length = _lengths[month + 1];
	var prevLength = _lengths[month];
	if (year % 4 == 0 && month == 1) length = 29;
	if (year % 4 == 0 && month == 2) prevLength = 29;

	var first = new Date(year, month, 1).getDay();
	var last = 6 - new Date(year, month, length).getDay();

	if (!Datepicker.languages[scope.language].sundayWeek) {
		if (first == 0) first = 6; else first--;
		if (last == 6) last = 0; else last++;
	}

	for (var i = 0; i < length + first + last; i++) {
		var dayTile = document.createElement("DIV");
		daybox.appendChild(dayTile);
		dayTile.style.cssText =	"float: left; width: 40px; text-align: center;";
		if (i < first) {
			dayTile.innerHTML = scope.hideothermonths ? "&nbsp;" : prevLength - first + i + 1;
			dayTile.style.color = "#cccccc";
		} else if (i > first + length - 1) {
			dayTile.innerHTML = scope.hideothermonths ? "&nbsp;" : i - first - length + 1;
			dayTile.style.color = "#cccccc";
		} else if (scope.range && _checkdate(year, month, i - first + 1, bottom, top)) {
			dayTile.style.color = "#cccccc";
			dayTile.innerHTML = i - first + 1;
		} else {
			dayTile.innerHTML = i - first + 1;
			dayTile.style.cursor = "pointer";
			dayTile.onmouseover = function () { this.style.background = "#eeeeee" };
			dayTile.onmouseout = function () { this.style.background = "#ffffff" };
			dayTile.onmousedown = function () {
				scope.target.value = _format(scope.format, +this.innerHTML, daybox.currentMonth, daybox.currentYear, scope.language);
				scope.onchoose(scope.target.value);
				if (scope.closeonchoose) _remove(scope.wrap, scope.animationhide);
				return false;
			};
			if (_day == i - first + 1 && _month == month && _year == year) dayTile.style.color = "#007fff";
		}
	}

	scope.header.innerHTML = Datepicker.languages[scope.language].monthsFull[month] + " " + year;
}

function _format(format, day, month, year, lng) {
	format = format.replace(/(d|m|y)/gi, "$1$");
	var weekday = new Date(year, month, day).getDay();
	if (!Datepicker.languages[lng].sundayWeek) {
		if (weekday == 0) weekday = 6; else weekday--;
	}
	return format
	.replace("d$d$", _mend(day))
	.replace("d$", day)
	.replace("m$m$", _mend(month + 1))
	.replace("m$", month + 1)
	.replace("y$y$y$y$", year)
	.replace("y$y$", (year + "").substring(2))
	.replace("M$M$", Datepicker.languages[lng].monthsFull[month])
	.replace("M$", Datepicker.languages[lng].monthsShort[month].toUpperCase())
	.replace("D$D$", Datepicker.languages[lng].weekdaysFull[weekday])
	.replace("D$", Datepicker.languages[lng].weekdaysShort[weekday]);
}

function _fx(target, prop, from, to) {
	var px = prop == "opacity" ? "" : "px";
	var start = +new Date();
	fx();
	function fx() {
		var m = (+new Date() - start) / 300;
		if (m > 1) m = 1; else setTimeout(fx, 17);
		target.style[prop] = (from + (to - from) * m) + px;
	}
}

function _pos(target) {
	if (target.getBoundingClientRect) return target.getBoundingClientRect();
	var _target = target, top = 0, left = 0;
	while (target.offsetParent) {
		top += target.offsetTop;
		left += target.offsetLeft;
		target = target.offsetParent;
	}
	return {
		left : left,
		bottom : top + _target.clientHeight + 5
	}
}

function _datepicker(settings) {
	settings = _default(settings, {
		target : document.body,
		language : "EN",
		onchoose : function () {},
		closeonchoose : false,
		hideothermonths : false,
		animationshow : "noneshow",
		animationhide : "nonehide",
		format : "dd/mm/yyyy",
		year : _year,
		month : _month,
		todaybutton : false,
		gotoyear : false,
		popup : true,
		inline : false
	});

	if (settings.inline) settings.popup = false;

	if (settings.range) settings.hideothermonths = true;

	if (settings.animation) {
		settings.animationshow = settings.animation + "show";
		settings.animationhide = settings.animation + "hide";
	}

	var tPos = _pos(settings.target);
	var pos = {
		top : settings.top || tPos.bottom,
		left : settings.left || tPos.left
	};

	var Wrap = document.createElement("DIV");
	document.body.appendChild(Wrap);
	Wrap.style.cssText =	"position: absolute; top: " + pos.top + "px; left: " + pos.left + "px; overflow: hidden; width: 0;" +
				"height: 0; opacity: 0;  z-Index: 1500;";
	Wrap._target = settings.target;
	settings.wrap = Wrap;

	Datepicker.effects[settings.animationshow](Wrap);

	var Box = document.createElement("DIV");
	Wrap.appendChild(Box);
	Box.style.cssText =	"width: 280px; position: absolute; border: 1px solid #007fff; top: 0; left: 0;" +
				"border-radius: 10px; padding: 5px; font-family: verdana; font-size: 14px; background-color: #ffffff";

	var Header = document.createElement("DIV");
	Box.appendChild(Header);
	Header.style.cssText =	"background-color: whitesmoke; color: #000; height: 30px; font-weight: 600;" +
				"padding: 10px 10px 0 10px; border-radius: 5px;";

	var Left = document.createElement("DIV");
	Header.appendChild(Left);
	Left.innerHTML = "&lt;";
	Left.style.cssText =	"float: left; cursor: pointer";
	Left.onmousedown = function () {
		dayBox.currentMonth--;
		if (dayBox.currentMonth == -1) {
			dayBox.currentMonth = 11;
			dayBox.currentYear--;
		}
		_setMonth(dayBox.currentMonth, dayBox.currentYear, settings);
		return false;
	};

	var Right = document.createElement("DIV");
	Header.appendChild(Right);
	Right.innerHTML = "&gt;";
	Right.style.cssText =	"float: right; cursor: pointer";
	Right.onmousedown = function () {
		dayBox.currentMonth++;
		if (dayBox.currentMonth == 12) {
			dayBox.currentMonth = 0;
			dayBox.currentYear++;
		}
		_setMonth(dayBox.currentMonth, dayBox.currentYear, settings);
		return false;
	};

	var Month = document.createElement("DIV");
	Header.appendChild(Month);
	Month.style.textAlign = "center";

	settings.header = Month;

	for (var i = 0; i < 7; i++) {
		var dayCaption = document.createElement("DIV");
		Box.appendChild(dayCaption);
		dayCaption.style.cssText =	"float: left; width: 40px; text-align: center; margin-top: 5px; font-size: 10px;";
		dayCaption.innerHTML = Datepicker.languages[settings.language].weekdaysShort[i];
	}

	var space = document.createElement("DIV");
	space.style.height = "20px";
	Box.appendChild(space);

	var dayBox = document.createElement("DIV");
	Box.appendChild(dayBox);

	dayBox.currentMonth = settings.month;
	dayBox.currentYear = settings.year;
	settings.daybox = dayBox;

	_setMonth(settings.month, settings.year, settings);

	var Today = document.createElement("DIV");
	if (settings.todaybutton) Box.appendChild(Today);
	Today.style.cssText =	"float: left; background: #007fff; color: #ffffff; border-radius: 8px; padding: 5px;" +
				"cursor: pointer; font-size: 12px; margin: 5px 0 0 10px;";
	Today.innerHTML = Datepicker.languages[settings.language].todayCaption;
	Today.onmousedown = function () {
		dayBox.currentMonth = now.getMonth();
		dayBox.currentYear = now.getFullYear();
		_setMonth(dayBox.currentMonth, dayBox.currentYear, settings);
	};

	var NextYear = document.createElement("DIV");
	if (settings.gotoyear) Box.appendChild(NextYear);
	NextYear.innerHTML = Datepicker.languages[settings.language].gotoCaption + "&gt;";
	NextYear.style.cssText = "float: right; background: #007fff; color: #ffffff; border-radius: 8px; padding: 5px;" +
				 "cursor: pointer; font-size: 12px; margin: 5px 5px 0 0";
	NextYear.onmousedown = function () {
		++dayBox.currentYear;
		_setMonth(dayBox.currentMonth, dayBox.currentYear, settings);
	};

	var PrevYear = document.createElement("DIV");
	if (settings.gotoyear) Box.appendChild(PrevYear);
	PrevYear.innerHTML = "&lt;" + Datepicker.languages[settings.language].gotoCaption;
	PrevYear.style.cssText = "float: right; background: #007fff; color: #ffffff; border-radius: 8px; padding: 5px;" +
				 "cursor: pointer; font-size: 12px; margin: 5px 2px 0 0";
	PrevYear.onmousedown = function () {
		--dayBox.currentYear;
		_setMonth(dayBox.currentMonth, dayBox.currentYear, settings);
	};

	Box.onmousedown = function () { return false };

	if (settings.popup) {
		document.onmousedown = function (e) {
			if (!e) e = window.event;
			if (!e.target) e.target = e.srcElement;
			var tg = e.target;
			var outside = true;
			while (tg != document.documentElement) {
				if (tg == settings.target || tg == Wrap) {
					outside = false;
					break;
				}
				tg = tg.parentNode;
			}
			if (outside) {
				for (var i = 0; i < Datepicker.items.length; i++) {
					if (Datepicker.items[i] != null) _remove(Datepicker.items[i], settings.animationhide);
					Datepicker.items[i] = null;
				}
			}
		};
	}

	if (!settings.inline) Datepicker.items.push(Wrap);

	return Wrap;
}

function _remove(wrap, effect) {
	if (!effect) effect = "none";
	Datepicker.effects[effect](wrap);
	wrap._target.datepicker = null;
	document.onmousedown = null;
}

window.Datepicker = {
	items : [],
	add : _datepicker,
	bind : function (target, settings) {
		if (settings && settings.inline) {
			settings.target = target;
			this.datepicker = Datepicker.add(settings);
			return;
		};
		target.onmousedown = function () {
			if (this.datepicker) return;
			if (!settings) settings = {};
			settings.target = this;
			this.datepicker = Datepicker.add(settings);
		};
	},
	remove : _remove,
	languages : {
		EN : {
			gotoCaption : "Year",
			todayCaption : "Today",
			weekdaysShort : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			weekdaysFull : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			monthsShort : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			monthsFull : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			sundayWeek : true
		},
		RU : {
			gotoCaption : "Год",
			todayCaption : "Сегодня",
			weekdaysShort : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
			weekdaysFull : ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
			monthsShort : ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
			monthsFull : ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
			sundayWeek : false
		}
	},
	effects : {
		noneshow : function (target) {
			target.style.width = "292px";
			target.style.height = "203px";
			target.style.opacity = 1;
		},
		nonehide : function (target) {
			document.body.removeChild(target);
		},
		slideshow : function (target) {
			target.style.opacity = 1;
			target.style.width = "292px";
			_fx(target, "height", 0, 203);
		},
		slidehide : function (target) {
			_fx(target, "height", 203, 0);
			setTimeout(function () { document.body.removeChild(target) }, 300);
		},
		foldshow : function (target) {
			target.style.opacity = 1;
			_fx(target, "height", 0, 203);
			_fx(target, "width", 0, 292);
		},
		foldhide : function (target) {
			_fx(target, "height", 203, 0);
			_fx(target, "width", 292, 0);
			setTimeout(function () { document.body.removeChild(target) }, 300);
		},
		fadeshow : function (target) {
			target.style.width = "292px";
			target.style.height = "203px";
			_fx(target, "opacity", 0, 1);
		},
		fadehide : function (target) {
			_fx(target, "opacity", 1, 0);
			setTimeout(function () { document.body.removeChild(target) }, 300);
		},
	}
};

})();