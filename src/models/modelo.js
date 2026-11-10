import { POKEMON_DATA } from "../data/pokemonData.js";

// Rasgos usados en todo el sistema, en este orden fijo
export const RASGOS = ["AG", "SO", "EN", "RE", "CU"];

// Media y desviacion de cada rasgo, tanto para un usuario que contesta al azar
// (cada opcion equiprobable, preguntas independientes) como para la tabla de pokemon.
const cacheEstadisticas = new WeakMap();

function estadisticasDe(preguntas) {
  if (cacheEstadisticas.has(preguntas)) return cacheEstadisticas.get(preguntas);

  const usuario = {};
  for (const rasgo of RASGOS) {
    let media = 0;
    let varianza = 0;
    for (const pregunta of preguntas) {
      const valores = pregunta.opciones.map((o) => o.deltas[rasgo] ?? 0);
      const m = valores.reduce((a, b) => a + b, 0) / valores.length;
      media += m;
      varianza += valores.reduce((a, v) => a + (v - m) ** 2, 0) / valores.length;
    }
    usuario[rasgo] = { media, sd: Math.sqrt(varianza) };
  }

  const tabla = {};
  for (const rasgo of RASGOS) {
    const valores = POKEMON_DATA.map((p) => p[rasgo]);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza = valores.reduce((a, v) => a + (v - media) ** 2, 0) / valores.length;
    tabla[rasgo] = { media, sd: Math.sqrt(varianza) };
  }

  const resultado = { usuario, tabla };
  cacheEstadisticas.set(preguntas, resultado);
  return resultado;
}

/**
 * Suma cruda de los deltas de las respuestas del usuario, sin normalizar.
 *
 * @param {number[]} indicesRespuestas - ej. [0,2,1,0,0,1,1,0,1,0,1,3]
 * @param {Array} preguntas - el array PREGUNTAS importado de preguntas.js
 */
export function sumarRaw(indicesRespuestas, preguntas) {
  const raw = { AG: 0, SO: 0, EN: 0, RE: 0, CU: 0 };
  indicesRespuestas.forEach((idxOpcion, idxPregunta) => {
    const deltas = preguntas[idxPregunta].opciones[idxOpcion].deltas;
    for (const rasgo of RASGOS) {
      if (deltas[rasgo]) raw[rasgo] += deltas[rasgo];
    }
  });
  return raw;
}

/**
 * Convierte la suma cruda en un vector 0-10 comparable con la tabla de pokemon.
 *
 * Un usuario que contesta al azar tiene sumas muy agrupadas alrededor del centro
 * (muchas preguntas independientes), mientras que la tabla de pokemon tiene otra
 * media y otra dispersion en cada rasgo. Escalar solo con los rangos teoricos deja
 * a los usuarios en una zona que no cubre a todos los pokemon, asi que se
 * estandariza cada rasgo respecto a la distribucion del usuario y se reescala a
 * la media y desviacion de la tabla.
 */
export function normalizarRaw(raw, preguntas) {
  const { usuario, tabla } = estadisticasDe(preguntas);
  const normalizado = {};
  for (const rasgo of RASGOS) {
    const z = (raw[rasgo] - usuario[rasgo].media) / usuario[rasgo].sd;
    const val = tabla[rasgo].media + z * tabla[rasgo].sd;
    normalizado[rasgo] = Math.max(0, Math.min(10, val));
  }
  return normalizado;
}

/**
 * Convierte las respuestas del usuario (array de indices 0-3, uno por pregunta,
 * en el mismo orden que PREGUNTAS) en un vector de rasgos normalizado 0-10.
 *
 * @returns {Object} vector normalizado, ej. { AG: 7.2, SO: 3.1, EN: 6.0, RE: 4.4, CU: 5.8 }
 */
export function respuestasAVector(indicesRespuestas, preguntas) {
  return normalizarRaw(sumarRaw(indicesRespuestas, preguntas), preguntas);
}

/**
 * Distancia euclidea entre el vector del usuario y un pokemon de la tabla.
 */
function distancia(vectorUsuario, pokemon) {
  let suma = 0;
  for (const rasgo of RASGOS) {
    const diff = vectorUsuario[rasgo] - pokemon[rasgo];
    suma += diff * diff;
  }
  return Math.sqrt(suma);
}

/**
 * Modelo de prediccion: busca el pokemon (o los k mas cercanos) en el
 * espacio de 5 dimensiones de personalidad.
 *
 * Nota tecnica: este es un clasificador de "vecino mas cercano" (1-NN)
 * usando los 151 pokemon como prototipos/clases. Es la version exacta y
 * determinista hacia la que converge el kNN entrenado y validado en Python
 * (kNN k=7 sobre el dataset sintetico obtuvo 68.8% top-1 / 91.3% top-3 en
 * test). Para produccion usamos esta version directa: mismo principio,
 * sin necesidad de cargar un modelo serializado en el cliente.
 *
 * @param {Object} vectorUsuario - { AG, SO, EN, RE, CU } ya normalizado 0-10
 * @param {number} topN - cuantos resultados devolver, ordenados por cercania
 * @returns {Array} lista de { pokemon, distancia } ordenada de mas a menos cercano
 */
export function predecirPokemon(vectorUsuario, topN = 3) {
  const distancias = POKEMON_DATA.map((p) => ({
    pokemon: p,
    distancia: distancia(vectorUsuario, p),
  }));
  distancias.sort((a, b) => a.distancia - b.distancia);
  return distancias.slice(0, topN);
}

/**
 * Funcion de conveniencia: de respuestas a resultado final directamente.
 */
export function obtenerResultado(indicesRespuestas, preguntas, topN = 3) {
  const vector = respuestasAVector(indicesRespuestas, preguntas);
  const resultados = predecirPokemon(vector, topN);
  return { vector, resultados };
}
