var palette = ["#000000","#202020","#404040","#606060","#808080","#A0A0A0","#C0C0C0","#E0E0E0","#FFFFFF","#800000","#FF0000","#808000","#FFFF00","#008000","#00FF00","#008080","#00FFFF","#000080","#0000FF","#800080","#FF00FF","#2B0000","#550000","#800000","#AA0000","#D40000","#FF0000","#FF2A2A","#FF5555","#FF8080","#FFAAAA","#FFD5D5","#280B0B","#501616","#782121","#A02C2C","#C83737","#D35F5F","#DE8787","#E9AFAF","#F4D7D7","#241C1C","#483737","#6C5353","#916F6F","#AC9393","#C8B7B7","#E3DBDB","#2B1100","#552200","#803300","#AA4400","#D45500","#FF6600","#FF7F2A","#FF9955","#FFB380","#FFCCAA","#FFE6D5","#28170B","#502D16","#784421","#A05A2C","#C87137","#D38D5F","#DEAA87","#E9C6AF","#F4E3D7","#241F1C","#483E37","#6C5D53","#917C6F","#AC9D93","#C8BEB7","#E3DEDB","#2B2200","#554400","#806600","#AA8800","#D4AA00","#FFCC00","#FFD42A","#FFDD55","#FFE680","#FFEEAA","#FFF6D5","#28220B","#504416","#786721","#A0892C","#C8AB37","#D3BC5F","#DECD87","#E9DDAF","#F4EED7","#24221C","#484537","#6C6753","#918A6F","#ACA793","#C8C4B7","#E3E2DB","#222B00","#445500","#668000","#88AA00","#AAD400","#CCFF00","#D4FF2A","#DDFF55","#E5FF80","#EEFFAA","#F6FFD5","#22280B","#445016","#677821","#89A02C","#ABC837","#BCD35F","#CDDE87","#DDE9AF","#EEF4D7","#22241C","#454837","#676C53","#8A916F","#A7AC93","#C4C8B7","#E2E3DB","#112B00","#225500","#338000","#44AA00","#55D400","#66FF00","#7FFF2A","#99FF55","#B3FF80","#CCFFAA","#E5FFD5","#17280B","#2D5016","#447821","#5AA02C","#71C837","#8DD35F","#AADE87","#C6E9AF","#E3F4D7","#1F241C","#3E4837","#5D6C53","#7C916F","#9DAC93","#BEC8B7","#DEE3DB","#002B00","#005500","#008000","#00AA00","#00D400","#00FF00","#2AFF2A","#55FF55","#80FF80","#AAFFAA","#D5FFD5","#0B280B","#165016","#217821","#2CA02C","#37C837","#5FD35F","#87DE87","#AFE9AF","#D7F4D7","#1C241C","#374837","#536C53","#6F916F","#93AC93","#B7C8B7","#DBE3DB","#002B11","#005522","#008033","#00AA44","#00D455","#00FF66","#2AFF80","#55FF99","#80FFB3","#AAFFCC","#D5FFE6","#0B2817","#16502D","#217844","#2CA05A","#37C871","#5FD38D","#87DEAA","#AFE9C6","#D7F4E3","#1C241F","#37483E","#536C5D","#6F917C","#93AC9D","#B7C8BE","#DBE3DE","#002B22","#005544","#008066","#00AA88","#00D4AA","#00FFCC","#2AFFD5","#55FFDD","#80FFE6","#AAFFEE","#D5FFF6","#0B2822","#165044","#217867","#2CA089","#37C8AB","#5FD3BC","#87DECD","#AFE9DD","#D7F4EE","#1C2422","#374845","#536C67","#6F918A","#93ACA7","#B7C8C4","#DBE3E2","#00222B","#004455","#006680","#0088AA","#00AAD4","#00CCFF","#2AD4FF","#55DDFF","#80E5FF","#AAEEFF","#D5F6FF","#0B2228","#164450","#216778","#2C89A0","#37ABC8","#5FBCD3","#87CDDE","#AFDDE9","#D7EEF4","#1C2224","#374548","#53676C","#6F8A91","#93A7AC","#B7C4C8","#DBE2E3","#00112B","#002255","#003380","#0044AA","#0055D4","#0066FF","#2A7FFF","#5599FF","#80B3FF","#AACCFF","#D5E5FF","#0B1728","#162D50","#214478","#2C5AA0","#3771C8","#5F8DD3","#87AADE","#AFC6E9","#D7E3F4","#1C1F24","#373E48","#535D6C","#6F7C91","#939DAC","#B7BEC8","#DBDEE3","#00002B","#000055","#000080","#0000AA","#0000D4","#0000FF","#2A2AFF","#5555FF","#8080FF","#AAAAFF","#D5D5FF","#0B0B28","#161650","#212178","#2C2CA0","#3737C8","#5F5FD3","#8787DE","#AFAFE9","#D7D7F4","#1C1C24","#373748","#53536C","#6F6F91","#9393AC","#B7B7C8","#DBDBE3","#11002B","#220055","#330080","#4400AA","#5500D4","#6600FF","#7F2AFF","#9955FF","#B380FF","#CCAAFF","#E5D5FF","#170B28","#2D1650","#442178","#5A2CA0","#7137C8","#8D5FD3","#AA87DE","#C6AFE9","#E3D7F4","#1F1C24","#3E3748","#5D536C","#7C6F91","#9D93AC","#BEB7C8","#DEDBE3","#22002B","#440055","#660080","#8800AA","#AA00D4","#CC00FF","#D42AFF","#DD55FF","#E580FF","#EEAAFF","#F6D5FF","#220B28","#441650","#672178","#892CA0","#AB37C8","#BC5FD3","#CD87DE","#DDAFE9","#EED7F4","#221C24","#453748","#67536C","#8A6F91","#A793AC","#C4B7C8","#E2DBE3","#2B0022","#550044","#800066","#AA0088","#D400AA","#FF00CC","#FF2AD4","#FF55DD","#FF80E5","#FFAAEE","#FFD5F6","#280B22","#501644","#782167","#A02C89","#C837AB","#D35FBC","#DE87CD","#E9AFDD","#F4D7EE","#241C22","#483745","#6C5367","#916F8A","#AC93A7","#C8B7C4","#E3DBE2","#2B0011","#550022","#800033","#AA0044","#D40055","#FF0066","#FF2A7F","#FF5599","#FF80B2","#FFAACC","#FFD5E5","#280B17","#50162D","#782144","#A02C5A","#C83771","#D35F8D","#DE87AA","#E9AFC6","#F4D7E3","#241C1F","#48373E","#6C535D","#916F7C","#AC939D","#C8B7BE","#E3DBDE"]

