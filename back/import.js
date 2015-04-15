var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/perfiles', function(err, res) {
    if(err) {
        console.log('ERROR: conectando la db. ' + err);
    } else {
        console.log('Conectado a la db');
    }
});

var fs = require('fs');
var lineList = fs.readFileSync('concursantes_ejemplo.csv').toString().split('\n');
lineList.shift(); // Shift the headings off the list of records.

var schemaKeyList = ['dni', 'apellido', 'nombre', 'perfil' ,'ponderacion'];

var PerfilSchema = new mongoose.Schema({
    nombre: String,
    documentacionRequerida: [String],
    postulantes: [{
        apellido: String,
        nombre: String,
        dni: String,
        ponderacion: Number,
        documentacionPresentada: [{
            documento: String,
            cantidadFojas: Number
        }]
    }]
});
var Perfil = mongoose.model('perfil', PerfilSchema);

function queryAllEntries () {
    /*Concursantes.aggregate(
        {$group: {_id: '$RepName', oppArray: {$push: {
            OppID: '$OppID', 
            OppName: '$OppName',
            PriorAmount: '$PriorAmount',
            Amount: '$Amount'
            }}
        }}, function(err, qDocList) {
        console.log(util.inspect(qDocList, false, 10));
        process.exit(0);
    });*/
}


function postulanteFrom(row) {
    var postulante = {}
    postulante.apellido = row[1];
    postulante.nombre = row[2];
    postulante.dni = row[0];
    postulante.ponderacion = row[4];
    console.log('crea el postulante ' + postulante);
    return postulante;
}

var nombre_perfil_row_anterior = "NINGUNO";
var postulantes_del_perfil = [];
var perfil = new Perfil();
// Recursively go through list adding documents.
// (This will overload the stack when lots of entries
// are inserted.  In practice I make heavy use the NodeJS 
// "async" module to avoid such situations.)
function createDocRecurse (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('registros restantes ', lineList.length)
    if (lineList.length) {
        var line = lineList.shift();
        var row = line.split(',')

        nombre_perfil_row = row[3];
        
        console.log('son iguales? ' + nombre_perfil_row_anterior + ' con ' + nombre_perfil_row);
        
        if (nombre_perfil_row_anterior == nombre_perfil_row) {
            console.log('debug permanece: ' + row);
            postulantes_del_perfil.concat(postulanteFrom(row));
        } else {
            console.log('debug cambia: ' + row);
            perfil.nombre = nombre_perfil_row_anterior;
            perfil.postulantes.push(postulantes_del_perfil);

            console.log('guarda ' + perfil);

            perfil = new Perfil();
            nombre_perfil_row_anterior = nombre_perfil_row;
            perfil.postulantes = [];
            postulante_a_agregar = postulanteFrom(row);
            console.log('agrega posulante ' +postulante_a_agregar.nombre);
            perfil.postulantes.push(postulante_a_agregar);
            console.log('y los post quedan ' + postulantes_del_perfil);
            createDocRecurse();
        }
        
        
        
        /*.forEach(function (entry, i) {
            perfil[schemaKeyList[i]] = entry;
            console.log(doc);
        });*/
        //perfil.save(createDocRecurse);
    } else {
        queryAllEntries();
    }
}

createDocRecurse(null);