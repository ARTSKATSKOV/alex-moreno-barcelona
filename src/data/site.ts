import type { Place } from "@/data/schedule";

export interface ProofStat {
  id: string;
  value: string;
  labelEn: string;
  labelEs: string;
}

export interface TrainingFormat {
  id: "small-group" | "private-1on1";
  badgeEn: string;
  badgeEs: string;
  titleEn: string;
  titleEs: string;
  summaryEn: string;
  summaryEs: string;
  highlightsEn: string[];
  highlightsEs: string[];
  ctaEn: string;
  ctaEs: string;
}

export interface PricingTier {
  id: string;
  nameEn: string;
  nameEs: string;
  priceEur: number;
  unitEn: string;
  unitEs: string;
  taglineEn: string;
  taglineEs: string;
  featuresEn: string[];
  featuresEs: string[];
  featured?: boolean;
  badgeEn?: string;
  badgeEs?: string;
}

export interface TrainingLocation {
  id: string;
  /** Matches Session.spot exactly so clicking filters the schedule directly. */
  spot: string;
  place: Place;
  neighborhood: string;
  landmarkEn: string;
  landmarkEs: string;
  metro: string;
  mapsUrl: string;
}

export interface FaqItem {
  id: string;
  questionEn: string;
  questionEs: string;
  answerEn: string;
  answerEs: string;
}

export interface Testimonial {
  id: string;
  quoteEn: string;
  quoteEs: string;
  name: string;
  roleEn: string;
  roleEs: string;
}

export const CONTACT = {
  brand: "Alex Moreno",
  city: "Barcelona, Spain",
  email: "hello@alexmoreno.fit",
  instagramHandle: "@alexmoreno.fit",
  instagramUrl: "https://instagram.com/alexmoreno.fit",
  whatsappDisplay: "+34 612 345 678",
  whatsappUrl:
    "https://wa.me/34612345678?text=Hi%20Alex%2C%20I%27d%20like%20to%20ask%20about%20strength%20sessions%20in%20Barcelona.",
  studioHoursEn: "Mon–Fri 07:00–20:30 · Sat–Sun 09:00–12:00",
  studioHoursEs: "Lun–Vie 07:00–20:30 · Sáb–Dom 09:00–12:00",
} as const;

export const PROOF_STATS: ProofStat[] = [
  { id: "years", value: "10+", labelEn: "Years coaching", labelEs: "Años entrenando" },
  { id: "clients", value: "1,200+", labelEn: "Clients trained", labelEs: "Clientes entrenados" },
  {
    id: "retention",
    value: "14 mo",
    labelEn: "Avg. client stay",
    labelEs: "Media de permanencia",
  },
  { id: "cap", value: "6–12", labelEn: "Max per session", labelEs: "Máx. por sesión" },
];

