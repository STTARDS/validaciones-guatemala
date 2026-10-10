const CAMPOS = [
  { id: "telefono", etiqueta: "Telefono", ejemplo: "5555-1234", icono: "TEL", c1: "#05d9e8", c2: "#7b2ff7" },
  { id: "dpi", etiqueta: "DPI (CUI)", ejemplo: "2547 89633 0101", icono: "DPI", c1: "#ff2a6d", c2: "#d300c5" },
  { id: "correo", etiqueta: "Correo", ejemplo: "usuario@gmail.com", icono: "@", c1: "#ffd319", c2: "#ff901f" },
  { id: "nit", etiqueta: "NIT", ejemplo: "1234567-9", icono: "NIT", c1: "#39ff88", c2: "#05a8b8" },
  { id: "placa", etiqueta: "Placa", ejemplo: "P-123ABC", icono: "P", c1: "#ff901f", c2: "#ff2a6d" },
  { id: "codigoPostal", etiqueta: "Codigo postal", ejemplo: "01010", icono: "CP", c1: "#7b2ff7", c2: "#d300c5" },
  { id: "zona", etiqueta: "Zona", ejemplo: "Zona 10", icono: "Z", c1: "#05d9e8", c2: "#39ff88" },
  { id: "quetzales", etiqueta: "Monto en quetzales", ejemplo: "Q1,250.50", icono: "Q", c1: "#ffd319", c2: "#39ff88" },
  { id: "nombre", etiqueta: "Nombre completo", ejemplo: "Maria Lopez", icono: "Aa", c1: "#ff2a6d", c2: "#ff901f" },
  { id: "fecha", etiqueta: "Fecha", ejemplo: "15/09/2000", icono: "31", c1: "#d300c5", c2: "#05d9e8" },
];

const $ = (id) => document.getElementById(id);

// ---- Texto que se escribe solo ----
const frases = [
  "Sistema de validacion de datos",
  "Telefono, DPI, correo, NIT y mas",
  "Expresiones regulares en tiempo real",
];
(function escribir(i = 0, j = 0, borrando = false) {
  const frase = frases[i];
  $("maquina").textContent = frase.slice(0, j);
  if (!borrando && j < frase.length) return setTimeout(escribir, 55, i, j + 1, false);
  if (!borrando) return setTimeout(escribir, 1800, i, j, true);
  if (j > 0) return setTimeout(escribir, 25, i, j - 1, true);
  setTimeout(escribir, 300, (i + 1) % frases.length, 0, false);
})();

// ---- Contadores ----
function fijar(el, valor) {
  if (el.textContent === String(valor)) return;
  el.textContent = valor;
  el.classList.remove("salto");
  void el.offsetWidth;
  el.classList.add("salto");
}

// ---- Validador de campos ----
const tarjetas = [];

function actualizarResumen() {
  const ok = tarjetas.filter((t) => t.classList.contains("ok")).length;
  const mal = tarjetas.filter((t) => t.classList.contains("mal")).length;
  fijar($("cnt-ok"), ok);
  fijar($("cnt-mal"), mal);
  const pct = Math.round((ok / tarjetas.length) * 100);
  $("barra").style.width = pct + "%";
  $("pct").textContent = pct + "%";
}

for (const campo of CAMPOS) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta revelar";

  const cabeza = document.createElement("div");
  cabeza.className = "tarjeta-cabeza";

  const icono = document.createElement("span");
  icono.className = "icono";
  icono.textContent = campo.icono;
  icono.style.setProperty("--c1", campo.c1);
  icono.style.setProperty("--c2", campo.c2);

  const textos = document.createElement("div");
  const titulo = document.createElement("div");
  titulo.className = "tarjeta-titulo";
  titulo.textContent = campo.etiqueta;
  const ejemplo = document.createElement("div");
  ejemplo.className = "tarjeta-ejemplo";
  ejemplo.textContent = "Ej. " + campo.ejemplo;
  textos.append(titulo, ejemplo);

  const marca = document.createElement("span");
  marca.className = "marca-estado";
  marca.setAttribute("aria-hidden", "true");

  cabeza.append(icono, textos, marca);

  const input = document.createElement("input");
  input.placeholder = campo.ejemplo;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", campo.etiqueta);

  const estado = document.createElement("p");
  estado.className = "estado";
  estado.textContent = "Esperando datos...";

  let espera;
  input.addEventListener("input", () => {
    clearTimeout(espera);
    const valor = input.value;
    const antes = tarjeta.classList.contains("mal");
    tarjeta.classList.remove("ok", "mal", "sacudir");
    if (!valor.trim()) {
      estado.textContent = "Esperando datos...";
      marca.textContent = "";
    } else {
      const r = Validaciones[campo.id](valor);
      tarjeta.classList.add(r.valido ? "ok" : "mal");
      marca.textContent = r.valido ? "✓" : "!";
      estado.textContent = r.valido ? (r.detalle || "Dato valido") : r.mensaje;
      estado.classList.remove("nuevo");
      void estado.offsetWidth;
      estado.classList.add("nuevo");
      // Sacude la tarjeta cuando se deja de escribir con un error nuevo.
      if (!r.valido && !antes) {
        espera = setTimeout(() => tarjeta.classList.add("sacudir"), 450);
      }
    }
    actualizarResumen();
  });

  tarjeta.append(cabeza, input, estado);
  $("campos").appendChild(tarjeta);
  tarjetas.push(tarjeta);
}

