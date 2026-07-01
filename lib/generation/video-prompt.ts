const SCENE_PROMPTS: Record<string, string> = {
  "construction-rise":
    "Timelapse cinematografico de construccion. Empieza con un terreno vacio, luego se vierten los cimientos, suben vigas de acero, las plantas se apilan rapidamente, se instalan fachadas de vidrio y el edificio de la imagen de referencia aparece terminado. Mantiene la arquitectura exacta de la imagen como resultado final. Gruas, andamios y polvo iluminado por sol dorado.",

  "four-seasons":
    "Timelapse cinematografico de cuatro estaciones de este edificio y escena exactos. Primavera: flores, hierba fresca. Verano: verde intenso, flores vibrantes, cielo azul. Otono: hojas rojas y doradas cayendo suavemente. Invierno: nieve cubriendo todo, escarcha en superficies y luces interiores calidas. Transiciones estacionales fluidas. Mantiene el edificio exactamente como se muestra.",

  "weather-drama":
    "Timelapse dramatico de tormenta sobre este edificio exacto. El cielo despejado se oscurece, el viento dobla arboles, la lluvia golpea superficies, relampagos iluminan la fachada y despues la tormenta pasa revelando luz dorada y un arcoiris. Mantiene el edificio exactamente como se muestra.",

  "people-timelapse":
    "Timelapse cinematografico de actividad humana alrededor de este edificio exacto. Manana: llegan las primeras personas y se encienden luces. Mediodia: actividad intensa, gente caminando y coches circulando. Tarde: golden hour, personas saliendo y farolas encendiendose. Noche: el edificio brilla calido y aparecen trazas de luz de vehiculos. Mantiene el edificio exactamente como se muestra.",

  "snow-blanket":
    "Timelapse sereno de nevada sobre este edificio exacto. Primero caen copos delicados, luego la nieve se intensifica. Se acumula en cubiertas, bordes y suelo. La escena se transforma en un paisaje invernal mientras brillan luces interiores calidas. Mantiene el edificio exactamente como se muestra.",

  "timelapse-classic":
    "Timelapse arquitectonico clasico de este edificio exacto. Nubes rapidas cruzan el cielo y sus sombras barren la fachada. Los angulos de luz cambian dramaticamente, alternando tonos calidos y frios. Personas y vehiculos se convierten en estelas de movimiento. El edificio permanece inmovil mientras el mundo se acelera alrededor. Mantiene el edificio exactamente como se muestra.",
};

export function getScenePrompt(
  scenePresetId: string,
  userPrompt?: string,
  motionPresetPrompt?: string,
): string {
  const base = SCENE_PROMPTS[scenePresetId];

  if (base) {
    const parts = [base];
    if (motionPresetPrompt) parts.push(motionPresetPrompt);
    if (userPrompt) parts.push(userPrompt);
    console.log(`[VideoPrompt] Using hardcoded prompt for "${scenePresetId}"`);
    return parts.join(" ");
  }

  console.warn(`[VideoPrompt] No hardcoded prompt for "${scenePresetId}", using generic fallback`);
  const fallbackParts = [
    "Transformacion cinematografica de este edificio exacto.",
    "Mantiene el edificio exactamente como se muestra en la imagen de referencia.",
  ];
  if (motionPresetPrompt) fallbackParts.push(motionPresetPrompt);
  if (userPrompt) fallbackParts.push(userPrompt);
  return fallbackParts.join(" ");
}