$(document).ready(function(){
	var str = '<div class="palette_item" style="background: url(\'images/none.png\');"></div>'
	$.each(palette, function(i,item){
		str += '<div class="palette_item" style="background: ' + item + ';"></div>';
	});
	$('#palette').append(str);

	$('#stroke_width').change(function(){
		svgCanvas.setStrokeColor(this.options[this.selectedIndex].value);
	});

	$('.palette_item').click(function(){
		color = $(this).css('background-color');
		if (color == 'transparent') {
			color = 'none';
			$('#fill_color').css('background', 'url(\'images/none.png\')');
		} else {
			$('#fill_color').css('background', color);
		}
		svgCanvas.setFillColor(color);
	});

	$('.palette_item').rightClick(function(){
		color = $(this).css('background-color');
		if (color == 'transparent') {
			color = 'none';
			$('#stroke_color').css('background', 'url(\'images/none.png\')');
		} else {
			$('#stroke_color').css('background', color);
		}
		svgCanvas.setStrokeColor(color);
	});

	$('#tool_select').click(function(){
		svgCanvas.setMode('select');
	});

	$('#tool_path').click(function(){
		svgCanvas.setMode('path');
	});

	$('#tool_line').click(function(){
		svgCanvas.setMode('line');
	});

	$('#tool_square').click(function(){
		svgCanvas.setMode('square');
	});

	$('#tool_rect').click(function(){
		svgCanvas.setMode('rect');
	});

	$('#tool_fhrect').click(function(){
		svgCanvas.setMode('fhrect');
	});

	$('#tool_circle').click(function(){
		svgCanvas.setMode('circle');
	});

	$('#tool_ellipse').click(function(){
		svgCanvas.setMode('ellipse');
	});

	$('#tool_fhellipse').click(function(){
		svgCanvas.setMode('fhellipse');
	});

	$('#tool_delete').click(function(){
		svgCanvas.setMode('delete');
	});

	$('#tool_clear').click(function(){
		svgCanvas.clear();
	});

	$('#tool_submit').click(function(){
		svgCanvas.serialize(serializeHandler);
	});

})

function serializeHandler(str){
	alert(str);
}
