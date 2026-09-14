/**
 * TAREA 1.3
 * Genera el párrafo explicativo del resultado usando plantillas por rasgo.
 * No necesita IA externa: combina el rasgo decisivo, el pokemon ganador
 * y las preguntas clave que ya calculó explicacion.js.
 */

// Etiqueta legible de cada rasgo para mostrar al usuario
export const RASGO_LABELS = {
  AG: "Asertividad",
  SO: "Sociabilidad",
  EN: "Energía",
  RE: "Resiliencia",
  CU: "Curiosidad",
};

// Descripcion corta de cada polo del rasgo (alto/bajo) para el párrafo
const RASGO_DESCRIPCION = {
  AG: {
    alto: "directo, asertivo y que no evita el conflicto cuando es necesario",
    bajo: "pacífico, que prefiere la diplomacia antes que la confrontación",
  },
  SO: {
    alto: "sociable y que se mueve bien en grupo",
    bajo: "independiente y que prefiere actuar en solitario",
  },
  EN: {
    alto: "impulsivo, rápido y que confía en el instinto",
    bajo: "calculador, pausado y que piensa antes de actuar",
  },
  RE: {
    alto: "resistente, tenaz y que aguanta bien la presión",
    bajo: "que prefiere entornos estables antes que situaciones de alto desgaste",
  },
  CU: {
    alto: "curioso, explorador y que se aburre con la rutina",
    bajo: "práctico y que se siente seguro en lo conocido",
  },
};

/**
 * Devuelve "alto" o "bajo" comparando el valor del usuario
 * contra la media teórica (5.0, mitad de la escala 0-10).
 */
function nivelRasgo(valorUsuario) {
  return valorUsuario >= 5 ? "alto" : "bajo";
}

/**
 * Genera el párrafo explicativo completo.
 *
 * @param {Object} vectorUsuario   - { AG, SO, EN, RE, CU } normalizado 0-10
 * @param {Object} pokemonGanador  - objeto pokemon de POKEMON_DATA
 * @param {string} rasgoDecisivo   - ej. "SO"
 * @param {Array}  preguntasClave  - resultado de preguntasContribuyentes()
 * @returns {string} párrafo listo para renderizar
 */
export function generarParrafo(vectorUsuario, pokemonGanador, rasgoDecisivo, preguntasClave) {
  const label = RASGO_LABELS[rasgoDecisivo];
  const nivel = nivelRasgo(vectorUsuario[rasgoDecisivo]);
  const descripcionUsuario = RASGO_DESCRIPCION[rasgoDecisivo][nivel];
  const nombre = pokemonGanador.nombre;

  // Frase principal: qué rasgo decidió y cómo encaja con el pokemon
  const frasePrincipal = `El rasgo que más inclinó la balanza hacia ${nombre} fue tu nivel de ${label.toLowerCase()}. ` +
    `Tu perfil muestra que eres alguien ${descripcionUsuario}, y ${nombre} comparte ese mismo eje como uno de sus rasgos más característicos.`;

  // Frase de respaldo: qué respondiste que lo provocó (máximo 2 preguntas)
  let fraseRespaldo = "";
  if (preguntasClave.length > 0) {
    const ejemplos = preguntasClave.slice(0, 2);
    const textos = ejemplos.map((p) => `"${p.respuestaTexto}"`).join(" y ");
    fraseRespaldo = ` Tus respuestas ${textos} fueron las que más peso tuvieron en este resultado.`;
  }

  // Frase de cierre con el tipo del pokemon
  const tipo = pokemonGanador.tipo2
    ? `${pokemonGanador.tipo1}/${pokemonGanador.tipo2}`
    : pokemonGanador.tipo1;
  const fraseCierre = ` Finalmente, como Pokémon de tipo ${tipo}, ${nombre} refleja una personalidad que encaja con los datos obtenidos durante el test.`;

  return frasePrincipal + fraseRespaldo + fraseCierre;
}