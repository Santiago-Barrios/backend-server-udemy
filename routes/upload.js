/*jslint  esversion: 6 */

var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());


app.post('/:tipo/:id', (request, response, next) => {

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

        subirPorTipo(tipo, id, nombreArchivo, response);

        // response.status(200).json({

        //     ok: true,
        //     mensaje: 'Petición realizada correctamente, archivo movido',
        //     extensionArchivo: extensionArchivo,

        // });

    });

});



function subirPorTipo(tipo, id, nombreArchivo, response) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (err) {

                return response.status(500).json({

                    ok: false,
                    mensaje: 'error al actualizar usuario',
                    errors: err,

                });

            }

            if (!usuario) {

                return response.status(400).json({

                    ok: false,
                    mensaje: ' usuario no existe',
                    errors: { message: 'Usuario no existe' },

                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return response.status(200).json({

                    ok: true,
                    mensaje: 'imagen de usuario actualizado',
                    usuario: usuarioActualizado,

                });
            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (err) {

                return response.status(500).json({

                    ok: false,
                    mensaje: 'error al actualizar medico',
                    errors: err,

                });

            }

            if (!medico) {

                return response.status(400).json({

                    ok: false,
                    mensaje: ' medico no existe',
                    errors: { message: 'Medico no existe' },

                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return response.status(200).json({

                    ok: true,
                    mensaje: 'imagen de medico actualizado',
                    medico: medicoActualizado,

                });
            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {

                return response.status(500).json({

                    ok: false,
                    mensaje: 'error al actualizar hospital',
                    errors: err,

                });

            }

            if (!hospital) {

                return response.status(400).json({

                    ok: false,
                    mensaje: ' hospital no existe',
                    errors: { message: 'Hospital no existe' },

                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return response.status(200).json({

                    ok: true,
                    mensaje: 'imagen de hospital actualizado',
                    hospital: hospitalActualizado,

                });
            });

        });

    }

}

module.exports = app;