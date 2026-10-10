/* Validaciones con expresiones regulares para datos de Guatemala.
 * Funciona en el navegador (window.Validaciones) y en Node (require). */
const Validaciones = (() => {
  const ok = (detalle = "") => ({ valido: true, mensaje: "Valido", detalle });
  const mal = (mensaje) => ({ valido: false, mensaje, detalle: "" });

  // Departamentos de Guatemala y cantidad de municipios (usado por el DPI).
  const DEPARTAMENTOS = {
    1: ["Guatemala", 17], 2: ["El Progreso", 8], 3: ["Sacatepequez", 16],
    4: ["Chimaltenango", 16], 5: ["Escuintla", 13], 6: ["Santa Rosa", 14],
    7: ["Solola", 19], 8: ["Totonicapan", 8], 9: ["Quetzaltenango", 24],
    10: ["Suchitepequez", 21], 11: ["Retalhuleu", 9], 12: ["San Marcos", 30],
    13: ["Huehuetenango", 32], 14: ["Quiche", 21], 15: ["Baja Verapaz", 8],
    16: ["Alta Verapaz", 17], 17: ["Peten", 14], 18: ["Izabal", 5],
    19: ["Zacapa", 11], 20: ["Chiquimula", 11], 21: ["Jalapa", 7],
    22: ["Jutiapa", 17],
  };

  // Telefono: 8 digitos, inicia con 2-7, prefijo +502 opcional.
  const REGEX_TELEFONO = /^(?:\+?502[\s-]?)?([2-7]\d{3})[\s-]?(\d{4})$/;

  // DPI (CUI): 13 digitos, formato 4-5-4 con espacios o guiones opcionales.
  const REGEX_DPI = /^(\d{4})[\s-]?(\d{5})[\s-]?(\d{4})$/;

  // Correo electronico (sin puntos consecutivos).
  const REGEX_CORREO = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  // NIT: cuerpo numerico, guion y digito verificador (0-9 o K).
  const REGEX_NIT = /^(\d{1,12})-?([0-9Kk])$/;

  // Placa: tipo (P, M, C, A, O, U, TC, CD, CC, MI, E...) + 3 digitos + 3 letras.
  const REGEX_PLACA = /^(P|M|C|A|O|U|TC|CD|CC|MI|E|TRC|MB)-?(\d{3})([A-Z]{3})$/;

  // Codigo postal: 5 digitos; los 2 primeros son el departamento (01-22).
  const REGEX_CODIGO_POSTAL = /^(0[1-9]|1\d|2[0-2])\d{3}$/;

  // Zona: 1 a 25 (la ciudad de Guatemala tiene 22; otras ciudades llegan a 25).
  const REGEX_ZONA = /^(?:zona\s*)?([1-9]|1\d|2[0-5])$/i;

  // Quetzales: Q1,234.56 | Q 1234 | 1234.50
  const REGEX_QUETZALES = /^Q?\s?(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{1,2})?$/i;

  // Nombre: letras con tildes y enie, minimo dos palabras.
  const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}(?:[\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{1,})+$/;

  // Fecha dd/mm/aaaa
  const REGEX_FECHA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  function telefono(valor) {
    const m = REGEX_TELEFONO.exec(valor.trim());
    if (!m) return mal("Debe tener 8 digitos e iniciar con 2-7 (prefijo +502 opcional)");
    const tipo = "345".includes(m[1][0]) ? "Celular" : "Linea fija";
    return ok(`${tipo}: +502 ${m[1]}-${m[2]}`);
  }

  function dpi(valor) {
    const m = REGEX_DPI.exec(valor.trim());
    if (!m) return mal("Debe tener 13 digitos (formato 0000 00000 0000)");
    const cui = m[1] + m[2] + m[3];
    const cuerpo = cui.slice(0, 8);
    const verificador = Number(cui[8]);
    const depto = Number(cui.slice(9, 11));
    const muni = Number(cui.slice(11, 13));

    if (!DEPARTAMENTOS[depto]) return mal(`Codigo de departamento invalido (${cui.slice(9, 11)})`);
    const [nombreDepto, totalMunis] = DEPARTAMENTOS[depto];
    if (muni < 1 || muni > totalMunis) {
      return mal(`${nombreDepto} tiene ${totalMunis} municipios; el codigo ${cui.slice(11, 13)} no existe`);
    }
    let suma = 0;
    for (let i = 0; i < 8; i++) suma += Number(cuerpo[i]) * (i + 2);
    if (suma % 11 !== verificador) return mal("El digito verificador no coincide");
    return ok(`Departamento: ${nombreDepto}, municipio ${muni}`);
  }

  function correo(valor) {
    return REGEX_CORREO.test(valor.trim()) ? ok() : mal("Formato esperado: usuario@dominio.com");
  }

  function nit(valor) {
    const m = REGEX_NIT.exec(valor.trim());
    if (!m) return mal("Formato esperado: 1234567-8 (digito final 0-9 o K)");
    const cuerpo = m[1];
    let suma = 0;
    for (let i = 0; i < cuerpo.length; i++) {
      suma += Number(cuerpo[cuerpo.length - 1 - i]) * (i + 2);
    }
    const r = (11 - (suma % 11)) % 11;
    const esperado = r === 10 ? "K" : String(r);
    if (esperado !== m[2].toUpperCase()) return mal(`Digito verificador incorrecto (deberia ser ${esperado})`);
    return ok();
  }

  function placa(valor) {
    const m = REGEX_PLACA.exec(valor.trim().toUpperCase());
    if (!m) return mal("Formato esperado: P-123ABC");
    const tipos = {
      P: "Particular", M: "Moto", C: "Comercial", A: "Alquiler", O: "Oficial",
      U: "Urbano", TC: "Transporte de carga", CD: "Cuerpo diplomatico",
      CC: "Cuerpo consular", MI: "Mixto", E: "Exhibicion", TRC: "Remolque", MB: "Moto bus",
    };
    return ok(`Tipo: ${tipos[m[1]]}`);
  }

  function codigoPostal(valor) {
    const v = valor.trim();
    if (!REGEX_CODIGO_POSTAL.test(v)) return mal("5 digitos; los 2 primeros entre 01 y 22");
    return ok(`Departamento: ${DEPARTAMENTOS[Number(v.slice(0, 2))][0]}`);
  }

  function zona(valor) {
    return REGEX_ZONA.test(valor.trim()) ? ok() : mal("Zona del 1 al 25 (ej. 10 o Zona 10)");
  }

  function quetzales(valor) {
    return REGEX_QUETZALES.test(valor.trim()) ? ok() : mal("Formato esperado: Q1,234.56");
  }

  function nombre(valor) {
    return REGEX_NOMBRE.test(valor.trim()) ? ok() : mal("Nombre y apellido, solo letras");
  }

  function fecha(valor) {
    const m = REGEX_FECHA.exec(valor.trim());
    if (!m) return mal("Formato esperado: dd/mm/aaaa");
    const d = Number(m[1]), mes = Number(m[2]), a = Number(m[3]);
    const f = new Date(a, mes - 1, d);
    if (f.getFullYear() !== a || f.getMonth() !== mes - 1 || f.getDate() !== d) {
      return mal("La fecha no existe en el calendario");
    }
    return ok();
  }

  return {
    DEPARTAMENTOS, telefono, dpi, correo, nit, placa, codigoPostal, zona,
    quetzales, nombre, fecha,
  };
})();

if (typeof module !== "undefined") module.exports = Validaciones;