export const TRAINING_FORMATS: TrainingFormat[] = [
  {
    id: "small-group",
    badgeEn: "Book online",
    badgeEs: "Reserva online",
    titleEn: "Small-Group Sessions",
    titleEs: "Sesiones en Grupo Reducido",
    summaryEn:
      "Capped at 6 in the studio and 8–12 outdoors so you get real technical coaching with the energy of a consistent crew.",
    summaryEs:
      "Máximo 6 personas en estudio y 8–12 al aire libre: corrección técnica real con la energía de un grupo constante.",
    highlightsEn: [
      "Structured 6-week progressive strength & conditioning blocks",
      "Fixed 45–60 min slots built around workdays",
      "All equipment provided — studio & outdoor access",
    ],
    highlightsEs: [
      "Ciclos progresivos de 6 semanas de fuerza y acondicionamiento",
      "Horarios fijos de 45–60 min adaptados a tu jornada",
      "Todo el material incluido — estudio y exterior",
    ],
    ctaEn: "Pick a slot",
    ctaEs: "Elegir horario",
  },
  {
    id: "private-1on1",
    badgeEn: "By inquiry",
    badgeEs: "Bajo solicitud",
    titleEn: "Private 1:1 Coaching",
    titleEs: "Entrenamiento Privado 1:1",
    summaryEn:
      "Individualized programming in the Eixample studio or outdoors for specific strength targets, injury rehab, or travel schedules.",
    summaryEs:
      "Programación individual en el estudio del Eixample o exterior para objetivos concretos, readaptación o agendas variables.",
    highlightsEn: [
      "Full movement assessment & custom training log",
      "Flexible scheduling outside the group timetable",
      "Direct WhatsApp check-ins between sessions",
    ],
    highlightsEs: [
      "Evaluación completa y registro personalizado",
      "Horarios flexibles fuera del calendario grupal",
      "Seguimiento directo por WhatsApp entre sesiones",
    ],
    ctaEn: "Inquire for 1:1",
    ctaEs: "Consultar 1:1",
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "trial",
    nameEn: "First Trial Session",
    nameEs: "Primera Sesión de Prueba",
    priceEur: 15,
    unitEn: "one-time",
    unitEs: "pago único",
    taglineEn: "Test any studio or outdoor class before committing.",
    taglineEs: "Prueba cualquier sesión en estudio o exterior sin compromiso.",
    featuresEn: [
      "Valid for any small-group session",
      "Quick 5-min pre-session goal check",
      "Pay on arrival — no card required",
    ],
    featuresEs: [
      "Válida para cualquier sesión en grupo",
      "Breve charla previa de objetivos",
      "Pago al llegar — sin tarjeta",
    ],
    badgeEn: "Best for new clients",
    badgeEs: "Ideal para empezar",
  },
  {
    id: "pack-10",
    nameEn: "10-Session Pack",
    nameEs: "Bono 10 Sesiones",
    priceEur: 190,
    unitEn: "€19 / session",
    unitEs: "19 € / sesión",
    taglineEn: "Flexible credits for studio and outdoor training.",
    taglineEs: "Créditos flexibles para sesiones en estudio y exterior.",
    featuresEn: [
      "Valid for 4 months from first class",
      "Mix Studio & Outdoor sessions freely",
      "Priority waitlist access",
    ],
    featuresEs: [
      "Válido durante 4 meses desde tu primera clase",
      "Combina estudio y exterior libremente",
      "Prioridad en lista de espera",
    ],
    featured: true,
    badgeEn: "Most popular",
    badgeEs: "Más popular",
  },
  {
    id: "drop-in",
    nameEn: "Single Drop-In",
    nameEs: "Sesión Suelta",
    priceEur: 25,
    unitEn: "per class",
    unitEs: "por sesión",
    taglineEn: "Pay as you go whenever your week opens up.",
    taglineEs: "Paga solo cuando te encaje en la semana.",
    featuresEn: [
      "Studio €22–€25 · Outdoor €18–€22",
      "Free cancellation up to 12h before",
      "All equipment provided",
    ],
    featuresEs: [
      "Estudio 22–25 € · Exterior 18–22 €",
      "Cancelación gratuita hasta 12 h antes",
      "Todo el material incluido",
    ],
  },
  {
    id: "monthly",
    nameEn: "Consistent Monthly",
    nameEs: "Plan Mensual Constante",
    priceEur: 165,
    unitEn: "per month",
    unitEs: "al mes",
    taglineEn: "3 fixed sessions every week for real progression.",
    taglineEs: "3 sesiones semanales fijas para progresar de verdad.",
    featuresEn: [
      "Up to 12 small-group sessions / month",
      "Reserved weekly recurring slots",
      "Pause anytime with 7 days notice",
    ],
    featuresEs: [
      "Hasta 12 sesiones grupales al mes",
      "Plazas fijas reservadas cada semana",
      "Pausa cuando quieras con 7 días de aviso",
    ],
  },
];

