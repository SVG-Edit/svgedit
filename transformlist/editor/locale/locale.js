var put_locale = function(svgCanvas, given_param){
	var lang_param;
	if(given_param) {
		lang_param = given_param;
	} else {
		lang_param = $.pref('lang');
		if(!lang_param) {
			if (navigator.userLanguage) // Explorer
				lang_param = navigator.userLanguage;
			else if (navigator.language) // FF, Opera, ...
				lang_param = navigator.language;
			if (lang_param == "")
				return;
		}
		// don't bother on first run if language is English
		if(lang_param.indexOf("en") == 0) return;
	}
	
	var url = "locale/lang." + lang_param + ".js";
	$.get(url, function(data){
		var LangData = eval(data), js_strings;
		for (var i=0;i<LangData.length;i++)
		{
			if(LangData[i].id) {
				var elem = document.getElementById(LangData[i].id);
				if(elem){
					if(LangData[i].title)
						elem.title = LangData[i].title;
					if(LangData[i].textContent)
						elem.textContent = LangData[i].textContent;
				}
			} else if(LangData[i].js_strings) {
				js_strings = LangData[i].js_strings;
			}
		}
		svgCanvas.setLang(lang_param, js_strings);
	},"json");
};
