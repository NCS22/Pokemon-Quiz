import { useState } from "react";
import { PREGUNTAS } from "./data/preguntas";
import { obtenerResultado } from "./models/modelo";
import { analizarResultado } from "./logic/explication";
import { generarParrafo, RASGO_LABELS } from "./logic/plantillas";
import { RadarComparativo } from "./components/RadarComparativo";
import "./App.css";

const FASES = {
  INICIO: "inicio",
  PREGUNTAS: "preguntas",
  RESULTADO: "resultado",
};

function obtenerImagen(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/* ── Barra de progreso estilo HP bar ────────────────────────────────────
   Signature element del diseño: carril oscuro + relleno amarillo Pokemon
   con transición suave al avanzar de pregunta.
──────────────────────────────────────────────────────────────────────── */
function BarraProgreso({ actual, total }) {
  const porcentaje = Math.round(((actual) / total) * 100);
 
  return (
    <div className="w-full max-w-md mx-auto mb-5">
      {/* Etiquetas */}
      <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 px-0.5">
        <span>Pregunta {actual + 1} de {total}</span>
        <span className="text-yellow-400">{porcentaje}%</span>
      </div>
 
      {/* Carril */}
      <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600/50">
        {/* Relleno — transition-all anima el cambio de width */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${porcentaje}%`,
            background: "linear-gradient(90deg, #FCD34D 0%, #F59E0B 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [fase, setFase] = useState(FASES.INICIO);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [marcaIndice, setMarcaIndice] = useState(null);
  const [resultado, setResultado] = useState(null);
 
  function empezar() {
    setFase(FASES.PREGUNTAS);
    setIndicePregunta(0);
    setRespuestas([]);
    setMarcaIndice(null);
  }
 
  function marcarOpcion(i) {
    setMarcaIndice(i);
  }
 
  function elegirOpcion(idxOpcion) {
    if (idxOpcion === null) return;
    const nuevasRespuestas = [...respuestas, idxOpcion];
    setRespuestas(nuevasRespuestas);
 
    const siguiente = indicePregunta + 1;
    if (siguiente < PREGUNTAS.length) {
      setIndicePregunta(siguiente);
      setMarcaIndice(null);
    } else {
      const { vector, resultados } = obtenerResultado(nuevasRespuestas, PREGUNTAS, 3);
      const { rasgoDecisivo, detalleRasgos, preguntasClave } = analizarResultado(
        vector, resultados, nuevasRespuestas, PREGUNTAS
      );
      const parrafo = generarParrafo(
        vector, resultados[0].pokemon, rasgoDecisivo, preguntasClave
      );
      setResultado({ vector, resultados, rasgoDecisivo, detalleRasgos, preguntasClave, parrafo });
      setFase(FASES.RESULTADO);
    }
  }
 
  function reiniciar() {
    setFase(FASES.INICIO);
    setIndicePregunta(0);
    setRespuestas([]);
    setMarcaIndice(null);
    setResultado(null);
  }
 
  return (
    /*
      min-h-screen           → ocupa al menos toda la altura de la ventana
      flex flex-col          → columna vertical
      items-center           → centra horizontalmente
      justify-center         → centra verticalmente
      p-4                    → padding 1rem en todos los lados (espacio en móvil)
    */
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
 
      {/* Logo — siempre visible, tamaño máximo 224px */}
      <img
        src="/imagenes/pokequiz.png"
        alt="Pokémon Quiz"
        className="w-200 drop-shadow-2xl"
      />
 
      {/* ════════════════════════════════════════════════════════════
          FASE: INICIO
          animate-fade-up → entra desde abajo con fade al cargar
      ════════════════════════════════════════════════════════════ */}
      {fase === FASES.INICIO && (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 text-center animate-fade-up">
 
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Responde{" "}
            <span className="text-yellow-400 font-bold">{PREGUNTAS.length} preguntas</span>{" "}
            y descubre qué Pokémon de primera generación eres.
          </p>
 
          {/*
            Botón principal:
            bg-yellow-400          → fondo amarillo Pokemon
            hover:bg-yellow-300    → amarillo más claro al pasar el ratón
            active:scale-95        → se encoge ligeramente al hacer clic (feedback táctil)
            text-slate-900         → texto oscuro sobre fondo claro
            shadow-yellow-400/20   → sombra con el propio color del botón (efecto glow sutil)
          */}
          <button
            onClick={empezar}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-900 font-extrabold text-lg py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
          >
            Empezar →
          </button>
        </div>
      )}
 
      {/* ════════════════════════════════════════════════════════════
          FASE: PREGUNTAS
      ════════════════════════════════════════════════════════════ */}
      {fase === FASES.PREGUNTAS && (
        <>
          {/* Barra HP */}
          <BarraProgreso actual={indicePregunta} total={PREGUNTAS.length} />
 
          {/*
            key={indicePregunta} es el truco de la animación:
            cada vez que indicePregunta cambia, React desmonta este div
            y lo vuelve a montar, disparando animate-slide-in desde cero.
            Sin librería de animaciones, sin estado extra.
          */}
          <div
            key={indicePregunta}
            className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 animate-slide-in"
          >
            {/* Pregunta */}
            <h2 className="text-white text-xl font-bold mb-6 leading-snug">
              {PREGUNTAS[indicePregunta].texto}
            </h2>
 
            {/* Opciones */}
            <div className="flex flex-col gap-3 mb-6">
              {PREGUNTAS[indicePregunta].opciones.map((opcion, i) => (
                <button
                  key={i}
                  onClick={() => marcarOpcion(i)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm
                    transition-all duration-150
                    ${marcaIndice === i
                      /* Seleccionada: borde + fondo amarillo translúcido */
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                      /* Sin seleccionar: borde gris, hover sutil */
                      : "border-slate-600 bg-slate-700/40 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
 
            {/* Botón Siguiente / Ver resultado */}
            <button
              onClick={() => elegirOpcion(marcaIndice)}
              disabled={marcaIndice === null}
              className={`
                w-full py-3 rounded-xl font-extrabold text-base transition-all duration-200
                ${marcaIndice !== null
                  ? "bg-yellow-400 text-slate-900 hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/20 cursor-pointer"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {indicePregunta < PREGUNTAS.length - 1 ? "Siguiente →" : "Ver resultado →"}
            </button>
          </div>
        </>
      )}
 
      {/* ════════════════════════════════════════════════════════════
          FASE: RESULTADO
          (placeholder — estilos definitivos en la próxima sesión)
      ════════════════════════════════════════════════════════════ */}
      {fase === FASES.RESULTADO && resultado && (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 text-white text-center animate-fade-up">
 
          <h1 className="text-2xl font-extrabold text-yellow-400 mb-1">
            ¡Tu resultado!
          </h1>
          <h2 className="text-3xl font-extrabold mb-4">
            {resultado.resultados[0].pokemon.nombre}
          </h2>
 
          <img
            src={obtenerImagen(resultado.resultados[0].pokemon.id)}
            alt={resultado.resultados[0].pokemon.nombre}
            className="w-40 mx-auto my-4 drop-shadow-2xl"
          />
 
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {resultado.parrafo}
          </p>
 
          <p className="text-slate-400 text-xs mb-6">
            Rasgo clave:{" "}
            <span className="text-yellow-400 font-bold">
              {RASGO_LABELS[resultado.rasgoDecisivo]}
            </span>
          </p>
 
          <RadarComparativo
            vectorUsuario={resultado.vector}
            pokemonGanador={resultado.resultados[0].pokemon}
          />
 
          <h3 className="text-slate-400 text-sm font-semibold mt-6 mb-2">
            Otros candidatos cercanos
          </h3>
          <ul className="text-slate-300 text-sm space-y-1 mb-6">
            {resultado.resultados.slice(1).map((r, i) => (
              <li key={i}>{r.pokemon.nombre}</li>
            ))}
          </ul>
 
          <button
            onClick={reiniciar}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-900 font-extrabold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
          >
            Repetir el test
          </button>
        </div>
      )}
    </div>
  );
}