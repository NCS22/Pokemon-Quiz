import { POKEMON_DATA } from "../data/pokemonData";

const TIMEOUT_MS = 40_000;

/**
 * Envia las respuestas a /api/predecir y devuelve el veredicto de la IA con los
 * Pokemon ya resueltos contra POKEMON_DATA. Lanza si la API falla, tarda o
 * devuelve algo que no encaja, para que el llamador use el respaldo local.
 *
 * @param {number[]} respuestas - indices 0-3, uno por pregunta
 * @param {AbortSignal} [signal] - para cancelar si el usuario reinicia el test
 */
export async function consultarIA(respuestas, signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const res = await fetch("/api/predecir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respuestas }),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!res.ok) throw new Error(`/api/predecir respondio ${res.status}`);

  const data = await res.json();
  const buscar = (nombre) => POKEMON_DATA.find((p) => p.nombre === nombre);
  const principal = buscar(data.pokemon);
  if (!principal) throw new Error(`Pokemon desconocido: ${data.pokemon}`);

  return {
    resultados: [principal, ...data.alternativas.map(buscar).filter(Boolean)].map((pokemon) => ({ pokemon })),
    parrafo: data.razon,
    rasgosUsuario: data.rasgos_usuario,
  };
}
