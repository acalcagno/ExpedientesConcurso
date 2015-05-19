$(document).ready(function(){
	//var url = "http://127.0.0.1:3000/";
    var url = "http://192.168.0.31:3000/";
	//var url = "http://localhost:3000/";

	$("#btn_buscar").click(function(){
		$("#panel_perfil").hide();
		$("#contenedor_resultado_busqueda").hide();
		getPostulantePorDNI($("#txtBuscador").val(), function(postulante){
			if(postulante.dni){
				$("#contenedor_resultado_busqueda").show();
				$("#nombre_postulante").text(postulante.apellido + ", " + postulante.nombre);
				$("#dni_postulante").text("DNI:"+postulante.dni);
				$("#contenedor_perfiles").empty();
				_.forEach(postulante.postulaciones, function(postulacion){					
					var control_perfil = $("#plantillas .perfil").clone();
					if(!postulacion.documentacionPresentada) postulacion.documentacionPresentada = [];
					getPerfilPorCodigo(postulacion.codigoPerfil, function(perfil){
						control_perfil.find(".nombre_perfil").text(perfil.descripcion);						
						control_perfil.click(function(){
							$("#contenedor_perfiles").find(".active").removeClass("active");
							control_perfil.addClass("active");
							$("#panel_perfil").show();

							getChecklistPorCodigo(postulacion.codigoChecklist, function(checklist){
								$("#contenedor_documentos").empty();
								_.forEach(_.sortBy(checklist.documentacionRequerida, "orden"), function(documento_requerido){
									var control_documento = $("#plantillas .documento").clone();

									getDocumentoPorCodigo(documento_requerido.codigo, function(documento){														
										var documento_presentado = _.findWhere(postulacion.documentacionPresentada, {codigo: documento.codigo});
										control_documento.find("#nombre_documento").text(documento.descripcion);
										
										if(documento_presentado) {
											control_documento.find("#cantidad_fojas").val(documento_presentado.cantidadFojas);
											if(documento_presentado.cantidadFojas>0) control_documento.addClass("presentado");
											if(documento_presentado.salioDeSobre == "true" || documento_presentado.salioDeSobre == true) control_documento.find("#salioDeSobre")[0].checked = true;//FC
										}
										control_documento.find("#cantidad_fojas").change(function(){
											if(!documento_presentado) {
												documento_presentado = {
													codigo: documento.codigo
												};
												postulacion.documentacionPresentada.push(documento_presentado);
											}
											documento_presentado.cantidadFojas = parseInt(control_documento.find("#cantidad_fojas").val());
											if(documento_presentado.cantidadFojas>0) {
												control_documento.addClass("presentado");
											};
											if(documento_presentado.cantidadFojas==0||isNaN(documento_presentado.cantidadFojas)) {
												control_documento.removeClass("presentado");	
												documento_presentado.cantidadFojas = "";
												control_documento.find("#cantidad_fojas").val("");
											}
										});
										//FC
										control_documento.find("#salioDeSobre").change(function(){
											if(documento_presentado) {
												documento_presentado.salioDeSobre = control_documento.find("#salioDeSobre")[0].checked;
												/*documento_presentado = {
													codigo: documento.codigo
												};
												postulacion.documentacionPresentada.push(documento_presentado);*/
											}
											//documento_presentado.salioDeSobre = control_documento.find("#salioDeSobre")[0].checked;
											//if(documento_presentado.cantidadFojas>0) {
											//	control_documento.addClass("presentado");
											//};
											//if(documento_presentado.cantidadFojas==0||isNaN(documento_presentado.cantidadFojas)) {
											//	control_documento.removeClass("presentado");	
											//	documento_presentado.cantidadFojas = "";
											//	control_documento.find("#cantidad_fojas").val("");
											//}
										});
										
										$("#contenedor_documentos").append(control_documento);
									});			
								});		
							});

							$("#btn_guardar").off();
							$("#btn_guardar").click(function(){
								$.ajax({
									url: url + "guardarPostulante",
									type: "POST",
									data: {
										postulante: postulante
									},
									success: function (respuestaJson) {
										alertify.success("Fojas guardadas con éxito");			
									},
									error: function (XMLHttpRequest, textStatus, errorThrown) {
										alertify.error("Error al guardar");
									}
								});
							});
						});
						$("#contenedor_perfiles").append(control_perfil);	

					});
				});
			}
		});
	});
       
	function getPostulantePorDNI(dni, callback) {	
		$.ajax({
			url: url + "getPostulantePorDni/" + dni,
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				var postulante = JSON.parse(respuestaJson);	
				callback(postulante);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener postulante");
			}
		});
	};
	
	function getChecklistPorCodigo(codigo, callback) {	
		$.ajax({
			url: url + "getChecklistPorCodigo/" + codigo,
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				var checklist = JSON.parse(respuestaJson);	
				callback(checklist);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener checklist");
			}
		});
	};
	
	function getPerfilPorCodigo(codigo, callback) {	
		$.ajax({
			url: url + "getPerfilPorCodigo/" + codigo,
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				var perfil = JSON.parse(respuestaJson);	
				callback(perfil);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener perfil");
			}
		});
	};
	
	function getDocumentoPorCodigo(codigo, callback) {	
		$.ajax({
			url: url + "getDocumentoPorCodigo/" + codigo,
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				var documento = JSON.parse(respuestaJson);	
				callback(documento);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener documento");
			}
		});
	};
});