var fs = require("fs");
var csv = require("fast-csv");
var _ = require("./underscore-min");
var mongodb = require('mongodb');

var uri = 'mongodb://127.0.0.1/ExpedientesConcurso';

mongodb.MongoClient.connect(uri, function(err, db) {  
  	if(err) throw err;
	var col_perfiles = db.collection('perfiles');
	col_perfiles.find({}).toArray(function(err, perfiles){
		var stream_perfiles = fs.createReadStream("perfiles.csv");
		csv
			.fromStream(stream_perfiles, {headers : true})
			.on("data", function(data){     
				var perfil = _.findWhere(perfiles, {nombre: data.perfil});
				if(!perfil) {
					perfil = {
						nombre: data.perfil,
						postulantes: [],
						documentacionRequerida:[]
					};
					perfiles.push(perfil);
				}
			
				if(!_.contains(perfil.documentacionRequerida, data.nombre_documento)) {
					perfil.documentacionRequerida.push(data.nombre_documento);
				}
				})
			.on("end", function(){
				console.log(JSON.stringify(perfiles));
				_.forEach(perfiles, function(perfil){
					col_perfiles.save(perfil, function(err){
						if(err) throw err;
					});
				});
			});	
		
		var stream_concursantes = fs.createReadStream("concursantes.csv");
		csv
			.fromStream(stream_concursantes, {headers : true})
			.on("data", function(data){     
				var perfil = _.findWhere(perfiles, {nombre: data.perfil});
				if(!perfil) {
					perfil = {
						nombre: data.perfil,
						postulantes: [],
						documentacionRequerida:[]
					};
					perfiles.push(perfil);
				}
				var postulante = _.findWhere(perfil.postulantes, {dni: data.dni});
				if(!postulante) {
					postulante = {
						nombre: data.nombre,
						apellido: data.apellido,
						ponderacion: data.ponderacion,
						dni: data.dni,
						documentosPresentados:[]
					}
					perfil.postulantes.push(postulante);
				}
				})
			.on("end", function(){
				console.log(JSON.stringify(perfiles));
				_.forEach(perfiles, function(perfil){
					col_perfiles.save(perfil, function(err){
						if(err) throw err;
					});
				});
			});	
	});	
});
