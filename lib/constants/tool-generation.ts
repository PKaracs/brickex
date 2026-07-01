import "server-only";

type ToolAspectRatio =
  | "square"
  | "portrait"
  | "story"
  | "cinema"
  | "ultrawide"
  | "tallBanner"
  | "wideBanner"
  | "ultraTall"
  | "ultraWideBanner";

export interface ToolGenerationSpec {
  label: string;
  outputTitle: string;
  aspectRatio: ToolAspectRatio;
  maxInputImages: number;
  referenceInstruction: string;
  prompt: string;
  referenceImageLabel?: string;
}

export const TOOL_GENERATION_SPECS = {
  "exploded-diagram": {
    label: "Diagrama explotado",
    outputTitle: "Diagrama explotado",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA FIDELIDAD AL SUJETO ES OBLIGATORIA:

Usa la imagen subida como fuente exacta de verdad. Identifica el sujeto principal y conserva su geometria real, proporciones, lenguaje de diseno y logica de ensamblaje.

Reglas:
- El diagrama generado debe reconocerse de inmediato como el mismo sujeto de la referencia
- Ignora el ruido accidental del fondo y aisla limpiamente el sujeto principal
- No redisenes, reestilices ni sustituyas el sujeto
- Separa solo piezas visibles o fuertemente inferidas por la imagen fuente`,
    prompt: `Crea un diagrama axonometrico explotado premium del sujeto principal exacto de la imagen de referencia.

OBJETIVO VISUAL
- Muestra como se ensambla el sujeto separandolo en capas limpias y legibles
- El resultado debe sentirse como una lamina de presentacion de arquitectura o diseno industrial de nivel galeria

FIDELIDAD ESTRUCTURAL
- Conserva la silueta, huella, proporciones, masa, aberturas, ritmo estructural, perfil de cubierta o remate superior y detalles clave exactos
- Mantiene la misma identidad material y lenguaje formal que la referencia
- Separa solo ensamblajes logicos reales; no inventes fragmentos fantasticos, plantas extra ni piezas decorativas

COMPOSICION EXPLOTADA
- Usa una vista axonometrica o isometrica centrada a 3/4 con el sujeto completo visible
- Separa el sujeto en componentes logicos en el orden correcto de reensamblaje
- Usa espaciado vertical limpio entre capas para que la secuencia sea evidente
- Mantiene todas las capas alineadas en un eje central; sin dispersion caotica ni desplazamientos aleatorios
- Si el sujeto es un edificio, piensa en sistemas como emplazamiento/base, podio, losas o placas de piso, nucleo estructural, envolvente de fachada, cubierta, coronacion y volumenes anexos
- Si el sujeto es un producto u objeto, piensa en sistemas como base, chasis, carcasa, modulos internos, cubiertas y elementos superiores

ESTILO
- Ilustracion tecnica refinada, no fotografia
- Lineas de contorno nitidas, bordes disciplinados, sombreado tonal sutil y senales materiales contenidas
- Fondo blanco roto limpio con sombra de estudio suave y espacio negativo premium
- Elegante, preciso, legible, lujoso y listo para presentacion

REGLAS NEGATIVAS
- Sin texto, etiquetas, flechas, numeros, llamadas, marca de agua ni logotipo
- Sin personas, entorno ocupado ni escenografia decorativa salvo que sea integral al sujeto
- Sin estilo de caricatura, sin aspecto de cuaderno desordenado, sin fragmentacion surrealista ni distorsion dramatica de perspectiva

ILUMINACION Y COLOR
- Luz de estudio diurna, neutra y suave desde arriba a la izquierda
- Sombras de contacto delicadas y alta claridad
- Paleta material neutralizada y fiel derivada de la referencia

Devuelve un unico diagrama explotado pulido del sujeto exacto.`,
  },
  "floorplan-to-furnished": {
    label: "Plano vacio a amueblado",
    outputTitle: "Plano amueblado",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA FIDELIDAD AL PLANO ES OBLIGATORIA:

Usa el plano subido como fuente espacial exacta. Conserva exactamente la geometria de muros, puertas, ventanas, escaleras, zonas humedas, nucleos fijos, circulacion y proporciones de estancias.

Reglas:
- No muevas muros, no cambies tamanos de estancias ni inventes espacios extra
- Mantiene todo el mobiliario a una escala realista
- Amuebla solo dentro de areas validas y manten una circulacion clara`,
    prompt: `Crea un plano arquitectonico amueblado premium a partir del trazado exacto de referencia.

TIPO DE SALIDA
- Plano de presentacion cenital de interiorista, no render en perspectiva
- La geometria base del plano debe permanecer precisa, limpia y facil de leer

MOBILIARIO
- Rellena cada estancia con distribuciones modernas coherentes y apropiadas para su funcion
- Anade camas, mesillas, sofas, mesas de centro, comedores, mobiliario de cocina, alfombras, sanitarios, almacenaje y simbolos de iluminacion cuando corresponda
- Respeta giros de puertas, posiciones de ventanas, holguras de circulacion y separaciones realistas
- Haz que el resultado se sienta disenado con intencion, elegante y profesionalmente resuelto

ESTILO VISUAL
- Estetica refinada de lamina de presentacion
- Linea nitida, sombras sutiles, paleta neutra suave, bloques materiales delicados y espacio negativo limpio
- Calidad premium de estudio de arquitectura e interiorismo

REGLAS NEGATIVAS
- Sin texto, nombres de estancias, cotas, flechas, leyendas, marca de agua ni logotipo
- Sin vista en perspectiva, sin muros seccionados, sin escenografia exterior, sin personas
- Sin exceso de muebles ni escala imposible`,
  },
  "upholstery-change": {
    label: "Cambio de tapiceria",
    outputTitle: "Variacion de tapiceria",
    aspectRatio: "cinema",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA ESCENA DEBE QUEDAR BLOQUEADA:

Usa la foto subida de la estancia o mueble como fuente exacta de verdad. Conserva el angulo de camara, encuadre, iluminacion, arquitectura, objetos alrededor y la silueta exacta de la pieza tapizada principal.

Reglas:
- La misma estancia debe seguir siendo reconocible de inmediato
- Mantiene intactos forma, costuras, cojines, pespuntes, capitone y proporciones del mueble
- Solo deben cambiar el material y color de la tapiceria de forma creible`,
    prompt: `Crea una edicion premium de material de mobiliario sobre la misma escena exacta.

OBJETIVO DE EDICION
- Cambia solo la tapiceria de la pieza principal tapizada
- Mantiene todo lo demas de la estancia practicamente identico
- El resultado debe sentirse como una mejora de material de interiorismo de alta gama, no como un rediseno

RESULTADO MATERIAL
- Sustituye la tapiceria original por un acabado lujoso y sobrio elegido para encajar con la paleta existente, como boucle refinado, lino texturizado, terciopelo, piel o tejido tecnico
- Representa fibras, pelo, costuras, pliegues, compresion y respuesta a la luz de forma realista
- El nuevo material debe verse fisicamente plausible y profesionalmente seleccionado para la estancia

PRESERVACION DE ESCENA
- Mantiene la misma posicion de camara, perspectiva, decoracion, ventanas, suelo, color de pared y direccion de luz
- Igualar sombras, reflejos y exposicion general originales

REGLAS NEGATIVAS
- Sin muebles nuevos, sin cambios de distribucion, sin arquitectura alterada
- No muevas objetos por la estancia
- Sin texto, marca de agua, logotipo ni comparacion en pantalla dividida`,
  },
  "moodboard-to-render": {
    label: "Moodboard a render",
    outputTitle: "Render de moodboard",
    aspectRatio: "cinema",
    maxInputImages: 4,
    referenceImageLabel: "IMAGEN DE MOODBOARD",
    referenceInstruction: `IMAGENES DE REFERENCIA - LA SINTESIS DE ESTILO ES OBLIGATORIA:

Trata todas las imagenes subidas como un unico moodboard combinado. Extrae su direccion compartida: paleta, materiales, lenguaje de mobiliario, claves de estilismo, ambiente de iluminacion y personalidad general del diseno.

Reglas:
- Usa todas las referencias juntas para construir un lenguaje de diseno coherente
- No crees un collage, tablero ni composicion dividida
- Sintetiza las referencias en una escena interior resuelta que se sienta intencional y creible`,
    prompt: `Crea un render interior fotorealista destilado del moodboard subido.

SINTESIS DE DISENO
- Infiere un unico concepto de estancia cohesivo a partir de todas las referencias
- Fusiona las senales recurrentes mas fuertes en un interior pulido en lugar de copiar literalmente una sola imagen
- Mantiene el diseno elevado, consistente y editorial; nunca caotico ni sobredecorado

ESCENA
- Muestra un interior completo y profesionalmente disenado que refleje claramente el moodboard mediante arquitectura, muebles, materiales, textiles, decoracion e iluminacion
- Haz que cada pieza se sienta curada y coherente con la misma historia de diseno
- Usa composicion espacial creible y mobiliario a escala real

ESTILO VISUAL
- Fotografia interior de calidad Architectural Digest
- Materiales tactiles ricos, estilismo sutilmente habitado, composicion limpia, profundidad natural y sensacion premium residencial u hotelera
- Usa luz de dia, sol suave o iluminacion ambiental atmosferica solo si encaja con el moodboard

REGLAS NEGATIVAS
- Sin textura de papel, collage, layout de moodboard, texto, marca de agua ni marcas
- Sin objetos surrealistas, estilos mezclados sin relacion ni geometria de estancia inconsistente`,
  },
  "render-to-isometric": {
    label: "Render a diagrama isometrico",
    outputTitle: "Diagrama isometrico",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA FIDELIDAD AL EDIFICIO ES OBLIGATORIA:

Usa el render arquitectonico subido como fuente exacta de verdad para la volumetria, huella, aberturas, terrazas, ritmo de fachada, perfil de cubierta y organizacion del sitio.

Reglas:
- Conserva el sujeto para que siga siendo reconocible al instante como el mismo proyecto
- Simplifica el estilo de representacion, no la arquitectura en si
- Mantiene solo el contexto esencial vinculado al edificio y al sitio`,
    prompt: `Crea un diagrama isometrico limpio de presentacion de la misma arquitectura exacta.

OBJETIVO DE TRANSFORMACION
- Convierte el render fotorealista en una ilustracion arquitectonica isometrica o axonometrica fiel
- Conserva la identidad del edificio mientras simplificas la escena en un grafico de presentacion claro

ESTILO
- Lineas de contorno nitidas, masas con sombreado plano, diferenciacion material contenida, sombra ambiental suave y claridad premium de lamina de presentacion
- Paleta refinada de neutros calidos, azules de vidrio apagados, tonos piedra y vegetacion sobria
- Elegante, minimo, legible y profesional

COMPOSICION
- Usa un angulo isometrico estable con el edificio completo visible
- Muestra terrazas principales, elementos de podio, rasgos de cubierta y piezas clave de paisaje o pavimento cuando sean relevantes
- Fondo blanco roto o gris calido palido con generoso espacio negativo

REGLAS NEGATIVAS
- Sin etiquetas, flechas, anotaciones, marca de agua ni logotipo
- Sin personas, cielo dramatico, efecto de boceto desordenado ni partes explotadas
- Sin artefactos de camara fotorealistas ni profundidad de campo cinematica`,
  },
  "floorplan-to-3d": {
    label: "Plano a diagrama 3D",
    outputTitle: "Diagrama 3D de plano",
    aspectRatio: "square",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA FIDELIDAD AL PLANO ES OBLIGATORIA:

Usa el plano subido como fuente exacta de verdad. Conserva exactamente la distribucion de estancias, posiciones de muros, aberturas, escaleras, patinillos, elementos estructurales y circulacion.

Reglas:
- No inventes estancias extra, no cambies adyacencias ni distorsiones la huella
- El diagrama resultante debe poder rastrearse hasta el plano original
- Anade mobiliario o elementos de programa solo para aclarar el uso de las estancias`,
    prompt: `Crea un diagrama axonometrico 3D seccionado y limpio a partir del plano exacto.

OBJETIVO ESPACIAL
- Traduce el plano plano en un diagrama espacial tridimensional legible
- Mantiene el trazado exacto mientras haces que las estancias se entiendan de inmediato en 3D

SALIDA
- Usa una vista axonometrica o isometrica seccionada a 45 grados
- Muestra muros parcialmente cortados o levantados solo lo necesario para revelar la organizacion interior
- Anade elementos de programa y mobiliario creibles solo cuando ayuden a explicar el trazado

ESTILO
- Estetica de maqueta arquitectonica con luz diurna suave, sombras sutiles, senales materiales contenidas y paleta neutra calida
- Listo para presentacion, elegante, profesional y facil de leer
- Fondo limpio y composicion equilibrada con el plano completo visible

REGLAS NEGATIVAS
- Sin texto, etiquetas, cotas, personas, marca de agua ni logotipo
- Sin distorsion dramatica de perspectiva, sin escena lifestyle fotorealista, sin estilo de garabato
- Sin alterar la distribucion de estancias ni anadir niveles especulativos`,
  },
  "landscape-generator": {
    label: "Generador de paisajismo",
    outputTitle: "Visualizacion de paisaje",
    aspectRatio: "cinema",
    maxInputImages: 1,
    referenceInstruction: `IMAGEN DE REFERENCIA - LA FIDELIDAD AL TRAZADO DEL SITIO ES OBLIGATORIA:

Usa el boceto, imagen del sitio o dibujo conceptual subido como guia exacta para la geometria del sitio, zonas duras, parterres, alineacion de caminos, elementos de agua y masas principales de paisaje.

Reglas:
- Si la entrada es un boceto, conserva el trazado dibujado mientras lo elevas a un diseno resuelto
- Si la entrada es una foto de sitio existente, redisena dentro de la misma huella y punto de vista
- Mantiene el paisaje creible, construible y correctamente escalado`,
    prompt: `Crea una visualizacion premium de paisajismo del sitio exacto de la referencia.

OBJETIVO DE DISENO
- Convierte la referencia en un entorno exterior plenamente resuelto con pavimentos coherentes, plantacion por capas, circulacion elegante y composicion equilibrada
- Haz que el resultado se sienta contemporaneo, intencional y lujoso sin sobrellenar el sitio

ESCENA
- Incluye pavimentos creibles, parterres, arboles, arbustos, cesped o grava, zonas de asiento, iluminacion puntual y elementos de agua cuando la referencia lo permita
- Mantiene todas las decisiones de diseno alineadas con el trazado y escala de la referencia
- Asegura que la organizacion espacial siga siendo clara y profesionalmente planificada

ESTILO VISUAL
- Fotografia de paisajismo de alta gama o visualizacion aerea/de sitio premium segun el punto de vista de entrada
- Textura vegetal rica, sombras realistas, luz diurna limpia u hora dorada calida, calidad residencial u hotelera refinada

REGLAS NEGATIVAS
- Sin texto, notas manuscritas, fondo de papel, marca de agua ni logotipo
- Sin escenografia fantastica ajena al sitio
- Sin escala vegetal imposible, caos sobrecrecido ni efectos de parque tematico`,
  },
} as const satisfies Record<string, ToolGenerationSpec>;

export type SupportedToolId = keyof typeof TOOL_GENERATION_SPECS;

export function isSupportedToolId(toolId: string): toolId is SupportedToolId {
  return toolId in TOOL_GENERATION_SPECS;
}