// ---- Notificaciones ----
function notificar(tipo, titulo, lineas) {
  const t = document.createElement("div");
  t.className = "toast " + tipo;
  const b = document.createElement("b");
  b.textContent = titulo;
  t.appendChild(b);
  for (const l of lineas) {
    const p = document.createElement("div");
    p.textContent = "• " + l;
    t.appendChild(p);
  }
  $("toasts").appendChild(t);
  setTimeout(() => {
    t.classList.add("salir");
    t.addEventListener("animationend", () => t.remove());
  }, 4500);
}

// ---- Registro con restricciones ----
const CLAVE = "personas-gt";
const form = $("registro-form");

function cargar() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
}
function guardar(lista) {
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}

let personas = cargar();

function pintar(animarUltima = false) {
  const cuerpo = $("personas");
  cuerpo.replaceChildren();
  personas.forEach((p, i) => {
    const fila = document.createElement("tr");
    if (animarUltima && i === personas.length - 1) fila.className = "nueva";
    for (const v of [p.nombre, p.dpi, p.correo, p.telefono, p.edad]) {
      const td = document.createElement("td");
      td.textContent = v;
      fila.appendChild(td);
    }
    cuerpo.appendChild(fila);
  });
  $("vacio").hidden = personas.length > 0;
  fijar($("cnt-reg"), personas.length);
}

function marcarError(nombre, conError) {
  const label = form.elements[nombre].closest(".campo-form");
  label.classList.remove("error");
  if (conError) {
    void label.offsetWidth;
    label.classList.add("error");
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
  const malos = new Set();

  // NOT NULL
  if (!nombre) { fallos.push("NOT NULL: el nombre es obligatorio."); malos.add("nombre"); }
  else if (!Validaciones.nombre(nombre).valido) { fallos.push("Nombre: " + Validaciones.nombre(nombre).mensaje); malos.add("nombre"); }

  // CHECK
  const rDpi = Validaciones.dpi(d.dpi);
  if (!rDpi.valido) { fallos.push("CHECK: DPI invalido. " + rDpi.mensaje); malos.add("dpi"); }
  if (d.edad === "" || !Number.isInteger(edad) || edad < 18) { fallos.push("CHECK: la edad debe ser 18 o mayor."); malos.add("edad"); }

  const rCorreo = Validaciones.correo(d.correo);
  if (!rCorreo.valido) { fallos.push("Correo: " + rCorreo.mensaje); malos.add("correo"); }
  const rTel = Validaciones.telefono(d.telefono);
  if (!rTel.valido) { fallos.push("Telefono: " + rTel.mensaje); malos.add("telefono"); }

  // UNIQUE
  if (rDpi.valido && personas.some((p) => p.dpi === dpi)) { fallos.push("UNIQUE: ese DPI ya esta registrado."); malos.add("dpi"); }
  if (rCorreo.valido && personas.some((p) => p.correo === correo)) { fallos.push("UNIQUE: ese correo ya esta registrado."); malos.add("correo"); }

  for (const n of ["nombre", "dpi", "correo", "telefono", "edad"]) marcarError(n, malos.has(n));

  if (fallos.length) {
    notificar("error", "No se pudo guardar", fallos);
    return;
  }
  personas.push({ nombre, dpi, correo, telefono: d.telefono.trim(), edad });
  guardar(personas);
  pintar(true);
  form.reset();
  notificar("ok", "Registro guardado", [nombre + " fue agregado."]);
});

$("limpiar").addEventListener("click", () => {
  personas = [];
  guardar(personas);
  pintar();
  notificar("ok", "Registro vaciado", ["Se borraron todos los registros."]);
});

// ---- Aparicion al hacer scroll ----
const observador = new IntersectionObserver((entradas) => {
  for (const en of entradas) {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      observador.unobserve(en.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll(".revelar").forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.08 + "s";
  observador.observe(el);
});

pintar();
