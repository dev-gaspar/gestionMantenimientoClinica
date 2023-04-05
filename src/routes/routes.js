const express = require("express");
const router = express.Router();
const Middleware = require("./middleware");

const Controller = require("../controllers/Controller");

router.get("/", Controller.ingreso);
router.post("/oauth", Controller.oauth);
router.get("/inicio", Controller.inicio);
router.get("/logout", Controller.logout);
router.get("/solicitud", Controller.solicitud);
router.post("/reportar", Controller.reportar);
router.get("/asignaciones", Controller.asignaciones);
router.get("/mantenimientos", Controller.mantenimientos);
router.get("/ver-informe/:id", Controller.verInforme);
router.post("/buscar-mantenimiento", Controller.buscarMantenimiento);

router.get("/lista-trabajos", Middleware.checkRole, Controller.listaTrabajos);
router.get("/informar/:id", Middleware.checkRole, Controller.informar);
router.post("/informar/:id", Middleware.checkRole, Controller.generarInforme);

router.get("/registrar", Controller.registrar);
router.post("/registrar", Controller.registrarUsuario);

router.get(
  "/administracion",
  Middleware.checkAdminRole,
  Controller.administracion
);
router.get("/asignacion", Middleware.checkAdminRole, Controller.asignacion);
router.post("/asignar", Middleware.checkAdminRole, Controller.asignar);
router.get("/indicadores", Middleware.checkAdminRole, Controller.indicadores);

router.get("/not-found", Controller.error);

module.exports = router;
