// 12 preguntas del test. Cada opcion tiene:
//  - texto:   lo que ve el usuario
//  - deltas:  puntos a los rasgos AG (Agresividad), SO (Sociabilidad), EN (Energia),
//             RE (Resiliencia), CU (Curiosidad). Los usan el radar y el algoritmo de respaldo.
//  - senales: etiquetas de personalidad en texto libre. Las lee la IA, y amplian las
//             5 dimensiones de arriba (valentia, creatividad, humor, lealtad, orden, serenidad...).
//
// Estructura pensada para React: cada pregunta tiene "texto" y "opciones".

export const PREGUNTAS = [
  {
    texto: "Alguien te corta el paso en una fila. ¿Qué haces?",
    opciones: [
      { texto: "Le digo algo directamente, no me callo", deltas: { AG: 3, EN: 2 }, senales: "directo, asertivo, valiente" },
      { texto: "Dejo que pase, no merece la pena el conflicto", deltas: { AG: -2, RE: 1 }, senales: "pacífico, paciente, evita el conflicto" },
      { texto: "Se lo comento a la persona de al lado, en plan broma", deltas: { SO: 3, AG: 1 }, senales: "sociable, con humor, desenfadado" },
      { texto: "Me quedo callado pero me fastidia el resto del día", deltas: { RE: -2, EN: -1 }, senales: "reservado, interioriza, rencoroso" },
    ],
  },
  {
    texto: "Es viernes noche, ¿qué prefieres?",
    opciones: [
      { texto: "Salir con un grupo grande, cuanta más gente mejor", deltas: { SO: 3, EN: 2 }, senales: "extrovertido, gregario, enérgico" },
      { texto: "Quedar con 1-2 amigos cercanos", deltas: { SO: 1, CU: 1 }, senales: "íntimo, leal, selectivo con sus vínculos" },
      { texto: "Quedarme en casa explorando algo nuevo", deltas: { CU: 3, SO: -2 }, senales: "curioso, autónomo, explorador interior" },
      { texto: "Quedarme en casa descansando, sin más", deltas: { RE: 2, SO: -3, EN: -2 }, senales: "tranquilo, casero, sereno, perezoso" },
    ],
  },
  {
    texto: "Te dan un proyecto nuevo sin instrucciones claras. ¿Cómo reaccionas?",
    opciones: [
      { texto: "Me lanzo a probar cosas, ya iré ajustando", deltas: { EN: 3, CU: 2 }, senales: "creativo, impulsivo, experimentador" },
      { texto: "Pido ayuda o referencias antes de empezar", deltas: { SO: 2, RE: 1 }, senales: "colaborativo, prudente, humilde" },
      { texto: "Investigo a fondo por mi cuenta antes de mover un dedo", deltas: { CU: 3, EN: -2 }, senales: "metódico, analítico, independiente" },
      { texto: "Me agobia un poco, prefiero que me digan qué hacer paso a paso", deltas: { RE: -2, AG: -2 }, senales: "inseguro, necesita estructura y orden" },
    ],
  },
  {
    texto: "¿Cómo te enfrentas a un conflicto con un amigo/pareja?",
    opciones: [
      { texto: "Lo hablo de frente, cuanto antes mejor", deltas: { AG: 2, EN: 2 }, senales: "directo, honesto, valiente" },
      { texto: "Necesito tiempo para pensarlo antes de hablar", deltas: { RE: 2, CU: 1 }, senales: "reflexivo, sereno, introspectivo" },
      { texto: "Evito el tema todo lo que puedo", deltas: { AG: -3, RE: -1 }, senales: "evitativo, pacífico, tímido" },
      { texto: "Busco a alguien más para que medie", deltas: { SO: 3, AG: -1 }, senales: "diplomático, dependiente del grupo, sociable" },
    ],
  },
  {
    texto: "Estás en un sitio nuevo (ciudad, evento). ¿Qué haces?",
    opciones: [
      { texto: "Exploro solo, sin rumbo fijo", deltas: { CU: 3, SO: -2 }, senales: "aventurero, autónomo, curioso" },
      { texto: "Pregunto a la gente del lugar, hago contactos", deltas: { SO: 3, CU: 1 }, senales: "sociable, encantador, comunicativo" },
      { texto: "Sigo una ruta/plan ya hecho, sin sorpresas", deltas: { RE: 1, CU: -2 }, senales: "planificador, ordenado, cauto" },
      { texto: "Me quedo en lo conocido, no me arriesgo mucho", deltas: { RE: -1, CU: -3 }, senales: "conservador, cómodo, cauto" },
    ],
  },
  {
    texto: "¿Cómo sueles tomar decisiones importantes?",
    opciones: [
      { texto: "Rápido, por instinto", deltas: { EN: 3, AG: 1 }, senales: "impulsivo, intuitivo, decidido" },
      { texto: "Despacio, sopesando todo", deltas: { EN: -3, RE: 1 }, senales: "reflexivo, cauteloso, paciente" },
      { texto: "Pidiendo opinión a gente de confianza", deltas: { SO: 2, EN: -1 }, senales: "leal, humilde, colaborativo" },
      { texto: "Dejándome llevar por lo que sienta en el momento", deltas: { CU: 2, EN: 1 }, senales: "emocional, espontáneo, creativo" },
    ],
  },
  {
    texto: "Te encuentras con un problema sin solución clara. ¿Qué haces?",
    opciones: [
      { texto: "Insisto hasta resolverlo, no me rindo", deltas: { RE: 3, AG: 1 }, senales: "persistente, tenaz, terco" },
      { texto: "Pruebo varias formas distintas hasta que algo funcione", deltas: { CU: 2, EN: 2 }, senales: "creativo, flexible, inventivo" },
      { texto: "Pido ayuda enseguida", deltas: { SO: 3, RE: -1 }, senales: "sociable, humilde, práctico" },
      { texto: "Lo dejo para más tarde / paso de él", deltas: { RE: -3, EN: -2 }, senales: "evasivo, despreocupado, relajado" },
    ],
  },
  {
    texto: "En un grupo, ¿qué rol sueles tomar?",
    opciones: [
      { texto: "El que organiza y lidera", deltas: { AG: 2, SO: 2 }, senales: "líder, organizador, protector" },
      { texto: "El que da soporte a los demás, no destaca", deltas: { SO: 2, AG: -2 }, senales: "leal, cuidador, discreto" },
      { texto: "El que cuestiona y da ideas distintas", deltas: { CU: 3, AG: 1 }, senales: "crítico, creativo, rebelde" },
      { texto: "El que prefiere quedarse al margen, observando", deltas: { SO: -3, CU: 1 }, senales: "observador, reservado, analítico" },
    ],
  },
  {
    texto: "¿Qué te describe mejor un domingo ideal?",
    opciones: [
      { texto: "Algo activo: deporte, plan al aire libre", deltas: { EN: 3, RE: 1 }, senales: "deportista, activo, enérgico" },
      { texto: "Algo tranquilo y solitario, recargando pilas", deltas: { SO: -2, RE: 2 }, senales: "sereno, introvertido, equilibrado" },
      { texto: "Probar algo que nunca he hecho", deltas: { CU: 3, EN: 1 }, senales: "aventurero, curioso, creativo" },
      { texto: "Plan social, estar rodeado de gente", deltas: { SO: 3, EN: 1 }, senales: "social, expansivo, alegre" },
    ],
  },
  {
    texto: "Si alguien te ataca verbalmente o te critica injustamente:",
    opciones: [
      { texto: "Respondo con la misma intensidad", deltas: { AG: 3, EN: 1 }, senales: "combativo, orgulloso, intenso" },
      { texto: "Encajo el golpe pero no contraataco", deltas: { RE: 3, AG: -2 }, senales: "estoico, sereno, resiliente" },
      { texto: "Me afecta bastante, me cuesta recuperarme", deltas: { RE: -3 }, senales: "sensible, vulnerable, emocional" },
      { texto: "Le resto importancia y sigo a otra cosa", deltas: { AG: -1, EN: 1 }, senales: "desenfadado, con humor, ligero" },
    ],
  },
  {
    texto: "Un amigo se mete en un lío y te llama a medianoche pidiendo ayuda. ¿Qué haces?",
    opciones: [
      { texto: "Voy a por él sin pensarlo, cueste lo que cueste", deltas: { SO: 2, EN: 2, AG: 1 }, senales: "leal, protector, impulsivo, valiente" },
      { texto: "Le escucho con calma y le ayudo a pensar qué hacer", deltas: { RE: 2, SO: 1 }, senales: "sereno, sensato, cuidador, buen consejero" },
      { texto: "Le ayudo, pero le digo claro que se veía venir", deltas: { AG: 2, RE: 1 }, senales: "franco, directo, responsable, algo severo" },
      { texto: "Le digo que mañana lo vemos, necesito descansar", deltas: { EN: -2, SO: -1 }, senales: "independiente, prioriza su propio descanso, desapegado" },
    ],
  },
  {
    texto: "Te proponen algo que da vértigo de verdad (saltar en paracaídas, hablar ante cientos de personas). ¿Cómo reaccionas?",
    opciones: [
      { texto: "Soy el primero en apuntarme", deltas: { AG: 2, EN: 3, CU: 1 }, senales: "valiente, temerario, amante del riesgo" },
      { texto: "Lo hago, aunque con nervios, porque luego me alegro", deltas: { RE: 3, CU: 1 }, senales: "valiente, superación personal, determinado" },
      { texto: "Solo si veo que los demás lo hacen primero", deltas: { SO: 2, AG: -1 }, senales: "prudente, se contagia del grupo, cauto" },
      { texto: "Prefiero mirar desde fuera, no es lo mío", deltas: { RE: -1, CU: -2, EN: -1 }, senales: "precavido, tranquilo, evita el riesgo" },
    ],
  },
];
