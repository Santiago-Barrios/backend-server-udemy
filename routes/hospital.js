/*jslint  esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutebtificacion = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

//==================================================================
//Obtener todos los hospitales
//==================================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(8)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hodpitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    response.status(200).json({

                        ok: true,
                        total_Hospitales: conteo,
                        hospitales: hospitales,
                    });

                });


            });

});

//===============================================================================
// Actualizar hospital
//===============================================================================
app.put('/:id', mdAutebtificacion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {

            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
            });

        });

    });

});

//===============================================================================
// Crear un nuevo hospital 
//===============================================================================
app.post('/', mdAutebtificacion.verificaToken, (request, response) => {

    var body = request.body;
    var hospital = new Hospital({

        nombre: body.nombre,
        usuario: request.usuario._id,

    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });
    });

});

//===============================================================================
// Borrar un Hospital por el id
//===============================================================================
app.delete('/:id', mdAutebtificacion.verificaToken, (request, response) => {

    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Hospital',
                errors: err
            });
        }

        if (!hospitalDelete) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'El hospital ha sido borrado o el ID no existe' },
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalDelete,
        });
    });


});

module.exports = app;