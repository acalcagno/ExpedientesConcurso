var fs = require("fs");
var csv = require("fast-csv");
var _ = require("./underscore-min");
var mongodb = require('mongodb');

var uri = 'mongodb://127.0.0.1/ExpedientesConcurso';

mongodb.MongoClient.connect(uri, function(err, db) {  
  	if(err) throw err;
	var col_expedientes = db.collection('expedientes');
	col_expedientes.find({}).toArray(function(err, expedientes){
		var stream_expedientes = fs.createReadStream("expedientes_cabecera.csv");
		csv
			.fromStream(stream_expedientes, {headers : true})
			.on("data", function(data){     
				var expediente = _.findWhere(expedientes, {nombre: data.expediente});
				if(!expediente) {
					expediente = {
						nombre: data.expediente,
						documentosCabecera: []
                        
					};
					expedientes.push(expediente);
				}
			
				if(!_.contains(expediente.documentosCabecera, data.documentoCabecera)) {
					expediente.documentosCabecera.push({ nombre: data.documentoCabecera, cantidadFolios: data.cantidadFolios, orden:data.orden });
				}
				})
			.on("end", function(){
				console.log(JSON.stringify(expedientes));
				_.forEach(expedientes, function(expediente){
					col_expedientes.save(expediente, function(err){
						if(err) throw err;
					});
				});
			});	
		
        
		var stream_concursantes = fs.createReadStream("concursantes_en_expediente.csv");
		
        csv
			.fromStream(stream_concursantes, {headers : true})
			.on("data", function(data){     
				
                var expediente = _.findWhere(expedientes, {nombre: data.expediente});
				if(!expediente) {
                    console.log("Error de datos, no se encontro el expediente " + data.expediente);
					/*perfil = {
						nombre: data.perfil,
						postulantes: [],
						documentacionRequerida:[]
					};
					perfiles.push(perfil);*/
				}
                if(!expediente.postulantes) {
                    expediente.postulantes = [];
                }
                expediente.postulantes.push({dniPostulante: data.dniPostulante, perfil: data.perfil});
				/*var postulante = _.findWhere(expediente.postulantes, {dni: data.dni});
				if(!postulante) {
					postulante = {
						nombre: data.nombre,
						apellido: data.apellido,
						ponderacion: data.ponderacion,
						dni: data.dni,
						documentosPresentados:[]
					}
					perfil.postulantes.push(postulante);
				}*/
				})
			.on("end", function(){
				//console.log(JSON.stringify(perfiles));
				_.forEach(expedientes, function(expediente){
					col_expedientes.save(expediente, function(err){
						if(err) throw err;
					});
				});
			});	
            
	});	
});