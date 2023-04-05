const controller = {};

// Controlador para la página de ingreso de usuario
controller.ingreso = (req, res) => {
  // Si el usuario ya tiene una sesión iniciada, redirecciona a la página de inicio
  if (req.cookies.usuario !== undefined) {
    res.redirect("/inicio");
    return;
  }

  // Si no hay una sesión iniciada, muestra la página de ingreso de usuario con una notificación vacía
  res.render("ingreso_usuario", {
    notificacion: "",
  });
};

// Controlador para el inicio de sesión mediante OAuth
controller.oauth = (req, res) => {
  const cedula = req.body.cedula;
  const contrasena = req.body.contrasena;

  // Realiza una consulta a la base de datos para verificar que las credenciales del usuario sean correctas
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM usuarios WHERE cedula = ? AND contrasena = ?",
      [cedula, contrasena],
      (err, usuario) => {
        // Si no se encuentra un usuario con esas credenciales, muestra un mensaje de error en la página de ingreso de usuario
        if (usuario.length === 0) {
          res.render("ingreso_usuario", {
            notificacion: "Usuario o contraseña incorrectos",
          });
          return;
        }
        // Si las credenciales son correctas, crea una cookie con la información del usuario y redirecciona a la página de inicio
        res.cookie("usuario", usuario[0]);
        res.redirect("/inicio");
      }
    );
  });
};

// Controlador para la página de inicio
controller.inicio = (req, res) => {
  // Verifica que el usuario tenga una sesión iniciada
  const usuario = verificarSesion(req, res);
  try {
    // Muestra la página de inicio con la información del usuario
    res.render("inicio", {
      user: usuario,
    });
  } catch (error) {}
};

// Controlador para cerrar sesión
controller.logout = (req, res) => {
  // Elimina la cookie del usuario y redirecciona a la página principal
  res.clearCookie("usuario");
  res.redirect("/");
};

// Controlador para la página de administración
controller.administracion = (req, res) => {
  // Verifica que el usuario tenga una sesión iniciada
  const usuario = verificarSesion(req, res);
  if (usuario === undefined) {
    return;
  }
  // Si el usuario es un administrador, muestra la página de administración con su información
  res.render("administracion", {
    user: usuario,
  });
};

// Controlador para la página de registro
controller.registrar = (req, res) => {
  try {
    const usuario = req.cookies.usuario;

    // Si el usuario no tiene una sesión iniciada, muestra la página de registro para usuarios con información vacía
    if (usuario === undefined) {
      res.render("registro", {
        data: "usuario",
        user: undefined,
      });
      return;
    }

    // Si el usuario es un administrador, muestra la página de registro para administradores con su información
    res.render("registro", {
      data: "admin",
      user: usuario,
    });
  } catch (error) {
    res.json(error);
  }
};

//Controlador para registrar un usuario en la base de datos
controller.registrarUsuario = (req, res) => {
  const usuario = req.body;
  const user = req.cookies.usuario;
  //Conexión a la base de datos
  req.getConnection((err, conn) => {
    //Insertar el usuario en la tabla 'usuarios'
    conn.query("INSERT INTO usuarios SET ?", [usuario], (err, usuario) => {
      //Si hay un usuario logueado, redireccionar a la página de administración
      if (user !== undefined) {
        res.redirect("/administracion");
        return;
      }
      //Si no hay un usuario logueado, redireccionar a la página de inicio
      res.redirect("/");
    });
  });
};

//Controlador para renderizar la página de solicitud de mantenimiento
controller.solicitud = (req, res) => {
  const user = verificarSesion(req, res);
  try {
    res.render("solicitud", {
      user: user,
    });
  } catch (error) {}
};

//Controlador para reportar un mantenimiento
controller.reportar = (req, res) => {
  const usuario = verificarSesion(req, res);
  const solicitud = req.body;
  //Añadir el id del usuario que reporta el mantenimiento y el área a la que pertenece a la solicitud
  solicitud.id_user = usuario.id;
  solicitud.area = usuario.area;
  //Conexión a la base de datos
  req.getConnection((err, conn) => {
    //Insertar la solicitud en la tabla 'mantenimientos'
    conn.query(
      "INSERT INTO mantenimientos SET ?",
      [solicitud],
      (err, result) => {
        //Redireccionar a la página de inicio
        res.redirect("/inicio");
      }
    );
  });
};

