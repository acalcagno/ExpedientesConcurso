var mongodb = require('mongodb');

var uri = 'mongodb://localhost/ExpedientesConcurso';


mongodb.MongoClient.connect(uri, function(err, db) { 
    if(err) throw err;
    
    function insertPerfil(db, perfil) {
        if (perfil.nombre != "NINGUNO") {
            db.collection('perfiles').insert(perfil);
        }
    }

    var fs = require('fs');
    var lineList = fs.readFileSync('concursantes_ejemplo.csv').toString().split('\n');
    lineList.shift(); // Shift the headings off the list of records.

    var schemaKeyList = ['dni', 'apellido', 'nombre', 'perfil' ,'ponderacion'];

    function postulanteFrom(row) {
        var postulante = {}
        postulante.apellido = row[1];
        postulante.nombre = row[2];
        postulante.dni = row[0];
        postulante.ponderacion = row[4];
        return postulante;
    }


    var nombre_perfil_row_anterior = "NINGUNO";
    var postulantes_del_perfil = [];
    var perfil = {};
    perfil.postulantes = [];

    function createDocRecurse (err) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        if (lineList.length) {
            var line = lineList.shift();
            var row = line.split(',')

            nombre_perfil_row = row[3];
            if (nombre_perfil_row_anterior == nombre_perfil_row) {
                perfil.postulantes.push(postulanteFrom(row));
            } else {
                perfil.nombre = nombre_perfil_row_anterior;

                insertPerfil(db, perfil);

                perfil = {};
                nombre_perfil_row_anterior = nombre_perfil_row;
                perfil.postulantes = [];
                postulante_a_agregar = postulanteFrom(row);
                perfil.postulantes.push(postulante_a_agregar);
            }
            createDocRecurse();
        } else {
            perfil.nombre = nombre_perfil_row_anterior;
            insertPerfil(db, perfil);

        }
    }

    createDocRecurse(null);
    console.log("Datos importados correctamente");
    process.exit(0);
    
});
    
