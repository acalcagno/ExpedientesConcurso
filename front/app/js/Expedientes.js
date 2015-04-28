var url = "http://127.0.0.1:3000/";
define(function (require) {
	var _ = require('underscore');;
	var $ = require('jquery');
	var alertify = require('alertify');
	var expediente_seleccionado;
	var expedientes = [];
	var perfil_seleccionado;
	
	$(document).ready(function(){
		cargar_expedientes();
		cargar_panel_agregar_postulantes();
	});
	
	$("#boton_abrir_panel_agregar_expediente").click(function(){
		$("#panel_agregar_expediente").show("fast");
		$("#lista_expedientes").addClass("modo_agregar_expediente");
	});

	$("#boton_cerrar_panel_agregar_expediente").click(function(event){
		$("#panel_agregar_expediente").hide();
		$("#lista_expedientes").removeClass("modo_agregar_expediente");
		event.stopPropagation();
	});
	
	$("#boton_agregar_expediente").click(function(){
		$.ajax({
			url: url + "crearExpediente",
			type: "POST",
			data: {
				numero: $("#numero_expediente_agregar").val()
			},
			async: true,
			success: function () {
				cargar_expedientes();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alertify.error("error al incluir postulante");
			}
		});
	});
	
	$("#boton_imprimir").click(function(){
//		var win = window.open(url + "imprimir/" + expediente_seleccionado._id, '_blank');
		var win = window.open("IndiceExpediente.html");
  		win.focus();
	});
	
	var cargar_panel_agregar_postulantes = function(){
		$.ajax({
			url: url + "todosLosPerfiles",
			type: "GET",
			async: true,
			success: function (perfiles_json) {
				var perfiles = JSON.parse(perfiles_json);	
				$("#selector_de_perfiles").empty();
				_.forEach(perfiles, function(perfil){
					var option_perfil = $("<option>");
					option_perfil.val(perfil._id);
					option_perfil.text(perfil.nombre);
					$("#selector_de_perfiles").change(function(){
						if($("#selector_de_perfiles").val() != perfil._id) return;
						perfil_seleccionado = perfil._id;
						$("#contenedor_postulantes_de_un_perfil").empty();
						_.forEach(perfil.postulantes, function(postulante){
							var control_postulante = $("#plantillas .postulante_en_lista_de_no_incluidos").clone();
							control_postulante.find(".nombre").text(postulante.apellido + ", " + postulante.nombre + " (" + postulante.dni +")");	
							
							if(postulante.incluidoEnExpediente){
								control_postulante.find(".leyenda_ya_incluido").text("Postulante ya incluido en expediente N°" + _.findWhere(expedientes, {_id: postulante.incluidoEnExpediente}).numero);
								control_postulante.addClass("incluido_en_expediente");	
							} 
							if(postulante_no_presento_documentacion(perfil, postulante)){
								control_postulante.find(".leyenda_ya_incluido").text("No presentó toda la documentación requerida");
								control_postulante.addClass("incluido_en_expediente");	
							} 
							$("#contenedor_postulantes_de_un_perfil").append(control_postulante);
							control_postulante.find(".boton_incluir_postulante").click(function(){
							$.ajax({
								url: url + "incluirPostulanteAPerfilEnExpediente",
								type: "POST",
								data: {
									dniPostulante: postulante.dni,
									idPerfil: perfil._id,
									idExpediente: expediente_seleccionado._id									
								},
								async: true,
								success: function () {
									postulante.incluidoEnExpediente = expediente_seleccionado._id,
									control_postulante.find(".leyenda_ya_incluido").text("Postulante ya incluido en expediente N°" + expediente_seleccionado.numero);
									control_postulante.addClass("incluido_en_expediente");
									mostrarExpediente();
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
								   alertify.error("error al incluir postulante");
								}
							});
						});
						});
					});
					$("#selector_de_perfiles").append(option_perfil);
				});
				if(!perfil_seleccionado) perfil_seleccionado = perfiles[0]._id;
				$("#selector_de_perfiles").val(perfil_seleccionado);
				$("#selector_de_perfiles").change();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   console.log("error al obtener expedientes");
			}
		});
	};
	
	var postulante_no_presento_documentacion = function(perfil, postulante){
		var no_presento = false;
		_.forEach(perfil.documentacionRequerida, function(doc_requerido){
			var doc_presentado = _.findWhere(postulante.documentosPresentados, {documento:doc_requerido});
			if(!doc_presentado)	{no_presento = true; return;}
			if(doc_presentado.cantidadFojas == "") no_presento = true;
		});
		return no_presento;
	};
	
	var cargar_expedientes = function(){
		$("#contenedor_expedientes").empty();
		$.ajax({
			url: url + "todosLosExpedientes",
			type: "GET",
			async: true,
			success: function (expedientes_json) {
				expedientes = JSON.parse(expedientes_json);	
				_.forEach(expedientes, function(expediente){
					var control_expediente = $("#plantillas .expediente_en_lista").clone();
					control_expediente.find("#numero_expediente").text(expediente.numero);
					control_expediente.click(function(){
						$("#contenedor_expedientes").find(".active").removeClass("active");
						control_expediente.addClass("active");
						expediente_seleccionado = expediente;
						mostrarExpediente();
					});
					control_expediente.hide();					
					$("#contenedor_expedientes").append(control_expediente);
					
					if(expediente_seleccionado) if(expediente._id === expediente_seleccionado._id) control_expediente.click();
					control_expediente.show('fast');					
				});
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   console.log("error al obtener expedientes");
			}
		});	
	};
	
	var mostrarExpediente = function(){
		$("#titulo_expediente").text("Expediente N°" + expediente_seleccionado.numero);
		$("#contenedor_postulantes").empty();
		$("#panel_expediente").show();
		$.ajax({
			url: url + "postulantesDelExpediente/" + expediente_seleccionado._id,
			type: "GET",
			async: true,
			success: function (postulantes_json) {
				var postulantes = JSON.parse(postulantes_json);	
				
				var perfiles_distintos = _.uniq(_.pluck(postulantes, "perfil"), function(perfil){
					return perfil.id;
				});
				console.log(perfiles_distintos);
				
				_.forEach(perfiles_distintos, function(perfil){
					var control_perfil = $("#plantillas .postulantes_de_un_perfil").clone();
					control_perfil.find(".nombre_perfil").text(perfil.nombre);
					$("#contenedor_postulantes").append(control_perfil);
					control_perfil.show('fast');
					_.forEach(_.filter(postulantes, function(p){return p.perfil.id == perfil.id}), function(postulante){
						var control_postulante = $("#plantillas .postulante_en_lista_de_incluidos").clone();
						control_postulante.find(".nombre").text(postulante.apellido + ", " + postulante.nombre + " (" + postulante.dni +")");
						control_postulante.find(".boton_quitar").click(function(){
							$.ajax({
								url: url + "quitarPostulanteAPerfilDeExpediente",
								type: "POST",
								data: {
									postulante: {
										dni: postulante.dni,
										idPerfil: postulante.perfil.id
									}
								},
								async: true,
								success: function () {
									control_postulante.hide('fast', function(){ 
										control_postulante.remove(); 
										if(!$.trim(control_perfil.find(".contenedor_postulantes").html())) control_perfil.remove();
									});
									
									cargar_panel_agregar_postulantes();
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
								   alertify.error("error al quitar postulante");
								}
							});
						});
						control_postulante.hide();					
						control_perfil.find(".contenedor_postulantes").append(control_postulante);
						control_postulante.show('fast');
					});					
				});
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   console.log("error al obtener expediente");
			}
		});
		
		$("#boton_abrir_panel_agregar_postulantes").click(function(){
			$("#panel_agregar_postulantes").show();
			$("#panel_expediente").addClass("modo_agregar_postulantes");
		});
		
		$("#boton_cerrar_panel_agregar_postulantes").click(function(event){
			$("#panel_agregar_postulantes").hide("fast");
			$("#panel_expediente").removeClass("modo_agregar_postulantes");
			event.stopPropagation();
		});
	}
});