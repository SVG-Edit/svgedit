$(document).ready(function(){


	ApplyColorPicker("colorSelectorStroke" , "000000" , {
		callback: function(hex){
				window.set_stroke_color(hex);
			}
	});
	
	ApplyColorPicker("colorSelectorFill" , "ffffff" , {
			callback: function(hex){
				window.set_fill_color(hex);
			}
	});



});//end ready

function ApplyColorPicker(id , ini_col_hex , fun_var){

		$("#" + id ).css({
			"border": "1px solid black",
			"height" : "30px",
			"width" : "30px",
			"backgroundColor" : "#" + ini_col_hex
			
		});

		$("#" + id).ColorPicker({
			color: "#" + ini_col_hex,
			onChange: function (hsb, hex, rgb) {
				$("#" + id).css("backgroundColor", "#" + hex);
				fun_var.callback('#' + hex);
			}
		});
		
}//apply


function return_str_to_html(str){
	//alert("This is svg image in string format \n This will be posted to server \n " + str)
	//posting the data to server
	
	//document.getElementById("hidden_svg_data").setAttribute("value", escape(str));
	$.post(
		"save.php", 
		{svg_data: escape(str)
	});
}


