/*jslint  esversion: 6 */

var express = require('express');

var fileUpload = require('express-fileupload');

var app = express();

// default options
app.use(fileUpload());


app.put('/', (request, response, next) => {

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

    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente',
        nombre: nombreCortado,
        extensionArchivo: extensionArchivo,
    });
});

module.exports = app;