const app = require("../src/app");
const request = require("supertest");

describe("Pruebas integrales", () => {
  it("debería responder con status code 200 para la página de inicio", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  it("debería redirigir a la página de inicio de not-found al intentar acceder a la página de administración sin haber iniciado sesión", async () => {
    const response = await request(app).get("/administracion");
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/not-found");
  });

  it("debería redirigir a la página de inicio después de iniciar sesión correctamente", async () => {
    const response = await request(app).post("/oauth").send({
      cedula: "1064980429",
      contrasena: "310712",
    });

    expect(response.statusCode).toBe(200);
  });

  it("debería cerrar sesión correctamente", async () => {
    const response = await request(app).get("/logout");
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/");
  });
});
