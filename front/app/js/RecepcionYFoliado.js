define(function (require) {
	var _ = require('underscore');;
	var $ = require('jquery');
	var alertify = require('alertify');
	
	var url = "http://127.0.0.1:3000/";
	
	$("#btn_buscar").click(function(){
		$("#panel_perfil").hide();
		$("#contenedor_resultado_busqueda").hide();
		buscarPostulante($("#txtBuscador").val(), function(postulante){
			if(postulante.encontrado){
				$("#contenedor_resultado_busqueda").show();
				$("#nombre_postulante").text(postulante.apellido + ", " + postulante.nombre);
				$("#dni_postulante").text("DNI:"+postulante.dni);
				$("#contenedor_perfiles").empty();
				_.forEach(postulante.perfiles, function(perfil){
					var control_perfil = $("#plantillas .perfil").clone();
					control_perfil.find(".nombre_perfil").text(perfil.nombre);
					control_perfil.click(function(){
						$("#contenedor_perfiles").find(".active").removeClass("active");
						control_perfil.addClass("active");
						$("#panel_perfil").show();
						$.ajax({
							url: url + "getDocumentacionChecklistPostulante",
							type: "POST",
							data: {
								dni: postulante.dni,
								idChecklist: perfil.idChecklist
							},
							success: function (respuestaJson) {
								$("#contenedor_documentos").empty();
								perfil.documentacion = JSON.parse(respuestaJson);	
								_.forEach(perfil.documentacion, function(docu){
									var control_documento = $("#plantillas .documento").clone();
									control_documento.find("#nombre_documento").text(docu.descripcion);
									control_documento.find("#cantidad_fojas").val(docu.cantidadFojas);
									if(docu.presentado) control_documento.addClass("presentado");
									control_documento.find("#cantidad_fojas").change(function(){
										docu.cantidadFojas = parseInt(control_documento.find("#cantidad_fojas").val());
										if(docu.cantidadFojas>0) {
											docu.presentado = true
											control_documento.addClass("presentado");
										};
										if(docu.cantidadFojas<=0||isNaN(docu.cantidadFojas)) {
											docu.presentado = false;
											control_documento.removeClass("presentado");	
											docu.cantidadFojas = "";
											control_documento.find("#cantidad_fojas").val("");
										}
									});
									$("#contenedor_documentos").append(control_documento);
								});		
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
								alertify.error("Error al obtener documentos");
							}
						});
						
						$("#btn_guardar").off();
						$("#btn_guardar").click(function(){
							$.ajax({
								url: url + "guardarFojasParaUnPostulanteAUnPerfil",
								type: "POST",
								data: {
									dniPostulante: postulante.dni,
									idChecklist: perfil.idChecklist,
									documentacion: perfil.documentacion
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
			}
		});
	});
       
	function buscarPostulante(documentoBuscado, callback) {	
		$.ajax({
			url: url + "getPostulantePorDni/" + documentoBuscado,
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				console.log(respuestaJson);
				var postulante = JSON.parse(respuestaJson);	
				callback(postulante);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al obtener perfiles");
			}
		});
	};
});