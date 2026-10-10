// Pruebas: node --test
const test = require("node:test");
const assert = require("node:assert");
const V = require("./validaciones.js");

// Genera un DPI valido a partir de 8 digitos, depto y municipio.
function cuiValido(cuerpo, depto, muni) {
  let s = 0;
  for (let i = 0; i < 8; i++) s += Number(cuerpo[i]) * (i + 2);
  return cuerpo + (s % 11) + String(depto).padStart(2, "0") + String(muni).padStart(2, "0");
}

test("telefono", () => {
  for (const t of ["55551234", "5555-1234", "5555 1234", "+502 5555-1234", "22345678"]) assert.ok(V.telefono(t).valido, t);
  for (const t of ["15551234", "1234567", "555512345", "abcd1234", "+503 55551234"]) assert.ok(!V.telefono(t).valido, t);
});

test("dpi", () => {
  const bueno = cuiValido("25478963", 1, 1);
  assert.ok(V.dpi(bueno).valido);
  assert.ok(V.dpi(`${bueno.slice(0, 4)} ${bueno.slice(4, 9)} ${bueno.slice(9)}`).valido);
  assert.ok(V.dpi(cuiValido("12345678", 18, 5)).valido);
  assert.ok(!V.dpi(cuiValido("25478963", 18, 6)).valido, "Izabal solo tiene 5 municipios");
  assert.ok(!V.dpi(cuiValido("25478963", 23, 1)).valido, "depto inexistente");
  const malVerif = bueno.slice(0, 8) + ((Number(bueno[8]) + 1) % 10) + bueno.slice(9);
  assert.ok(!V.dpi(malVerif).valido);
  assert.ok(!V.dpi("12345").valido);
});

test("correo", () => {
  for (const c of ["juan@gmail.com", "ana.lopez+x@umg.edu.gt"]) assert.ok(V.correo(c).valido, c);
  for (const c of ["juan@", "@gmail.com", "juan@gmail", "a..b@x.com", "juan perez@x.com"]) assert.ok(!V.correo(c).valido, c);
});

test("nit", () => {
  // 1234567: suma = 7*2+6*3+5*4+4*5+3*6+2*7+1*8 = 112; (11 - 112%11) % 11 = (11-2)%11 = 9
  assert.ok(V.nit("1234567-9").valido);
  assert.ok(!V.nit("1234567-8").valido);
  assert.ok(!V.nit("abc").valido);
});

test("placa, codigo postal, zona, quetzales, nombre, fecha", () => {
  assert.ok(V.placa("P-123ABC").valido && V.placa("p123abc").valido);
  assert.ok(!V.placa("X-123ABC").valido && !V.placa("P-12ABC").valido);
  assert.ok(V.codigoPostal("01010").valido && !V.codigoPostal("00010").valido && !V.codigoPostal("23010").valido);
  assert.ok(V.zona("Zona 10").valido && V.zona("25").valido && !V.zona("26").valido && !V.zona("0").valido);
  assert.ok(V.quetzales("Q1,250.50").valido && V.quetzales("100").valido && !V.quetzales("Q1,25.5.0").valido);
  assert.ok(V.nombre("María López").valido && !V.nombre("Maria").valido && !V.nombre("Juan 123").valido);
  assert.ok(V.fecha("29/02/2024").valido && !V.fecha("29/02/2023").valido && !V.fecha("2024-01-01").valido);
});
