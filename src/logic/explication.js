import { RASGOS } from "../models/modelo";

/**
 * TAREA 1.1
 * Identifica que rasgo (AG, SO, EN, RE o CU) fue el mas decisivo a la hora
 * de elegir al pokemon ganador frente a los rivales del top-N.
 *
 * Logica: para cada rasgo comparamos dos cosas:
 *   - diffGanador: que tan cerca esta el usuario del ganador en ese rasgo
 *   - diffRivalesProm: que tan cerca esta el usuario de los rivales (top-2, top-3...) en ese rasgo
 *
 * El "margen" = diffRivalesProm - diffGanador.
 * Un margen alto significa: "en este rasgo el usuario esta muy cerca del
 * ganador pero lejos de los rivales" -> ese rasgo es el que mas inclino la
 * balanza hacia el ganador y no hacia otro candidato.
 *
 * @param {Object} vectorUsuario - { AG, SO, EN, RE, CU } normalizado 0-10
 * @param {Array} resultados - array devuelto por predecirPokemon(), ej.
 *   [{ pokemon, distancia }, { pokemon, distancia }, ...] ya ordenado de mas a menos cercano
 * @returns {Object} { rasgoDecisivo, detalle }
 *   - rasgoDecisivo: string, ej. "CU"
 *   - detalle: array con el analisis completo de los 5 rasgos (util para debug
 *     o para mostrar una tabla comparativa mas adelante)
 */
export function analizarRasgoDecisivo(vectorUsuario, resultados) {
  const ganador = resultados[0].pokemon;
  const rivales = resultados.slice(1); // resto de candidatos del top-N

  const detalle = RASGOS.map((rasgo) => {
    const diffGanador = Math.abs(vectorUsuario[rasgo] - ganador[rasgo]);

    let diffRivalesProm = null;
    let margen = null;
    if (rivales.length > 0) {
      const sumaDiffs = rivales.reduce(
        (acc, r) => acc + Math.abs(vectorUsuario[rasgo] - r.pokemon[rasgo]),
        0
      );
      diffRivalesProm = sumaDiffs / rivales.length;
      margen = diffRivalesProm - diffGanador;
    }

    return { rasgo, diffGanador, diffRivalesProm, margen };
  });

  // Ordenamos: si hay margen (hay rivales), el de mayor margen gana.
  // Si no hubiera rivales (topN=1), caemos a "el rasgo donde el usuario
  // esta mas cerca del ganador en valor absoluto".
  const ordenado = [...detalle].sort((a, b) => {
    if (a.margen !== null && b.margen !== null) return b.margen - a.margen;
    return a.diffGanador - b.diffGanador;
  });

  return {
    rasgoDecisivo: ordenado[0].rasgo,
    detalle,
  };
}

/**
 * TAREA 1.2
 * Recorre las respuestas que dio el usuario y devuelve solo aquellas que
 * contribuyeron (sumaron o restaron puntos) al rasgo decisivo, ordenadas
 * de mayor a menor impacto absoluto.
 *
 * @param {number[]} indicesRespuestas - ej. [0,2,1,0,0,1,1,0,1,0,1,3]
 * @param {Array} preguntas - array PREGUNTAS importado de data/preguntas.js
 * @param {string} rasgoDecisivo - ej. "CU", el resultado de analizarRasgoDecisivo
 * @returns {Array} lista de { preguntaTexto, respuestaTexto, delta }
 *   ordenada por |delta| descendente
 */
export function preguntasContribuyentes(indicesRespuestas, preguntas, rasgoDecisivo) {
  const contribuciones = [];

  indicesRespuestas.forEach((idxOpcion, idxPregunta) => {
    const pregunta = preguntas[idxPregunta];
    const opcion = pregunta.opciones[idxOpcion];
    const delta = opcion.deltas[rasgoDecisivo];

    if (delta) {
      contribuciones.push({
        preguntaTexto: pregunta.texto,
        respuestaTexto: opcion.texto,
        delta,
      });
    }
  });

  contribuciones.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return contribuciones;
}

/**
 * Funcion de conveniencia que junta las tareas 1.1 y 1.2 en una sola llamada,
 * pensada para usarse directamente en la pantalla de resultado.
 *
 * @returns {Object} { rasgoDecisivo, detalleRasgos, preguntasClave }
 */
export function analizarResultado(vectorUsuario, resultados, indicesRespuestas, preguntas) {
  const { rasgoDecisivo, detalle } = analizarRasgoDecisivo(vectorUsuario, resultados);
  const preguntasClave = preguntasContribuyentes(indicesRespuestas, preguntas, rasgoDecisivo);

  return {
    rasgoDecisivo,
    detalleRasgos: detalle,
    preguntasClave,
  };
}