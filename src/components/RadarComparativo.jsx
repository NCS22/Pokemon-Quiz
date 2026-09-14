import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RASGOS } from "../models/modelo";
import { RASGO_LABELS } from "../logic/plantillas";

// Colores del sistema de diseño de la web
const COLOR_USUARIO = "#FCD34D";   // yellow-300 — igual que el acento de la web
const COLOR_POKEMON = "#34d399";   // emerald-400 — contraste limpio con el amarillo

function prepararDatosRadar(vectorUsuario, pokemonGanador) {
  return RASGOS.map((rasgo) => ({
    rasgo: RASGO_LABELS[rasgo],
    Tú: Math.round(vectorUsuario[rasgo] * 10) / 10,
    [pokemonGanador.nombre]: Math.round(pokemonGanador[rasgo] * 10) / 10,
  }));
}

// Leyenda personalizada: más control sobre colores y tipografía
function LeyendaPersonalizada({ nombre }) {
  return (
    <div className="flex items-center justify-center gap-6 text-sm font-semibold">
      <span className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: COLOR_USUARIO }}
        />
        <span style={{ color: COLOR_USUARIO }}>Tú</span>
      </span>
      <span className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: COLOR_POKEMON }}
        />
        <span style={{ color: COLOR_POKEMON }}>{nombre}</span>
      </span>
    </div>
  );
}

export function RadarComparativo({ vectorUsuario, pokemonGanador }) {
  const datos = prepararDatosRadar(vectorUsuario, pokemonGanador);

  return (
    <div className="w-full mt-6">
      {/* Título de la sección */}
      <h3 className="text-center text-slate-300 text-sm font-semibold uppercase tracking-widest mb-1">
        Comparativa de perfil
      </h3>
      <p className="text-center text-slate-500 text-xs">
        Tú vs {pokemonGanador.nombre}
      </p>

      <ResponsiveContainer width="100%" aspect={1}>
        <RadarChart
          data={datos}
          margin={{ top: 16, right: 36, bottom: 16, left: 36 }}
        >
          {/* Rejilla: color slate-700, visible pero discreta sobre el fondo oscuro */}
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />

          {/*
            Etiquetas de los 5 ejes.
            fill: slate-200 (#e2e8f0) — bien visible sobre fondo oscuro.
            outerRadius: las separa del área del gráfico para no solapar.
          */}
          <PolarAngleAxis
            dataKey="rasgo"
            tick={{ fill: "#e2e8f0", fontSize: 12, fontWeight: 600, fontFamily: "Nunito, sans-serif" }}
          />

          {/*
            Escala radial 0–10.
            Los números intermedios (0, 5, 10) en slate-400.
            tickLine=false elimina las rayitas al lado de los números.
          */}
          <PolarRadiusAxis
            angle={72}
            domain={[0, 10]}
            tickCount={3}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />

          {/* Capa del usuario — amarillo Pokemon */}
          <Radar
            name="Tú"
            dataKey="Tú"
            stroke={COLOR_USUARIO}
            fill={COLOR_USUARIO}
            fillOpacity={0.18}
            strokeWidth={2.5}
            dot={{ fill: COLOR_USUARIO, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: COLOR_USUARIO, stroke: "#0f172a", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />

          {/* Capa del pokemon — verde esmeralda */}
          <Radar
            name={pokemonGanador.nombre}
            dataKey={pokemonGanador.nombre}
            stroke={COLOR_POKEMON}
            fill={COLOR_POKEMON}
            fillOpacity={0.12}
            strokeWidth={2.5}
            dot={{ fill: COLOR_POKEMON, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: COLOR_POKEMON, stroke: "#0f172a", strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* Tooltip temático oscuro */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
            itemStyle={{ color: "#e2e8f0" }}
            cursor={false}
          />

          {/* Sin <Legend> de Recharts — usamos la nuestra */}
          <Legend content={() => null} />

        </RadarChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada debajo del gráfico */}
      <LeyendaPersonalizada nombre={pokemonGanador.nombre} />
    </div>
  );
}