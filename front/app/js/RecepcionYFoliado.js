define(function (require) {
	var _ = require('underscore');;
	var $ = require('jquery');
	var alertify = require('alertify');
	
	$("#btn_buscar").click(function(){
		$("#panel_perfil").hide();
		$("#contenedor_resultado_busqueda").hide();
		buscarPostulante($("#txtBuscador").val(), function(postulante){
			if(postulante){
				$("#contenedor_resultado_busqueda").show();
				$("#nombre_postulante").text(postulante.apellido + ", " + postulante.nombre);
				$("#dni_postulante").text("DNI:"+postulante.dni);
				$("#contenedor_perfiles").empty();
				_.forEach(postulante.perfilesPostulados, function(perfil){
					var control_perfil = $("#plantillas .perfil").clone();
					control_perfil.find(".nombre_perfil").text(perfil.nombre);
					control_perfil.find(".ponderacion_perfil").text(perfil.ponderacion);
					control_perfil.click(function(){
						$("#contenedor_perfiles").find(".active").removeClass("active");
						control_perfil.addClass("active");
						$("#panel_perfil").show();
						$("#contenedor_documentos").empty();
						_.forEach(perfil.documentacionRequerida, function(docu){
							var control_documento = $("#plantillas .documento").clone();
							control_documento.find("#nombre_documento").text(docu.nombre);
							control_documento.find("#cantidad_fojas").val(docu.fojas);
							control_documento.find("#cantidad_fojas").change(function(){
								docu.fojas = parseInt(control_documento.find("#cantidad_fojas").val());
								if(docu.fojas>0) docu.presentado = true;
							});
							$("#contenedor_documentos").append(control_documento);
						});
						$("#btn_guardar").off();
						$("#btn_guardar").click(function(){
							$.ajax({
								url: "http://127.0.0.1:3000/guardarFojasParaUnPostulanteAUnPerfil",
								type: "POST",
								data: {
									dniPostulante: postulante.dni,
									perfil: perfil.nombre,
									documentos: perfil.documentacionRequerida
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
			url: "http://127.0.0.1:3000/todosLosPerfiles",
			type: "GET",
			async: true,
			success: function (respuestaJson) {
				console.log(respuestaJson);
				var perfiles = JSON.parse(respuestaJson);	
				var postulante = {
					nombre: "",
					apellido: "",
					dni: "",
					perfilesPostulados: []
				};
				_.forEach(perfiles, function(perfil){
					_.forEach(perfil.postulantes, function(p){
						if(p.dni == documentoBuscado){
							postulante.dni = p.dni;
							postulante.nombre = p.nombre;
							postulante.apellido = p.apellido;
							var perfilPostulado = {
								nombre: perfil.nombre,
								ponderacion: p.ponderacion,
								documentacionRequerida: []
							}
							_.forEach(perfil.documentacionRequerida, function(docu){
								var doc_requerido = {
									nombre: docu,
									presentado: false,
									fojas: ""
								};
								var doc_presentado = _.findWhere(p.documentosPresentados, {documento: docu});
								if(doc_presentado){
									doc_requerido.presentado = true;
									doc_requerido.fojas = doc_presentado.cantidadFojas;
								}	
								perfilPostulado.documentacionRequerida.push(doc_requerido);
							});
							postulante.perfilesPostulados.push(perfilPostulado);

						}

					});
				});
				callback(postulante);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   console.log("error al obtener perfiles");
			}
		});
	};
});