// 12 preguntas del test. Cada opcion suma/resta puntos a los rasgos
// AG (Agresividad), SO (Sociabilidad), EN (Energia), RE (Resiliencia), CU (Curiosidad)
//
// Estructura pensada para React: cada pregunta tiene "texto" (rellena tu enunciado)
// y "opciones", cada una con su texto visible y sus deltas internos.

export const PREGUNTAS = [
  {
    texto: "Alguien te corta el paso en una fila. ¿Qué haces?",
    opciones: [
      { texto: "Le digo algo directamente, no me callo", deltas: { AG: 3, EN: 2 } },
      { texto: "Dejo que pase, no merece la pena el conflicto", deltas: { AG: -2, RE: 1 } },
      { texto: "Se lo comento a la persona de al lado, en plan broma", deltas: { SO: 3, AG: 1 } },
      { texto: "Me quedo callado pero me fastidia el resto del día", deltas: { RE: -2, EN: -1 } },
    ],
  },
  {
    texto: "Es viernes noche, ¿qué prefieres?",
    opciones: [
      { texto: "Salir con un grupo grande, cuanta más gente mejor", deltas: { SO: 3, EN: 2 } },
      { texto: "Quedar con 1-2 amigos cercanos", deltas: { SO: 1, CU: 1 } },
      { texto: "Quedarme en casa explorando algo nuevo", deltas: { CU: 3, SO: -2 } },
      { texto: "Quedarme en casa descansando, sin más", deltas: { RE: 2, SO: -3, EN: -2 } },
    ],
  },
  {
    texto: "Te dan un proyecto nuevo sin instrucciones claras. ¿Cómo reaccionas?",
    opciones: [
      { texto: "Me lanzo a probar cosas, ya iré ajustando", deltas: { EN: 3, CU: 2 } },
      { texto: "Pido ayuda o referencias antes de empezar", deltas: { SO: 2, RE: 1 } },
      { texto: "Investigo a fondo por mi cuenta antes de mover un dedo", deltas: { CU: 3, EN: -2 } },
      { texto: "Me agobia un poco, prefiero que me digan qué hacer paso a paso", deltas: { RE: -2, AG: -2 } },
    ],
  },
  {
    texto: "¿Cómo te enfrentas a un conflicto con un amigo/pareja?",
    opciones: [
      { texto: "Lo hablo de frente, cuanto antes mejor", deltas: { AG: 2, EN: 2 } },
      { texto: "Necesito tiempo para pensarlo antes de hablar", deltas: { RE: 2, CU: 1 } },
      { texto: "Evito el tema todo lo que puedo", deltas: { AG: -3, RE: -1 } },
      { texto: "Busco a alguien más para que medie", deltas: { SO: 3, AG: -1 } },
    ],
  },
  {
    texto: "Estás en un sitio nuevo (ciudad, evento). ¿Qué haces?",
    opciones: [
      { texto: "Exploro solo, sin rumbo fijo", deltas: { CU: 3, SO: -2 } },
      { texto: "Pregunto a la gente del lugar, hago contactos", deltas: { SO: 3, CU: 1 } },
      { texto: "Sigo una ruta/plan ya hecho, sin sorpresas", deltas: { RE: 1, CU: -2 } },
      { texto: "Me quedo en lo conocido, no me arriesgo mucho", deltas: { RE: -1, CU: -3 } },
    ],
  },
  {
    texto: "¿Cómo sueles tomar decisiones importantes?",
    opciones: [
      { texto: "Rápido, por instinto", deltas: { EN: 3, AG: 1 } },
      { texto: "Despacio, sopesando todo", deltas: { EN: -3, RE: 1 } },
      { texto: "Pidiendo opinión a gente de confianza", deltas: { SO: 2, EN: -1 } },
      { texto: "Dejándome llevar por lo que sienta en el momento", deltas: { CU: 2, EN: 1 } },
    ],
  },
  {
    texto: "Te encuentras con un problema sin solución clara. ¿Qué haces?",
    opciones: [
      { texto: "Insisto hasta resolverlo, no me rindo", deltas: { RE: 3, AG: 1 } },
      { texto: "Pruebo varias formas distintas hasta que algo funcione", deltas: { CU: 2, EN: 2 } },
      { texto: "Pido ayuda enseguida", deltas: { SO: 3, RE: -1 } },
      { texto: "Lo dejo para más tarde / paso de él", deltas: { RE: -3, EN: -2 } },
    ],
  },
  {
    texto: "En un grupo, ¿qué rol sueles tomar?",
    opciones: [
      { texto: "El que organiza y lidera", deltas: { AG: 2, SO: 2 } },
      { texto: "El que da soporte a los demás, no destaca", deltas: { SO: 2, AG: -2 } },
      { texto: "El que cuestiona y da ideas distintas", deltas: { CU: 3, AG: 1 } },
      { texto: "El que prefiere quedarse al margen, observando", deltas: { SO: -3, CU: 1 } },
    ],
  },
  {
    texto: "¿Qué te describe mejor un domingo ideal?",
    opciones: [
      { texto: "Algo activo: deporte, plan al aire libre", deltas: { EN: 3, RE: 1 } },
      { texto: "Algo tranquilo y solitario, recargando pilas", deltas: { SO: -2, RE: 2 } },
      { texto: "Probar algo que nunca he hecho", deltas: { CU: 3, EN: 1 } },
      { texto: "Plan social, estar rodeado de gente", deltas: { SO: 3, EN: 1 } },
    ],
  },
  {
    texto: "Si alguien te ataca verbalmente o te critica injustamente:",
    opciones: [
      { texto: "Respondo con la misma intensidad", deltas: { AG: 3, EN: 1 } },
      { texto: "Encajo el golpe pero no contraataco", deltas: { RE: 3, AG: -2 } },
      { texto: "Me afecta bastante, me cuesta recuperarme", deltas: { RE: -3 } },
      { texto: "Le resto importancia y sigo a otra cosa", deltas: { AG: -1, EN: 1 } },
    ],
  },
  {
    texto: "¿Cómo te llevas con la rutina?",
    opciones: [
      { texto: "La odio, necesito cambios constantes", deltas: { CU: 3, EN: 1 } },
      { texto: "Me da seguridad, la prefiero", deltas: { RE: 2, CU: -3 } },
      { texto: "Me adapto bien a ambas, no me afecta", deltas: { RE: 1 } },
      { texto: "Le añado pequeñas variaciones para no aburrirme", deltas: { CU: 2, EN: 1 } },
    ],
  },
  {
    texto: "¿Qué prefieres en tu tiempo libre?",
    opciones: [
      { texto: "Estar rodeado de mucha gente", deltas: { SO: 3 } },
      { texto: "Estar con 1-2 personas muy cercanas", deltas: { SO: 1, RE: 1 } },
      { texto: "Estar completamente solo", deltas: { SO: -3 } },
      { texto: "Depende totalmente del día", deltas: { CU: 2 } },
    ],
  },
];
