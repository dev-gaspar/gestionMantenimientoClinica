const middleware = {};

// Middleware para verificar el rol del usuario
middleware.checkRole = (req, res, next) => {
  const user = req.cookies.usuario;

  // Verificar si el usuario tiene el rol de soporte tecnico o admin
  if (user && (user.rol === "Soporte Tecnico" || user.rol === "admin")) {
    // Permitir acceso si el usuario tiene el rol necesario
    next();
  } else {
    // Redirigir a una página de error si el usuario no tiene el rol necesario
    res.redirect("/not-found");
  }
};

// Middleware para verificar el rol del usuario
middleware.checkAdminRole = (req, res, next) => {
  const user = req.cookies.usuario;

  // Verificar si el usuario tiene el rol de admin
  if (user && user.rol === "admin") {
    // Permitir acceso si el usuario tiene el rol de admin
    next();
  } else {
    // Redirigir a una página de error si el usuario no tiene el rol de admin
    res.redirect("/not-found");
  }
};

module.exports = middleware;
