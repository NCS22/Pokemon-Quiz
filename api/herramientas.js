import { POKEMON_DATA } from "../src/data/pokemonData.js";
import { PREGUNTAS } from "../src/data/preguntas.js";
import { respuestasAVector, RASGOS } from "../src/models/modelo.js";

const NOMBRES = POKEMON_DATA.map((p) => p.nombre);
const MAX_RESULTADOS = 20;

function clave(texto) {
  return String(texto).toLowerCase().replace(/[^a-z0-9]/g, "");
}

const POR_CLAVE = new Map(POKEMON_DATA.map((p) => [clave(p.nombre), p]));

export function buscarPorNombre(nombre) {
  return POR_CLAVE.get(clave(nombre)) ?? null;
}

function ficha(p) {
  return {
    nombre: p.nombre,
    tipos: p.tipo2 ? [p.tipo1, p.tipo2] : [p.tipo1],
    rasgos: Object.fromEntries(RASGOS.map((r) => [r, p[r]])),
    stats: p.stats,
  };
}

function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const PROPIEDADES_RASGOS = Object.fromEntries(
  RASGOS.flatMap((r) => [
    [`${r}_min`, { type: "number", minimum: 0, maximum: 10 }],
    [`${r}_max`, { type: "number", minimum: 0, maximum: 10 }],
  ])
);

export const HERRAMIENTAS = [
  {
    name: "perfil_usuario",
    description:
      "Devuelve el perfil numerico (0-10) del usuario en los 5 rasgos: AG asertividad, SO sociabilidad, EN energia, RE resistencia, CU curiosidad. Es una pista cuantitativa; las respuestas textuales son la fuente principal.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "buscar_pokemon",
    description:
      "Busca Pokemon de primera generacion. Sin 'objetivo' devuelve los candidatos que cumplen los filtros en orden aleatorio (no por popularidad). Con 'objetivo' los ordena por cercania en los rasgos indicados. Devuelve como maximo 20.",
    input_schema: {
      type: "object",
      properties: {
        tipo: { type: "string", description: "Tipo en ingles, p. ej. Water, Fire, Psychic." },
        ...PROPIEDADES_RASGOS,
        objetivo: {
          type: "object",
          description: "Valores deseados (0-10) para ordenar por cercania; solo cuentan los rasgos presentes.",
          properties: Object.fromEntries(
            RASGOS.map((r) => [r, { type: "number", minimum: 0, maximum: 10 }])
          ),
        },
        limite: { type: "integer", minimum: 1, maximum: MAX_RESULTADOS },
      },
    },
  },
  {
    name: "obtener_pokemon",
    description: "Ficha completa de un Pokemon: tipos, 5 rasgos y estadisticas base.",
    input_schema: {
      type: "object",
      properties: { nombre: { type: "string" } },
      required: ["nombre"],
    },
  },
  {
    name: "comparar_pokemon",
    description: "Devuelve las fichas de 2 a 5 Pokemon para compararlos.",
    input_schema: {
      type: "object",
      properties: {
        nombres: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
      },
      required: ["nombres"],
    },
  },
  {
    name: "emitir_veredicto",
    description:
      "Entrega el resultado final. Llamala solo cuando hayas comparado varios candidatos. Termina la investigacion.",
    input_schema: {
      type: "object",
      properties: {
        pokemon: { type: "string", enum: NOMBRES },
        alternativas: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 2,
          description:
            "Los dos siguientes mejores candidatos, distintos del elegido y con el nombre exacto de la lista de 'pokemon'.",
        },
        rasgos_usuario: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 6,
          description: "Rasgos de personalidad del usuario, en 1-3 palabras cada uno.",
        },
        razon: {
          type: "string",
          description: "2-4 frases en espanol, en segunda persona, explicando por que ese Pokemon le representa.",
        },
      },
      required: ["pokemon", "alternativas", "rasgos_usuario", "razon"],
    },
  },
];

function buscar(input) {
  const limite = Math.min(Math.max(Number(input.limite) || 10, 1), MAX_RESULTADOS);
  const tipo = input.tipo ? clave(input.tipo) : null;

  let candidatos = POKEMON_DATA.filter((p) => {
    if (tipo && clave(p.tipo1) !== tipo && clave(p.tipo2) !== tipo) return false;
    return RASGOS.every((r) => {
      const min = input[`${r}_min`];
      const max = input[`${r}_max`];
      return (min === undefined || p[r] >= min) && (max === undefined || p[r] <= max);
    });
  });

  const objetivo = input.objetivo ?? {};
  const ejes = RASGOS.filter((r) => typeof objetivo[r] === "number");
  if (ejes.length > 0) {
    const dist = (p) => Math.sqrt(ejes.reduce((s, r) => s + (p[r] - objetivo[r]) ** 2, 0));
    candidatos = candidatos.sort((a, b) => dist(a) - dist(b));
  } else {
    candidatos = barajar(candidatos);
  }

  return { total_coincidencias: candidatos.length, pokemon: candidatos.slice(0, limite).map(ficha) };
}

function obtenerVarios(nombres) {
  const encontrados = [];
  const desconocidos = [];
  for (const n of nombres) {
    const p = buscarPorNombre(n);
    if (p) encontrados.push(ficha(p));
    else desconocidos.push(n);
  }
  return desconocidos.length ? { pokemon: encontrados, desconocidos } : { pokemon: encontrados };
}

/**
 * Ejecuta una herramienta de consulta. Devuelve un objeto serializable;
 * los errores se devuelven como { error } para que el modelo pueda corregirse.
 */
export function ejecutarHerramienta(nombre, input, respuestas) {
  switch (nombre) {
    case "perfil_usuario": {
      const v = respuestasAVector(respuestas, PREGUNTAS);
      return Object.fromEntries(RASGOS.map((r) => [r, Math.round(v[r] * 10) / 10]));
    }
    case "buscar_pokemon":
      return buscar(input ?? {});
    case "obtener_pokemon": {
      const p = buscarPorNombre(input?.nombre ?? "");
      return p ? ficha(p) : { error: `No existe '${input?.nombre}' en la primera generacion.` };
    }
    case "comparar_pokemon":
      return obtenerVarios(Array.isArray(input?.nombres) ? input.nombres.slice(0, 5) : []);
    default:
      return { error: `Herramienta desconocida: ${nombre}` };
  }
}
