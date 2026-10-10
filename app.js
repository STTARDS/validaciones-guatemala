const CAMPOS = [
  { id: "telefono", etiqueta: "Telefono", ejemplo: "5555-1234" },
  { id: "dpi", etiqueta: "DPI (CUI)", ejemplo: "2547 89632 0101" },
  { id: "correo", etiqueta: "Correo", ejemplo: "usuario@gmail.com" },
  { id: "nit", etiqueta: "NIT", ejemplo: "1234567-9" },
  { id: "placa", etiqueta: "Placa", ejemplo: "P-123ABC" },
  { id: "codigoPostal", etiqueta: "Codigo postal", ejemplo: "01010" },
  { id: "zona", etiqueta: "Zona", ejemplo: "Zona 10" },
  { id: "quetzales", etiqueta: "Monto (Q)", ejemplo: "Q1,250.50" },
  { id: "nombre", etiqueta: "Nombre completo", ejemplo: "Maria Lopez" },
  { id: "fecha", etiqueta: "Fecha", ejemplo: "15/09/2000" },
];

const cntOk = document.getElementById("cnt-ok");
const cntMal = document.getElementById("cnt-mal");
const cntReg = document.getElementById("cnt-reg");

// ---- Validador de campos ----
const contenedor = document.getElementById("campos");
const tarjetas = [];

function actualizarContadores() {
  cntOk.textContent = tarjetas.filter((t) => t.classList.contains("ok")).length;
  cntMal.textContent = tarjetas.filter((t) => t.classList.contains("mal")).length;
}

for (const campo of CAMPOS) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";

  const led = document.createElement("span");
  led.className = "led";

  const label = document.createElement("label");
  label.textContent = campo.etiqueta;
  const input = document.createElement("input");
  input.placeholder = campo.ejemplo;
  input.autocomplete = "off";
  input.spellcheck = false;
  label.appendChild(input);

  const estado = document.createElement("p");
  estado.className = "estado";
  estado.textContent = "> esperando datos...";

  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      tarjeta.className = "tarjeta";
      estado.textContent = "> esperando datos...";
    } else {
      const r = Validaciones[campo.id](input.value);
      tarjeta.className = "tarjeta " + (r.valido ? "ok" : "mal");
      estado.textContent = r.valido ? "[OK] " + (r.detalle || r.mensaje) : "[ERROR] " + r.mensaje;
    }
    actualizarContadores();
  });

  tarjeta.append(led, label, estado);
  contenedor.appendChild(tarjeta);
  tarjetas.push(tarjeta);
}

// ---- Registro con restricciones ----
const CLAVE = "personas-gt";
const form = document.getElementById("registro");
const consola = document.getElementById("errores");
const cuerpo = document.getElementById("personas");
const vacio = document.getElementById("vacio");

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
  vacio.hidden = personas.length > 0;
  cntReg.textContent = personas.length;
}

function mostrar(tipo, lineas) {
  consola.hidden = false;
  consola.className = "consola " + tipo;
  consola.replaceChildren(...lineas.map((l) => {
    const p = document.createElement("p");
    p.textContent = "> " + l;
    return p;
  }));
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
    mostrar("error", fallos);
    return;
  }
  personas.push({ nombre, dpi, correo, telefono: d.telefono.trim(), edad });
  guardar(personas);
  pintar();
  form.reset();
  mostrar("exito", ["Registro guardado correctamente."]);
});

document.getElementById("limpiar").addEventListener("click", () => {
  personas = [];
  guardar(personas);
  pintar();
  consola.hidden = true;
});

// ---- Reloj de la barra de tareas ----
const reloj = document.getElementById("reloj");
function tic() {
  reloj.textContent = new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
}
tic();
setInterval(tic, 10000);

pintar();
