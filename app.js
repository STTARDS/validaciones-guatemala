const CAMPOS = [
  { id: "telefono", etiqueta: "Telefono", ejemplo: "5555-1234 o +502 5555 1234" },
  { id: "dpi", etiqueta: "DPI (CUI)", ejemplo: "2547 89632 0101" },
  { id: "correo", etiqueta: "Correo electronico", ejemplo: "usuario@gmail.com" },
  { id: "nit", etiqueta: "NIT", ejemplo: "1234567-8" },
  { id: "placa", etiqueta: "Placa de vehiculo", ejemplo: "P-123ABC" },
  { id: "codigoPostal", etiqueta: "Codigo postal", ejemplo: "01010" },
  { id: "zona", etiqueta: "Zona", ejemplo: "Zona 10" },
  { id: "quetzales", etiqueta: "Monto en quetzales", ejemplo: "Q1,250.50" },
  { id: "nombre", etiqueta: "Nombre completo", ejemplo: "Maria Lopez" },
  { id: "fecha", etiqueta: "Fecha", ejemplo: "15/09/2000" },
];

// ---- Validador de campos ----
const contenedor = document.getElementById("campos");
for (const campo of CAMPOS) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";

  const label = document.createElement("label");
  label.textContent = campo.etiqueta;
  const input = document.createElement("input");
  input.placeholder = campo.ejemplo;
  input.autocomplete = "off";
  label.appendChild(input);

  const estado = document.createElement("p");
  estado.className = "estado";

  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      tarjeta.className = "tarjeta";
      estado.textContent = "";
      return;
    }
    const r = Validaciones[campo.id](input.value);
    tarjeta.className = "tarjeta " + (r.valido ? "ok" : "mal");
    estado.textContent = r.valido ? "✓ " + (r.detalle || r.mensaje) : "✗ " + r.mensaje;
  });

  tarjeta.append(label, estado);
  contenedor.appendChild(tarjeta);
}

// ---- Registro con restricciones ----
const CLAVE = "personas-gt";
const form = document.getElementById("registro");
const errores = document.getElementById("errores");
const cuerpo = document.getElementById("personas");

function cargar() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
}
function guardar(lista) {
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}

let personas = cargar();

function pintar() {
  cuerpo.replaceChildren();
  for (const p of personas) {
    const fila = document.createElement("tr");
    for (const v of [p.nombre, p.dpi, p.correo, p.telefono, p.edad]) {
      const td = document.createElement("td");
      td.textContent = v;
      fila.appendChild(td);
    }
    cuerpo.appendChild(fila);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const nombre = d.nombre.trim();
  const dpi = d.dpi.replace(/[\s-]/g, "");
  const correo = d.correo.trim().toLowerCase();
  const edad = Number(d.edad);
  const fallos = [];

  // NOT NULL
  if (!nombre) fallos.push("NOT NULL: el nombre es obligatorio.");
  else if (!Validaciones.nombre(nombre).valido) fallos.push("Nombre invalido: " + Validaciones.nombre(nombre).mensaje);

  // CHECK
  const rDpi = Validaciones.dpi(d.dpi);
  if (!rDpi.valido) fallos.push("CHECK: DPI invalido. " + rDpi.mensaje);
  if (d.edad === "" || !Number.isInteger(edad) || edad < 18) fallos.push("CHECK: la edad debe ser 18 o mayor.");

  const rCorreo = Validaciones.correo(d.correo);
  if (!rCorreo.valido) fallos.push("Correo invalido. " + rCorreo.mensaje);
  const rTel = Validaciones.telefono(d.telefono);
  if (!rTel.valido) fallos.push("Telefono invalido. " + rTel.mensaje);

  // UNIQUE
  if (rDpi.valido && personas.some((p) => p.dpi === dpi)) fallos.push("UNIQUE: ese DPI ya esta registrado.");
  if (rCorreo.valido && personas.some((p) => p.correo === correo)) fallos.push("UNIQUE: ese correo ya esta registrado.");

  if (fallos.length) {
    errores.className = "error";
    errores.textContent = fallos.join(" ");
    return;
  }
  personas.push({ nombre, dpi, correo, telefono: d.telefono.trim(), edad });
  guardar(personas);
  pintar();
  form.reset();
  errores.className = "exito";
  errores.textContent = "Persona registrada correctamente.";
});

document.getElementById("limpiar").addEventListener("click", () => {
  personas = [];
  guardar(personas);
  pintar();
  errores.textContent = "";
});

pintar();
