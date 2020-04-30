/*jslint  esversion: 6 */

var express = require('express');

var fileUpload = require('express-fileupload');

var app = express();

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (request, response, next) => {

    var tipo = request.params.tipo;
    var id = request.params.id;

    // tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return response.status(400).json({

            ok: false,
            mensaje: 'Tipo de colección no es válido ',
            errors: { message: 'Los tipo de colección válidos son ' + tiposValidos.join(', ') },

        });

    }

    if (!request.files) {

        return response.status(400).json({

            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }

        });
    }

    // Obtner nombre del archivo 
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aeptamos 
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return response.status(400).json({

            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') },

        });

    }

    // Nombre de un archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un path en expecifico 
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {

            return response.status(500).json({

                ok: false,
                mensaje: 'error al mover archivo',
                errors: err,

            });

        }
        response.status(200).json({
            ok: true,
            mensaje: 'Petición realizada correctamente, archivo movido',
            nombre: nombreCortado,
            extensionArchivo: extensionArchivo,
            path: path,
            nombrear: nombreArchivo
        });

    });

});

module.exports = app;