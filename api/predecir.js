import Anthropic from "@anthropic-ai/sdk";
import { PREGUNTAS } from "../src/data/preguntas.js";
import { HERRAMIENTAS, ejecutarHerramienta, buscarPorNombre } from "./herramientas.js";

const MODELO = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_VUELTAS = 5;
const MAX_TOKENS = 1500;

// Rate limit sencillo por IP. En serverless la memoria no se comparte entre
// instancias, asi que es un freno de mejor esfuerzo, no una garantia.
const VENTANA_MS = 60_000;
const MAX_PETICIONES = 5;
const peticiones = new Map();

function limitado(ip) {
  const ahora = Date.now();
  const recientes = (peticiones.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  recientes.push(ahora);
  peticiones.set(ip, recientes);
  if (peticiones.size > 1000) {
    for (const [k, v] of peticiones) if (v.every((t) => ahora - t >= VENTANA_MS)) peticiones.delete(k);
  }
  return recientes.length > MAX_PETICIONES;
}

const SISTEMA = `Eres un experto en Pokemon y en psicologia de la personalidad. Un usuario ha respondido un test de ${PREGUNTAS.length} preguntas y tu trabajo es decidir cual de los 151 Pokemon de primera generacion le representa mejor.

Metodo:
1. Lee las respuestas y deduce como es la persona (temperamento, forma de relacionarse, de afrontar problemas, energia, curiosidad, etc.). Las respuestas textuales son la fuente principal.
2. Usa perfil_usuario como pista numerica y buscar_pokemon, obtener_pokemon y comparar_pokemon para investigar. Explora al menos 3 candidatos de familias y tipos distintos antes de decidir.
3. Considera de verdad los 151: no te quedes con los mas famosos (Pikachu, Charizard, Mewtwo...). Un Metapod, un Snorlax o un Magikarp pueden ser la respuesta correcta si encajan mejor.
4. Los rasgos numericos de cada Pokemon son orientativos; tambien puedes razonar con su tipo, estadisticas y lo que sabes de el.
5. Termina siempre llamando a emitir_veredicto. La razon debe hablar al usuario de tu a tu, en espanol, citando conductas concretas de sus respuestas.`;

function textoRespuestas(respuestas) {
  return respuestas
    .map((idx, i) => {
      const p = PREGUNTAS[i];
      const o = p.opciones[idx];
      const senales = o.senales ? ` (senales: ${o.senales})` : "";
      return `${i + 1}. ${p.texto}\n   Respuesta: ${o.texto}${senales}`;
    })
    .join("\n");
}

function validarRespuestas(body) {
  const r = body?.respuestas;
  if (!Array.isArray(r) || r.length !== PREGUNTAS.length) return null;
  const valido = r.every((n, i) => Number.isInteger(n) && n >= 0 && n < PREGUNTAS[i].opciones.length);
  return valido ? r : null;
}

function validarVeredicto(v) {
  const principal = buscarPorNombre(v?.pokemon ?? "");
  if (!principal) return null;
  const vistos = new Set([principal.id]);
  const alternativas = [];
  for (const n of Array.isArray(v.alternativas) ? v.alternativas : []) {
    const p = buscarPorNombre(n);
    if (p && !vistos.has(p.id)) {
      vistos.add(p.id);
      alternativas.push(p.nombre);
    }
  }
  if (typeof v.razon !== "string" || !v.razon.trim()) return null;
  return {
    pokemon: principal.nombre,
    alternativas: alternativas.slice(0, 2),
    razon: v.razon.trim(),
    rasgos_usuario: Array.isArray(v.rasgos_usuario) ? v.rasgos_usuario.map(String).slice(0, 6) : [],
  };
}

// Prompt caching: el prefijo (herramientas + sistema) es identico en todas las
// vueltas y se cachea; el historial crece, asi que ademas se marca el final del
// ultimo mensaje para que la vuelta siguiente lea de cache todo lo anterior.
// Se marca una copia: la API admite pocos puntos de cache y los viejos no se deben acumular.
const SISTEMA_CACHEADO = [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }];

function conCacheAlFinal(messages) {
  const ultimo = messages[messages.length - 1];
  const bloques =
    typeof ultimo.content === "string" ? [{ type: "text", text: ultimo.content }] : [...ultimo.content];
  bloques[bloques.length - 1] = { ...bloques[bloques.length - 1], cache_control: { type: "ephemeral" } };
  return [...messages.slice(0, -1), { ...ultimo, content: bloques }];
}

export async function investigar(client, respuestas) {
  const messages = [
    {
      role: "user",
      content: `Estas son las respuestas del usuario:\n\n${textoRespuestas(respuestas)}\n\nInvestiga y emite tu veredicto.`,
    },
  ];
  const uso = { vueltas: 0, entrada: 0, escritura_cache: 0, lectura_cache: 0, salida: 0 };
  const registrarUso = () =>
    console.log(
      `[IA] ${uso.vueltas} vueltas | entrada ${uso.entrada} | cache escrita ${uso.escritura_cache} | cache leida ${uso.lectura_cache} | salida ${uso.salida}`
    );

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const ultima = vuelta === MAX_VUELTAS - 1;
    const resp = await client.messages.create({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      system: SISTEMA_CACHEADO,
      tools: HERRAMIENTAS,
      tool_choice: ultima ? { type: "tool", name: "emitir_veredicto" } : { type: "auto" },
      messages: conCacheAlFinal(messages),
    });
    messages.push({ role: "assistant", content: resp.content });

    uso.vueltas++;
    uso.entrada += resp.usage?.input_tokens ?? 0;
    uso.escritura_cache += resp.usage?.cache_creation_input_tokens ?? 0;
    uso.lectura_cache += resp.usage?.cache_read_input_tokens ?? 0;
    uso.salida += resp.usage?.output_tokens ?? 0;

    const usos = resp.content.filter((b) => b.type === "tool_use");
    const final = usos.find((u) => u.name === "emitir_veredicto");
    if (final) {
      registrarUso();
      return validarVeredicto(final.input);
    }

    if (usos.length === 0) {
      messages.push({ role: "user", content: "Llama a emitir_veredicto para entregar el resultado." });
      continue;
    }

    messages.push({
      role: "user",
      content: usos.map((u) => ({
        type: "tool_result",
        tool_use_id: u.id,
        content: JSON.stringify(ejecutarHerramienta(u.name, u.input, respuestas)),
      })),
    });
  }
  registrarUso();
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const respuestas = validarRespuestas(req.body);
  if (!respuestas) return res.status(400).json({ error: "Respuestas invalidas" });

  const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "").split(",")[0].trim();
  if (limitado(ip)) return res.status(429).json({ error: "Demasiadas peticiones, espera un momento" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Servidor sin configurar" });
  }

  try {
    const client = new Anthropic();
    const veredicto = await investigar(client, respuestas);
    if (!veredicto) return res.status(502).json({ error: "La IA no devolvio un veredicto valido" });
    return res.status(200).json(veredicto);
  } catch (err) {
    console.error("Error en /api/predecir:", err?.message ?? err);
    return res.status(502).json({ error: "Error al consultar la IA" });
  }
}
