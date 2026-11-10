// Enumera las 4^12 combinaciones de respuestas posibles (por programacion
// dinamica sobre las sumas crudas de los 5 rasgos) y calcula que pokemon
// devuelve el algoritmo de respaldo (1-NN) en cada una.
//
// Uso: node scripts/alcanzabilidad.mjs
import { PREGUNTAS } from "../src/data/preguntas.js";
import { POKEMON_DATA } from "../src/data/pokemonData.js";
import { RASGOS, normalizarRaw, predecirPokemon } from "../src/models/modelo.js";

// Rango de la suma cruda de cada rasgo, para codificar un vector como un entero.
const min = {};
const base = {};
for (const r of RASGOS) {
  min[r] = PREGUNTAS.reduce((s, p) => s + Math.min(...p.opciones.map((o) => o.deltas[r] ?? 0)), 0);
  const max = PREGUNTAS.reduce((s, p) => s + Math.max(...p.opciones.map((o) => o.deltas[r] ?? 0)), 0);
  base[r] = max - min[r] + 1;
}
const pesos = {};
let acumulado = 1;
for (const r of RASGOS) {
  pesos[r] = acumulado;
  acumulado *= base[r];
}

// vectores crudos distintos -> numero de combinaciones de respuestas que lo producen
let estados = new Map([[0, 1]]);
for (const pregunta of PREGUNTAS) {
  const saltos = pregunta.opciones.map((o) => RASGOS.reduce((s, r) => s + (o.deltas[r] ?? 0) * pesos[r], 0));
  const siguiente = new Map();
  for (const [clave, n] of estados) {
    for (const salto of saltos) siguiente.set(clave + salto, (siguiente.get(clave + salto) ?? 0) + n);
  }
  estados = siguiente;
}

const offset = RASGOS.reduce((s, r) => s - min[r] * pesos[r], 0);
const victorias = new Array(POKEMON_DATA.length + 1).fill(0);
let total = 0;

for (const [clave, n] of estados) {
  const cod = clave + offset;
  const raw = {};
  for (const r of RASGOS) raw[r] = Math.floor(cod / pesos[r]) % base[r] + min[r];
  const v = normalizarRaw(raw, PREGUNTAS);

  let mejor = null;
  let mejorD = Infinity;
  for (const p of POKEMON_DATA) {
    let d = 0;
    for (const r of RASGOS) d += (v[r] - p[r]) ** 2;
    if (d < mejorD) {
      mejorD = d;
      mejor = p;
    }
  }
  victorias[mejor.id] += n;
  total += n;
}

// Comprobacion: el recorrido rapido coincide con el modelo real en unas muestras.
const muestra = [...estados.keys()].filter((_, i) => i % 50000 === 0);
for (const clave of muestra) {
  const cod = clave + offset;
  const raw = {};
  for (const r of RASGOS) raw[r] = Math.floor(cod / pesos[r]) % base[r] + min[r];
  const v = normalizarRaw(raw, PREGUNTAS);
  const real = predecirPokemon(v, 1)[0].pokemon;
  let mejor = null;
  let mejorD = Infinity;
  for (const p of POKEMON_DATA) {
    const d = RASGOS.reduce((s, r) => s + (v[r] - p[r]) ** 2, 0);
    if (d < mejorD) {
      mejorD = d;
      mejor = p;
    }
  }
  if (real.id !== mejor.id) throw new Error(`Discrepancia con predecirPokemon en ${clave}`);
}

const filas = POKEMON_DATA.map((p) => ({ nombre: p.nombre, n: victorias[p.id], pct: (victorias[p.id] / total) * 100 }))
  .sort((a, b) => b.pct - a.pct);
const inalcanzables = filas.filter((f) => f.n === 0);
const raros = filas.filter((f) => f.n > 0 && f.pct < 0.05);
const top10 = filas.slice(0, 10).reduce((s, f) => s + f.pct, 0);

console.log(`Combinaciones: ${total.toLocaleString("es")}  |  vectores distintos: ${estados.size.toLocaleString("es")}`);
console.log(`Pokemon que ganan alguna vez: ${filas.length - inalcanzables.length}/${filas.length}`);
console.log(`Inalcanzables (${inalcanzables.length}): ${inalcanzables.map((f) => f.nombre).join(", ") || "ninguno"}`);
console.log(`Casi inalcanzables, <0.05% (${raros.length}): ${raros.map((f) => `${f.nombre} ${f.pct.toFixed(3)}%`).join(", ") || "ninguno"}`);
console.log(`Top 10 concentra el ${top10.toFixed(1)}% de las rutas:`);
for (const f of filas.slice(0, 10)) console.log(`  ${f.nombre.padEnd(12)} ${f.pct.toFixed(2)}%`);
