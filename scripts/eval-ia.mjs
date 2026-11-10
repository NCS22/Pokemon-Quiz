// Mide la diversidad de resultados del agente: lo ejecuta con perfiles de
// respuestas variados y cuenta que Pokemon salen y cuales se repiten.
// Hace llamadas REALES a la API (coste), asi que se lanza a mano.
//
// Uso: node --env-file=.env.local scripts/eval-ia.mjs [numPerfiles=60] [concurrencia=3]
import Anthropic from "@anthropic-ai/sdk";
import { PREGUNTAS } from "../src/data/preguntas.js";
import { investigar } from "../api/predecir.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Falta ANTHROPIC_API_KEY (usa --env-file=.env.local).");
  process.exit(1);
}

const total = Number(process.argv[2]) || 60;
const concurrencia = Number(process.argv[3]) || 3;

// Arquetipos: todo A, todo B, todo C, todo D; el resto, respuestas aleatorias.
const perfiles = [0, 1, 2, 3].map((o) => PREGUNTAS.map(() => o));
while (perfiles.length < total) {
  perfiles.push(PREGUNTAS.map((p) => Math.floor(Math.random() * p.opciones.length)));
}

const client = new Anthropic();
const cuenta = new Map();
let fallos = 0;
let siguiente = 0;

async function trabajador() {
  while (siguiente < perfiles.length) {
    const i = siguiente++;
    try {
      const v = await investigar(client, perfiles[i]);
      if (!v) throw new Error("sin veredicto valido");
      cuenta.set(v.pokemon, (cuenta.get(v.pokemon) ?? 0) + 1);
      console.log(`[${i + 1}/${perfiles.length}] ${perfiles[i].join("")} -> ${v.pokemon}`);
    } catch (err) {
      fallos++;
      console.error(`[${i + 1}/${perfiles.length}] fallo: ${err.message}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrencia }, trabajador));

const ordenado = [...cuenta].sort((a, b) => b[1] - a[1]);
const hechos = perfiles.length - fallos;
console.log(`\nPokemon distintos: ${cuenta.size} en ${hechos} perfiles (${fallos} fallos)`);
console.log("Mas repetidos:", ordenado.slice(0, 10).map(([n, c]) => `${n} x${c}`).join(", "));
