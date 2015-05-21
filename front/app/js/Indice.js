$(document).ready(function(){
	//var expediente_seleccionado;
	var expediente = getVarsUrl(); 
	//var perfil_seleccionado;
	//var url = "http://127.0.0.1:3000/";
    //var url = "http://192.168.0.31:3000/";
	//var url = "http://localhost:3000/";	
	var url = window.location.pathname.split("/")[0];

	
	
	/*$("#boton_agregar_expediente").click(function(){
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
	*/
	/*
	$("#boton_imprimir").click(function(){
//		var win = window.open(url + "imprimir/" + expediente_seleccionado._id, '_blank');
		var win = window.open("IndiceExpediente.html");
  		win.focus();
	});*/
	
	getExpedientePorId(expediente.id, function(expediente){			
		//var exp = expediente;
		getPostulantesPorExpediente(expediente.numero);
		//var expediente_presentado = _.findWhere(postulacion.documentacionPresentada, {codigo: documento.codigo});
		/*control_documento.find("#nombre_documento").text(documento.descripcion);
		
		if(documento_presentado) {
			control_documento.find("#cantidad_fojas").val(documento_presentado.cantidadFojas);
			if(documento_presentado.cantidadFojas>0) control_documento.addClass("presentado");
			if(documento_presentado.salioDeSobre == "true" || documento_presentado.salioDeSobre == true) control_documento.find("#salioDeSobre")[0].checked = true;//FC
			if(documento_presentado.cantidadFojas==0||isNaN(documento_presentado.cantidadFojas)) control_documento.find("#salioDeSobre")[0].disabled = true;//FC
		} else {
			control_documento.find("#salioDeSobre")[0].disabled = true;//FC
			
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
				control_documento.find("#salioDeSobre")[0].disabled = false;//FC
			};
			if(documento_presentado.cantidadFojas==0||isNaN(documento_presentado.cantidadFojas)) {
				control_documento.removeClass("presentado");	
				documento_presentado.cantidadFojas = "";
				control_documento.find("#cantidad_fojas").val("");
				control_documento.find("#salioDeSobre")[0].disabled = true;//FC
			}
		});

		
		$("#contenedor_documentos").append(control_documento);*/
	});	
	/*
	var cargar_panel_agregar_postulantes = function(){
		$("#selector_de_perfiles").off();
		$.ajax({
			url: url + "todosLosPerfiles",
			type: "GET",
			async: true,
			success: function (perfiles_json) {
				var perfiles = JSON.parse(perfiles_json);	
				$("#selector_de_perfiles").empty();
				_.forEach(_.sortBy(perfiles, "descripcion"), function(perfil){
					var option_perfil = $("<option>");
					option_perfil.val(perfil.codigo);
					option_perfil.text(perfil.descripcion);
					
					$("#selector_de_perfiles").change(function(){
						if($("#selector_de_perfiles").val() != perfil.codigo) return;
						perfil_seleccionado = perfil.codigo;
						$("#contenedor_postulantes_de_un_perfil").empty();
						$.ajax({
							url: url + "postulacionesDelPerfil/" + perfil_seleccionado,
							type: "GET",
							async: true,
							success: function (postulaciones_json) {
								var postulaciones = JSON.parse(postulaciones_json);	
								_.forEach(postulaciones, function(postulacion){
									var control_postulante = $("#plantillas .postulante_en_lista_de_no_incluidos").clone();
									control_postulante.find(".nombre").text(postulacion.postulante.apellido + ", " + postulacion.postulante.nombre + " (" + postulacion.postulante.dni +")");	

									if(postulacion.incluidoEnExpediente){
										control_postulante.find(".leyenda_ya_incluido").text("Postulante ya incluido en expediente N°" + postulacion.incluidoEnExpediente);
										control_postulante.addClass("incluido_en_expediente");	
									} 
									if(!postulacion.presentoTodaLaDocumentacion){
										control_postulante.find(".leyenda_ya_incluido").text("No presentó toda la documentación requerida");
										control_postulante.addClass("incluido_en_expediente");	
									} 
									$("#contenedor_postulantes_de_un_perfil").append(control_postulante);
									control_postulante.find(".boton_incluir_postulante").click(function(){
										$.ajax({
											url: url + "incluirPostulacionEnExpediente",
											type: "POST",
											data: {
												dniPostulante: postulacion.postulante.dni,
												codigoPerfil: postulacion.perfil.codigo,
												numeroExpediente: expediente_seleccionado.numero									
											},
											async: true,
											success: function () {
												postulacion.incluidoEnExpediente = expediente_seleccionado.numero,
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
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
							   alertify.error("error al obtener postulaciones del perfil");
							}
						});
						
					});
					$("#selector_de_perfiles").append(option_perfil);
				});
				if(!perfil_seleccionado) perfil_seleccionado = perfiles[0].codigo;
				$("#selector_de_perfiles").val(perfil_seleccionado);
				$("#selector_de_perfiles").change();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			   alerify.error("error al obtener expedientes");
			}
		});
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
			   alertify.error("error al obtener expedientes");
			}
		});	
	};
	
	var mostrarExpediente = function(){
		$("#titulo_expediente").text("Expediente N°" + expediente_seleccionado.numero);
		$("#contenedor_postulantes").empty();
		$("#panel_expediente").show();
		$.ajax({
			url: url + "postulacionesDelExpediente/" + expediente_seleccionado.numero,
			type: "GET",
			async: true,
			success: function (postulaciones_json) {
				var postulaciones = JSON.parse(postulaciones_json);	
				
				var perfiles_distintos = _.uniq(_.pluck(postulaciones, "perfil"), function(perfil){
					return perfil.codigo;
				});
				console.log(perfiles_distintos);
				
				_.forEach(perfiles_distintos, function(perfil){
					var control_perfil = $("#plantillas .postulantes_de_un_perfil").clone();
					control_perfil.find(".nombre_perfil").text(perfil.descripcion);
					$("#contenedor_postulantes").append(control_perfil);
					control_perfil.show('fast');
					_.forEach(_.filter(postulaciones, function(p){return p.perfil.codigo == perfil.codigo}), function(postulacion){
						var control_postulante = $("#plantillas .postulante_en_lista_de_incluidos").clone();
						control_postulante.find(".nombre").text(postulacion.postulante.apellido + ", " + postulacion.postulante.nombre + " (" + postulacion.postulante.dni +")");
						control_postulante.find(".boton_quitar").click(function(){
							$.ajax({
								url: url + "quitarPostulacionDeExpediente",
								type: "POST",
								data: {
									postulacion: {
										dniPostulante: postulacion.postulante.dni,
										codigoPerfil: postulacion.perfil.codigo
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
			   alertify.error("error al obtener expediente");
			}
		});
		}
		

	cargar_expedientes();
	cargar_panel_agregar_postulantes();*/
	
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


