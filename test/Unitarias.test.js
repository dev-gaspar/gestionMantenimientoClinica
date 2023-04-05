const app = require("../src/app");
const request = require("supertest");

describe("GET /logout", () => {
  test("debería responder con un código de estado 302 y borrar la cookie 'usuario'", async () => {
    const agent = request.agent(app);
    await agent.post("/oauth").send({
      cedula: "1064980429",
      contrasena: "310712",
    }); // Iniciar sesión antes de hacer logout

    const response = await agent.get("/logout").send();
    expect(response.statusCode).toBe(302);
    expect(response.headers["set-cookie"][0]).toMatch(/usuario=;/);
  });
});

describe("POST /asignar", () => {
  test("debería responder con un código de estado 302 y redirigir al usuario a la página de not-found antes deberia iniciar sesion", async () => {
    const response = await request(app)
      .post("/asignar")
      .send({ id_trabajador: 1, id: 2 });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/not-found");
  });
});
