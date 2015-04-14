define(function (require) {

	var $ = require('jquery');
	$("#btnBuscar").click(btnBuscarClick);
	$("#btnGuardar").click(btnGuardarClick);

	$.ajax({
        url: "http://127.0.0.1:3000/concursantes",
        type: "GET",
        async: true,
        success: function (respuestaJson) {
			localStorage.concursantes = JSON.stringify(respuestaJson);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest);
        }
    });
    
    $.ajax({
        url: "http://127.0.0.1:3000/documentacion",
        type: "GET",
        async: true,
        success: function (respuestaJson) {
            var documentacion = JSON.parse(respuestaJson);
            for(var i=0; i< documentacion.length; i++) {
                alert(documentacion[i]);
            }
            
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest);
        }
    });

	function btnGuardarClick() {
		localStorage.nombre = $("#txtNombre").val();
	}

	function btnBuscarClick() {
		var concursante = buscarConcursante($("#txtBuscador").val());
		alert(concursante.apellido);
	}
    
    
    
    
	function buscarConcursante(documentoBuscado) {
		var concursantes = JSON.parse(localStorage.concursantes);
		for(var i = 0; i < concursantes.length; i++) {
			if (concursantes[i].documento == documentoBuscado) {
				return concursantes[i];
			}
		}
		alert("No se encontro ningun concursante con el documento " + documentoBuscado);
		return {apellido:"No Especificado"};
	}
});