export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_DATA: FaqItem[] = [
  {
    question: "Necesito saber renderizar o escribir prompts?",
    answer:
      "No. Si puedes subir un archivo y elegir unas cuantas opciones visuales, puedes usar BrickEx. No hay prompt engineering, ajustes de render que dominar ni curva de aprendizaje: eliges estilos y materiales desde miniaturas y la IA se encarga del resto.",
  },
  {
    question: "Que formatos de archivo acepta BrickEx?",
    answer:
      "Casi todo lo que usarias para comunicar un diseno: archivos de SketchUp, exportaciones de AutoCAD (DWG/DXF), planos (PDF, PNG, JPG), bocetos a mano, capturas de modelos 3D y fotos de edificios existentes. Si el diseno se ve, BrickEx puede trabajar con el.",
  },
  {
    question: "Que tan fotorrealistas son los renders?",
    answer:
      "Calidad editorial. BrickEx produce materiales, iluminacion, sombras y paisajismo precisos, con aspecto de estudio 3D profesional: lo bastante buenos para usarlos en listings, pitch decks y presentaciones.",
  },
  {
    question: "Que tan rapido es?",
    answer:
      "La mayoria de renders llegan en 15-30 segundos. Y como es self-service, puedes crear tantas variaciones como quieras — luz, hora del dia, clima, staging — sin esperar horas ni pagar por cada una.",
  },
  {
    question: "Puedo controlar la iluminacion, el mood y el staging?",
    answer:
      "Si. Renderiza el mismo proyecto de dia, en hora dorada, de noche, nublado o al amanecer, y anade personas, vehiculos y paisajismo para crear escenas de marketing completas desde una sola subida.",
  },
  {
    question: "Tambien funciona para interiores?",
    answer:
      "Por supuesto. Sube una habitacion vacia o un interior existente y BrickEx lo amuebla con estilos como moderno minimalista, escandinavo, art deco o industrial. Cambia muebles, tapicerias, suelos e iluminacion en segundos.",
  },
  {
    question: "Puedo generar video, no solo imagenes?",
    answer:
      "Si. Convierte un render en recorridos cinematicos, timelapses de construccion, transiciones de dia a noche y sobrevuelos aereos: ideal para presentaciones a clientes y redes sociales.",
  },
  {
    question: "Puedo usar los renders comercialmente?",
    answer:
      "Si. Los renders que creas son tuyos para usarlos en listings, marketing, trabajo de clientes y presentaciones. Siguen siendo tuyos aunque canceles el plan.",
  },
  {
    question: "Para quien es BrickEx?",
    answer:
      "Para arquitectos, promotores inmobiliarios, marketers de propiedades, interioristas y estudiantes: cualquiera que necesite visuales convincentes rapido. Si alguna vez esperaste semanas o pagaste miles por un render 3D, BrickEx esta hecho para ti.",
  },
  {
    question: "Y si quiero cancelar?",
    answer:
      "Cancela cuando quieras con un clic: sin contratos ni permanencia. No se te volvera a cobrar y cada render que ya hayas hecho seguira siendo tuyo para siempre.",
  },
];
