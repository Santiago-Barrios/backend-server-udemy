/*jslint  esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

//==================================================================
//Obtener todos los usuarios
//==================================================================
app.get('/', (request, response, next) => {


    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                response.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                });

            });

});

//===============================================================================
// Actualizar Usuario
//===============================================================================
app.put('/:id', (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {

            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '.l.';

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
            });

        });

    });

});


//===============================================================================
// Crear un nuevo usuario 
//===============================================================================
app.post('/', (request, response) => {

    var body = request.body;
    var usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
        });
    });

});


module.exports = app;