export const TRAINING_LOCATIONS: TrainingLocation[] = [
  {
    id: "eixample",
    spot: "Eixample Studio",
    place: "Studio",
    neighborhood: "Eixample Esquerra",
    landmarkEn: "Private strength studio on Carrer d'Aragó with racks, barbells & showers",
    landmarkEs: "Estudio privado en Carrer d'Aragó con racks, barras y duchas",
    metro: "L1 Urgell / L5 Hospital Clínic",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Eixample+Barcelona+Spain",
  },
  {
    id: "barceloneta",
    spot: "Barceloneta Beach",
    place: "Outdoor",
    neighborhood: "Barceloneta",
    landmarkEn: "Sand & promenade conditioning next to Espigó del Gas steps",
    landmarkEs: "Acondicionamiento en arena y paseo junto a los escalones del Espigó del Gas",
    metro: "L4 Barceloneta",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Barceloneta+Beach+Barcelona",
  },
  {
    id: "ciutadella",
    spot: "Parc de la Ciutadella",
    place: "Outdoor",
    neighborhood: "Ciutat Vella / Born",
    landmarkEn: "Shaded gravel esplanade beside the Cascada Monumental north steps",
    landmarkEs: "Explanada con sombra junto a las escaleras norte de la Cascada Monumental",
    metro: "L1 Arc de Triomf / L4 Ciutadella",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Cascada+Monumental+Parc+de+la+Ciutadella+Barcelona",
  },
  {
    id: "montjuic",
    spot: "Montjuïc",
    place: "Outdoor",
    neighborhood: "Sants-Montjuïc",
    landmarkEn: "Olympic ring hills and south esplanade outside Estadi Olímpic",
    landmarkEs: "Cuestas del anillo olímpico y explanada sur frente al Estadi Olímpic",
    metro: "L1/L3 Espanya + Funicular",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Estadi+Olimpic+Montjuic+Barcelona",
  },
  {
    id: "poblenou",
    spot: "Poblenou",
    place: "Outdoor",
    neighborhood: "Poblenou / 22@",
    landmarkEn: "Waterfront plaza stairs at the foot of Rambla del Poblenou",
    landmarkEs: "Escaleras y plaza marítima al final de la Rambla del Poblenou",
    metro: "L4 Llacuna / Poblenou",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rambla+del+Poblenou+Barcelona",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "rain",
    questionEn: "What happens if it rains on an outdoor session?",
    questionEs: "¿Qué pasa si llueve en una sesión al aire libre?",
    answerEn:
      "Light drizzle goes ahead under covered areas. If there is heavy rain or storm alerts, we move the session to the Eixample Studio or credit your spot automatically with at least 2 hours notice via WhatsApp.",
    answerEs:
      "Con lluvia ligera entrenamos en zonas cubiertas. Si hay lluvia fuerte o alerta meteorológica, trasladamos la sesión al estudio del Eixample o devolvemos tu crédito con al menos 2 horas de aviso por WhatsApp.",
  },
  {
    id: "cancel",
    questionEn: "What is the cancellation or rescheduling policy?",
    questionEs: "¿Cuál es la política de cancelación o cambio de hora?",
    answerEn:
      "Free cancellation or rescheduling up to 12 hours before class start. Inside 12 hours, a pack credit is used because spots are capped at 6–12 people.",
    answerEs:
      "Cancelación o cambio gratuito hasta 12 horas antes del inicio. Dentro de las 12 horas se consume la sesión al ser grupos reducidos de 6–12 personas.",
  },
  {
    id: "beginners",
    questionEn: "I'm new to strength training — can I still join?",
    questionEs: "Soy principiante en entrenamiento de fuerza, ¿puedo apuntarme?",
    answerEn:
      "Yes. Start with Strength Foundations, Mobility Reset, or any Outdoor Conditioning class. Every load and movement is scaled to your current level and coached directly.",
    answerEs:
      "Sí. Empieza por Strength Foundations, Mobility Reset o cualquier sesión de acondicionamiento exterior. Cada carga y ejercicio se adapta a tu nivel con corrección directa.",
  },
  {
    id: "languages",
    questionEn: "What languages are sessions coached in?",
    questionEs: "¿En qué idiomas se imparten las sesiones?",
    answerEn:
      "All sessions are coached fluently in English and Spanish (and Catalan on request). Most groups are a mix of locals and international professionals living in Barcelona.",
    answerEs:
      "Todas las sesiones se dirigen con fluidez en inglés y español (y catalán si hace falta). La mayoría de los grupos mezclan locales y profesionales internacionales en Barcelona.",
  },
  {
    id: "facilities",
    questionEn: "Are there showers, lockers, and equipment at the studio?",
    questionEs: "¿Hay duchas, taquillas y material en el estudio?",
    answerEn:
      "Yes — the Eixample Studio has private showers, lockers, towels for rent, and full barbell/kettlebell setups so you can head straight to the office after a 07:00 or 13:00 class.",
    answerEs:
      "Sí: el estudio del Eixample cuenta con duchas privadas, taquillas y todo el material de barras y kettlebells para que puedas ir directo a la oficina tras la clase de las 07:00 o 13:00.",
  },
  {
    id: "payment",
    questionEn: "How do I pay when I book a session?",
    questionEs: "¿Cómo se realiza el pago al reservar?",
    answerEn:
      "No card is charged online right now. Reserve your spot in one click and pay on arrival (card, Bizum, or cash) or activate a 10-session pack at your first session.",
    answerEs:
      "No se cobra tarjeta online por ahora. Reserva tu plaza en un clic y paga al llegar (tarjeta, Bizum o efectivo) o activa un bono en tu primera sesión.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "laura",
    quoteEn: "Three sessions a week, never longer than an hour. Deadlift up 40 kg since March.",
    quoteEs: "Tres sesiones por semana, nunca más de una hora. Peso muerto +40 kg desde marzo.",
    name: "Laura, 36",
    roleEn: "Product Manager",
    roleEs: "Product Manager",
  },
  {
    id: "tom",
    quoteEn: "Every session has a plan. I just show up and do the work.",
    quoteEs: "Cada sesión tiene un plan claro. Solo tengo que llegar y entrenar.",
    name: "Tom, 41",
    roleEn: "Engineer, relocated from London",
    roleEs: "Ingeniero, mudado desde Londres",
  },
  {
    id: "marta",
    quoteEn: "The 7am beach sessions fit before my first call. Haven't missed a week.",
    quoteEs:
      "Las sesiones de las 7:00 en la playa encajan antes de mi primera llamada. No he fallado ni una semana.",
    name: "Marta, 29",
    roleEn: "Consultant",
    roleEs: "Consultora",
  },
  {
    id: "daniel",
    quoteEn: "Back pain gone after two months of mobility and strength work.",
    quoteEs: "El dolor de espalda desapareció tras dos meses de movilidad y fuerza.",
    name: "Daniel, 45",
    roleEn: "Lawyer",
    roleEs: "Abogado",
  },
];
