// function GUP is taken from http://www.netlobo.com/url_query_string_javascript.html
// gup = get URL parameter
function gup( name )
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else
		return results[1];
}

var put_locale = function(){
	var lang_param = gup("lang");
	if (lang_param == "")
		return;
	var url = "locale/lang." + lang_param + ".js";
	$.get(url, function(data){
		var LangData = eval(data);
		for (var i=0;i<LangData.length;i++)
		{
			var elem = document.getElementById(LangData[i].id);
			if(elem){
				if(LangData[i].title)
					elem.title = LangData[i].title;
				if(LangData[i].textContent)
					elem.textContent = LangData[i].textContent;
			}
		}
	},"json");
};