//Controlador para renderizar la página de asignación de trabajadores a los mantenimientos pendientes
controller.asignacion = (req, res) => {
  const usuario = verificarSesion(req, res);
  let trabajadores = {};
  //Conexión a la base de datos
  req.getConnection((err, conn) => {
    //Seleccionar los id y nombres de los usuarios con rol 'Soporte Tecnico'
    conn.query(
      "SELECT id,nombre FROM usuarios WHERE rol = 'Soporte Tecnico'",
      (err, rows) => {
        rows.forEach((trabajador) => {
          trabajadores[trabajador.id] = trabajador.nombre;
        });
      }
    );
    //Seleccionar los mantenimientos que estén pendientes de asignación
    conn.query(
      "SELECT * FROM mantenimientos WHERE mantenimiento = '0'",
      (err, mantenimientos) => {
        //Renderizar la página 'asignacion' con los datos de los mantenimientos pendientes y los trabajadores disponibles
        res.render("asignacion", {
          data: mantenimientos,
          trabajadores: trabajadores,
          user: usuario,
        });
      }
    );
  });
};

// Define el controlador de asignar trabajo a un técnico
controller.asignar = (req, res) => {
  const data = req.body;
  // Establece una conexión a la base de datos
  req.getConnection((err, conn) => {
    // Ejecuta una consulta para actualizar el técnico asignado al trabajo
    conn.query(
      "UPDATE mantenimientos SET id_trabajador = ? WHERE id = ?",
      [data.id_trabajador, data.id],
      (err, result) => {
        // Redirige a la página de asignación de trabajos
        res.redirect("/asignacion");
      }
    );
  });
};

// Define el controlador de mostrar los trabajos por asignar
controller.asignaciones = (req, res) => {
  const usuario = verificarSesion(req, res);
  let trabajadores = {};
  // Establece una conexión a la base de datos
  req.getConnection((err, conn) => {
    // Ejecuta una consulta para obtener los técnicos disponibles
    conn.query(
      "SELECT id,nombre FROM usuarios WHERE rol = 'Soporte Tecnico'",
      (err, rows) => {
        // Crea un objeto con los técnicos disponibles
        rows.forEach((trabajador) => {
          trabajadores[trabajador.id] = trabajador.nombre;
        });
      }
    );

    // Ejecuta una consulta para obtener los trabajos por asignar
    conn.query(
      "SELECT * FROM mantenimientos WHERE mantenimiento = '0'",
      (err, mantenimientos) => {
        // Renderiza la vista de asignaciones con los trabajos y técnicos disponibles
        res.render("asignaciones", {
          data: mantenimientos,
          trabajadores: trabajadores,
          user: usuario,
        });
      }
    );
  });
};

// Función para obtener los mantenimientos realizados
controller.mantenimientos = (req, res) => {
  const usuario = verificarSesion(req, res);

  // Realiza una consulta a la base de datos para obtener los mantenimientos realizados
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM mantenimientos WHERE mantenimiento='1'",
      (err, mantenimientos) => {
        // Renderiza la vista de mantenimientos y le pasa la información obtenida
        res.render("mantenimientos", {
          data: mantenimientos,
          user: usuario,
        });
      }
    );
  });
};

// Función para buscar un mantenimiento en particular
controller.buscarMantenimiento = (req, res) => {
  const usuario = verificarSesion(req, res);
  const key = req.body.key;

  // Si la clave de búsqueda está vacía, redirige a la página de mantenimientos
  if (key == "") {
    res.redirect("/mantenimientos");
    return;
  }

  // Realiza una consulta a la base de datos para buscar el mantenimiento
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM mantenimientos WHERE mantenimiento='1' AND (nombre LIKE '%" +
        key +
        "%' OR marca LIKE '%" +
        key +
        "%' OR modelo LIKE '%" +
        key +
        "%' OR serie LIKE '%" +
        key +
        "%' OR area LIKE '%" +
        key +
        "%' OR fecha LIKE '%" +
        key +
        "%')",
      (err, mantenimientos) => {
        // Renderiza la vista de mantenimientos y le pasa la información obtenida
        res.render("mantenimientos", {
          data: mantenimientos,
          user: usuario,
        });
      }
    );
  });
};

// Define el controlador para la lista de trabajos asignados a un trabajador
controller.listaTrabajos = (req, res) => {
  // Verifica la sesión del usuario
  verificarSesion(req, res);

  // Obtiene los datos del usuario desde las cookies
  const usuario = req.cookies.usuario;

  // Consulta los trabajos asignados a un usuario en la base de datos
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM mantenimientos WHERE id_trabajador = ?",
      [usuario.id],
      (err, mantenimientos) => {
        // Renderiza la vista lista_trabajos con los datos obtenidos
        res.render("lista_trabajos", {
          data: mantenimientos,
          user: usuario,
        });
      }
    );
  });
};

