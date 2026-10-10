# VALIDA.EXE

Pagina web con estilo retro (HTML + CSS + JavaScript, sin dependencias) con
validaciones por expresiones regulares y restricciones de datos.

Demo: https://sttards.github.io/validaciones-guatemala/

## Validaciones

| Campo | Regla |
|-------|-------|
| Telefono | 8 digitos, inicia con 2-7, `+502` opcional; distingue celular / linea fija |
| DPI (CUI) | 13 digitos, digito verificador (modulo 11), departamento 01-22 y municipio existente |
| Correo | `usuario@dominio.ext`, sin puntos consecutivos |
| NIT | cuerpo numerico + digito verificador (0-9 o K) |
| Placa | `P-123ABC` con tipo de vehiculo |
| Codigo postal | 5 digitos, prefijo de departamento 01-22 |
| Zona | 1 a 25 |
| Quetzales | `Q1,250.50` |
| Nombre | letras con tildes y enie, nombre y apellido |
| Fecha | `dd/mm/aaaa` existente en el calendario |

## Restricciones (registro de personas)

- **NOT NULL**: el nombre es obligatorio.
- **UNIQUE**: DPI y correo no pueden repetirse.
- **CHECK**: edad mayor o igual a 18 y DPI valido.

## Archivos

- `index.html`, `styles.css`, `app.js` - interfaz
- `validaciones.js` - logica de validacion
- `validaciones.test.js` - pruebas (`node --test`)
