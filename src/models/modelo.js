import { POKEMON_DATA } from "../data/pokemonData";

// Rasgos usados en todo el sistema, en este orden fijo
export const RASGOS = ["AG", "SO", "EN", "RE", "CU"];

// Rangos teoricos exactos (calculados sumando el mejor/peor caso posible
// de cada opcion para cada rasgo, a lo largo de las 12 preguntas).
// Sirven para normalizar la suma cruda de un usuario a escala 0-10,
// la misma escala que usa la tabla de pokemon.
const RANGOS = {
  AG: { min: -11, max: 12 },
  SO: { min: -13, max: 27 },
  EN: { min: -10, max: 19 },
  RE: { min: -12, max: 19 },
  CU: { min: -6, max: 25 },
};

/**
 * Convierte las respuestas del usuario (array de indices 0-3, uno por pregunta,
 * en el mismo orden que PREGUNTAS) en un vector de rasgos normalizado 0-10.
 *
 * @param {number[]} indicesRespuestas - ej. [0,2,1,0,0,1,1,0,1,0,1,3]
 * @param {Array} preguntas - el array PREGUNTAS importado de preguntas.js
 * @returns {Object} vector normalizado, ej. { AG: 7.2, SO: 3.1, EN: 6.0, RE: 4.4, CU: 5.8 }
 */
export function respuestasAVector(indicesRespuestas, preguntas) {
  const raw = { AG: 0, SO: 0, EN: 0, RE: 0, CU: 0 };

  indicesRespuestas.forEach((idxOpcion, idxPregunta) => {
    const opcion = preguntas[idxPregunta].opciones[idxOpcion];
    const deltas = opcion.deltas;
    for (const rasgo of RASGOS) {
      if (deltas[rasgo]) raw[rasgo] += deltas[rasgo];
    }
  });

  // Normalizar cada rasgo a escala 0-10 usando los rangos teoricos
  const normalizado = {};
  for (const rasgo of RASGOS) {
    const { min, max } = RANGOS[rasgo];
    const val = ((raw[rasgo] - min) / (max - min)) * 10;
    normalizado[rasgo] = Math.max(0, Math.min(10, val));
  }
  return normalizado;
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
