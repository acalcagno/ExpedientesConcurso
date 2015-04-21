var url = "http://127.0.0.1:3000/";
define(function (require) {
	var _ = require('underscore');;
	var $ = require('jquery');
	var alertify = require('alertify');
	
	$(document).ready(function(){
		$.ajax({
			url: url + "todosLosExpedientes",
			type: "GET",
			async: true,
			success: function (expedientes_json) {
				var expedientes = JSON.parse(expedientes_json);	
				_.forEach(expedientes, function(expediente){
					var control_expediente = $("#plantillas .expediente_en_lista").clone();
					control_expediente.find("#numero_expediente").text(expediente.numero);
					control_expediente.click(function(){
						$("#contenedor_expedientes").find(".active").removeClass("active");
						control_expediente.addClass("active");
						mostrarExpediente(expediente);
					});
					control_expediente.hide();					
					$("#contenedor_expedientes").append(control_expediente);
					control_expediente.show('fast');
				});
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   console.log("error al obtener expedientes");
			}
		});
		
	});
	
	var mostrarExpediente = function(resumen_expediente){
		$("#titulo_expediente").text("Expediente N°" + resumen_expediente.numero);
		$("#contenedor_postulantes").empty();
		$.ajax({
			url: url + "postulantesDelExpediente/" + resumen_expediente._id,
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
					_.forEach(_.filter(postulantes, function(p){return p.perfil.id == perfil.id}), function(postulante){
						var control_postulante = $("#plantillas .postulante_en_lista_de_incluidos").clone();
						control_postulante.find(".nombre").text(postulante.apellido + ", " + postulante.nombre);
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
									control_postulante.hide('fast', function(){ control_postulante.remove(); });
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
	}
});