$(document).ready(function(){
	//var expediente_seleccionado;
	var expediente = getVarsUrl(); 
	var expediente_seleccionado;
	//var perfil_seleccionado;
	//var url = "http://127.0.0.1:3000/";
    //var url = "http://192.168.0.31:3000/";
	//var url = "http://localhost:3000/";	
	var url = window.location.pathname.split("/")[0];

	
	$("#boton_imprimir").click(function(){
		window.print();
	});
	
	getExpedientePorId(expediente.id, function(exp_de_base){
		expediente_seleccionado = exp_de_base;		
		//postulacionesDelExpediente(exp_de_base.numero);
		mostrarExpediente();
		
	});	
	


	
	function mostrarExpediente(){
		$.ajax({
			url: url + "postulacionesDelExpediente/" + expediente_seleccionado.numero,
			type: "GET",
			async: true,
			success: function (postulaciones_json) {
				$("#numero_expediente").text("Índice de Expediente N°" + expediente_seleccionado.numero);
				var postulaciones = JSON.parse(postulaciones_json);	
				var numDefojas = 0;//FC:viene de la documentacion fija

				
				//DOCUMENTACION FIJA
				
				_.forEach(postulaciones, function(postulacion){
					_.forEach(postulacion.documentacionPresentada.documentos, function(documento){
						var control_indice_variable = $("#plantillas .indice").clone();
						//var control_perfil = $("#plantillas .postulantes_de_un_perfil").clone();
						control_indice_variable.find("#dni").text(postulacion.postulante.dni);
						control_indice_variable.find("#nombre").text(postulacion.postulante.apellido + ", " + postulacion.postulante.nombre);
						control_indice_variable.find("#documento").text(documento.descripcion);
						
						numDefojas += parseInt(documento.cantidadFojas);
						control_indice_variable.find(".numero_folio").text(numDefojas);
						
						
						$("#contenedor_indice").append(control_indice_variable);
					

					});
					$("#contenedor_indice").append("<hr/>");					
				});
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener expediente");
			}
		});
	}
		

	//cargar_expedientes();
	//cargar_panel_agregar_postulantes();
	
	function getVarsUrl() {
		  var url = location.search.replace("?", "");
		  var arrUrl = url.split("&");
		  var urlObj = {};
		  for (var i = 0; i < arrUrl.length; i++) {
			  var x = arrUrl[i].split("=");
			  urlObj[x[0]] = x[1]
		  }
	  return urlObj;
	};
	
	function getExpedientePorId(id, callback) {	
		$.ajax({
			url: url + "getExpedientePorId/" + id,
			type: "GET",
			async: false,
			success: function (respuestaJson) {
				var expediente = JSON.parse(respuestaJson);	
				callback(expediente);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener expediente");
			}
		});
	};
	
});