// Define el controlador para informar sobre el mantenimiento realizado
controller.informar = (req, res) => {
  // Verifica la sesión del usuario
  verificarSesion(req, res);

  // Obtiene el ID del mantenimiento que se va a informar desde los parámetros de la solicitud
  const id = req.params.id;

  // Consulta el mantenimiento en la base de datos
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM mantenimientos WHERE id = ?",
      [id],
      (err, rows) => {
        // Renderiza la vista generar_informe con los datos obtenidos
        res.render("generar_informe", {
          data: rows[0],
        });
      }
    );
  });
};

// Controlador para generar informe de un trabajo y actualizar su estado
controller.generarInforme = (req, res) => {
  verificarSesion(req, res); // verifica si hay sesión iniciada
  const data = req.body; // obtiene los datos enviados en el cuerpo de la solicitud
  const id = req.params.id; // obtiene el parámetro de la ruta (el ID del mantenimiento)
  data.mantenimiento = 1; // establece la propiedad 'mantenimiento' de los datos en 1

  req.getConnection((err, conn) => {
    // se establece una conexión a la base de datos
    conn.query(
      "UPDATE mantenimientos set ? WHERE id = ?", // se ejecuta una consulta SQL para actualizar el mantenimiento con los nuevos datos
      [data, id], // se pasan los datos y el ID como parámetros de la consulta
      (err, rows) => {
        if (err) {
          res.json(err); // si ocurre un error, se responde con un objeto JSON que contiene información sobre el error
        }
        res.redirect("/lista-trabajos"); // si todo sale bien, se redirige a la página de la lista de trabajos
      }
    );
  });
};

// Controlador para visualizar el informe de un trabajo
controller.verInforme = (req, res) => {
  const usuario = verificarSesion(req, res); // verifica si hay sesión iniciada

  const id = req.params.id; // obtiene el parámetro de la ruta (el ID del mantenimiento)

  req.getConnection((err, conn) => {
    // se establece una conexión a la base de datos
    conn.query(
      "SELECT * FROM mantenimientos WHERE id = ?", // se ejecuta una consulta SQL para obtener el mantenimiento con el ID especificado
      [id], // se pasa el ID como parámetro de la consulta
      (err, rows) => {
        res.render("ver_informe", {
          // se renderiza la plantilla 'ver_informe' con los datos obtenidos
          data: rows[0], // se pasa el primer resultado (ya que solo se espera un resultado) como datos de la plantilla
          user: usuario, // se pasa el usuario como datos de la plantilla
        });
      }
    );
  });
};

// Función para generar los indicadores de mantenimientos reparados por mes
controller.indicadores = (req, res) => {
  // Verificar si el usuario está autenticado y obtener sus datos
  const user = verificarSesion(req, res);

  // Realizar la conexión a la base de datos
  req.getConnection((err, conn) => {
    // Inicializar la variable "no_reparados" a cero
    let no_reparados = 0;

    // Consultar la cantidad de mantenimientos no reparados
    conn.query(
      "SELECT COUNT(*) AS cantidad FROM mantenimientos WHERE mantenimiento='0'",
      (err, rows) => {
        no_reparados = rows[0].cantidad;
      }
    );

    // Consultar los mantenimientos reparados por mes
    conn.query(
      `SELECT 
        MONTHNAME(fecha) AS mes, 
        COUNT(*) AS cantidad
        FROM mantenimientos 
        WHERE mantenimiento='1'
        GROUP BY YEAR(fecha), MONTH(fecha), fecha
    `,
      (err, resultados) => {
        if (err) {
          res.json(err);
        }

        // Creamos un objeto para hacer el seguimiento de las cantidades de mantenimientos reparados por mes.
        const mesesCantidades = {};

        // Recorrer los resultados y agregar los datos al objeto "mesesCantidades"
        resultados.forEach((resultado) => {
          const mes = resultado.mes;
          const cantidad = resultado.cantidad;

          if (mes in mesesCantidades) {
            mesesCantidades[mes] += cantidad;
          } else {
            mesesCantidades[mes] = cantidad;
          }
        });

        // Crear arrays para los meses y cantidades
        const meses = Object.keys(mesesCantidades);
        const cantidades = Object.values(mesesCantidades);

        // Calcular la cantidad total de mantenimientos reparados
        const reparados = cantidades.reduce((a, b) => a + b, 0);

        // Renderizar la vista de los indicadores y pasarle los datos necesarios
        res.render("indicadores", {
          meses: meses,
          cantidades: cantidades,
          reparaciones: [reparados, no_reparados],
          user,
        });
      }
    );
  });
};

// Acción para manejar el error 404
controller.error = (req, res) => {
  res.status(404).render("404");
};

// Función para verificar si el usuario ha iniciado sesión
function verificarSesion(req, res) {
  const usuario = req.cookies.usuario;
  if (usuario === undefined) {
    res.redirect("/");
    return;
  }
  return usuario;
}

// Exportar el controlador
module.exports = controller;
