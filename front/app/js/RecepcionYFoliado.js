define(function (require) {
	var _ = require('underscore');;
	var $ = require('jquery');
	var perfiles = [];
	
	$("#btn_buscar").click(function(){
		$("#panel_perfil").hide();
		var postulante = buscarPostulante($("#txtBuscador").val());
		if(postulante){
			console.log(postulante);
			$("#nombre_postulante").text(postulante.apellido + ", " + postulante.nombre);
			$("#dni_postulante").text(postulante.dni);
			$("#contenedor_perfiles").empty();
			_.forEach(postulante.perfilesPostulados, function(perfil){
				var control_perfil = $("#plantillas .perfil").clone();
				control_perfil.find(".nombre_perfil").text(perfil.nombre);
				control_perfil.find(".ponderacion_perfil").text(perfil.ponderacion);
				control_perfil.click(function(){
					$("#panel_perfil").show();
					$("#contenedor_documentos").empty();
					_.forEach(perfil.documentacionRequerida, function(docu){
						var control_documento = $("#plantillas .documento").clone();
						control_documento.find("#nombre_documento").text(docu.nombre);
						control_documento.find("#cantidad_fojas").val(docu.fojas);
						control_documento.find("#cantidad_fojas").change(function(){
							docu.fojas = control_documento.find("#cantidad_fojas").val();
						});
						$("#contenedor_documentos").append(control_documento);
					});
					$("#btn_guardar").off();
					$("#btn_guardar").click(function(){
						
					});
				});
				$("#contenedor_perfiles").append(control_perfil);
			});
		}
	});

	$.ajax({
        url: "http://127.0.0.1:3000/todosLosPerfiles",
        type: "GET",
        async: true,
        success: function (respuestaJson) {
			console.log(respuestaJson);
			perfiles = JSON.parse(respuestaJson);			
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
           console.log("error al obtener perfiles");
        }
    });
       
	function buscarPostulante(documentoBuscado) {		
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
							fojas: 0
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
		return postulante;
	}
});