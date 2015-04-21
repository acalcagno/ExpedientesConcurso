var fs = require("fs");
var csv = require("fast-csv");
var _ = require("./underscore-min");
var mongodb = require('mongodb');

var uri = 'mongodb://127.0.0.1/ExpedientesConcurso';

mongodb.MongoClient.connect(uri, function(err, db) {  
  	if(err) throw err;
	var col_expedientes = db.collection('expedientes');
	col_expedientes.find({}).toArray(function(err, expedientes_db){
		var stream_expedientes = fs.createReadStream("expedientes_cabecera.csv");
		csv
			.fromStream(stream_expedientes, {headers : true})
			.on("data", function(csv_exp_cabe_data){     
				var expediente_db = _.findWhere(expedientes_db, {nombre: csv_exp_cabe_data.expediente});
				if(!expediente_db) {
					expediente_db = {
						nombre: csv_exp_cabe_data.expediente,
						documentosCabecera: []
                        
					};
					expedientes_db.push(expediente_db);
				}
			
				if(!_.contains(expediente_db.documentosCabecera, csv_exp_cabe_data.documentoCabecera)) {
					expediente_db.documentosCabecera.push({ nombre: csv_exp_cabe_data.documentoCabecera, cantidadFolios: csv_exp_cabe_data.cantidadFolios, orden:csv_exp_cabe_data.orden });
				}
				})
			.on("end", function(){
				//console.log(JSON.stringify(expedientes_db));
				_.forEach(expedientes_db, function(expediente_db){
					col_expedientes.save(expediente_db, function(err){
						if(err) throw err;
					});
				});
			})
            	

            var col_perfiles = db.collection('perfiles');
            col_perfiles.find({}).toArray(function(err, perfiles_db){
                var stream_postulantes_en_expedientes = fs.createReadStream("concursantes_en_expediente.csv");
                csv
                    .fromStream(stream_postulantes_en_expedientes, {headers : true})
                    .on("data", function(csv_postu_en_exp_data){     
                        var perfil_db = _.findWhere(perfiles_db, {nombre:csv_postu_en_exp_data.perfil});
                        
                        var postulacion_db = _.findWhere(perfil_db.postulantes, {dni:csv_postu_en_exp_data.dniPostulante});
                        var expediente_db = _.findWhere(expedientes_db, {nombre:csv_postu_en_exp_data.expediente});
                        postulacion_db.incluidoEnExpediente = expediente_db._id;
                        console.log(JSON.stringify(expediente_db._id));
                        
                        col_perfiles.save(perfil_db, function(err) {
                            if(err) throw err;
                        })
                    })
                    .on("end", function() {
                });
                /*
                var stream_postulantes_en_expedientes = fs.createReadStream("concursantes_en_expediente.csv");
                csv
                    .fromStream(stream_postulantes_en_expedientes, {headers : true})
                    .on("data", function(csv_postu_en_exp_data){     
                    */
            });
	});
});