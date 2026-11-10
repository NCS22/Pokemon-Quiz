import { useEffect, useState } from "react";

const MENSAJES = [
  "Leyendo tus respuestas…",
  "Analizando tu personalidad…",
  "Buscando candidatos entre los 151 Pokémon…",
  "Comparando estadísticas y temperamento…",
  "Decidiendo tu Pokémon ideal…",
];

export function PantallaPensando() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndice((i) => Math.min(i + 1, MENSAJES.length - 1)), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 text-center animate-fade-up">
      <div
        className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-slate-600 border-t-yellow-400 animate-spin"
        role="status"
        aria-label="Cargando"
      />
      <p className="text-slate-300 text-lg">{MENSAJES[indice]}</p>
    </div>
  );
}
