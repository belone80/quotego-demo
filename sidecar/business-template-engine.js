const BUSINESS_TEMPLATES = {
  barber: {
    id: "barber",
    name: "Barber / Coiffeur",
    keywords: ["coiffeur", "coiffure", "barbier", "barber"],
    features: ["booking", "services", "availability", "staff"],
    services: [
      { name: "Coupe", duration: 30, price: 25 },
      { name: "Barbe", duration: 15, price: 15 },
      { name: "Coupe + Barbe", duration: 45, price: 35 }
    ],
    intake: ["name", "phone", "service", "date", "time", "staff", "notes"],
    automation: [
      "check_availability",
      "create_booking",
      "prepare_confirmation",
      "prepare_reminder"
    ]
  },

  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    keywords: ["restaurant", "resto", "brasserie", "café"],
    features: ["booking", "availability", "capacity"],
    services: [
      { name: "Réservation table", duration: 90, price: 0 }
    ],
    intake: ["name", "phone", "guests", "date", "time", "special_request"],
    automation: [
      "check_capacity",
      "create_booking",
      "prepare_confirmation",
      "prepare_reminder"
    ]
  },

  detailing: {
    id: "detailing",
    name: "Detailing Auto",
    keywords: ["detailing", "lavage", "voiture", "auto", "car wash"],
    features: ["quote", "booking", "vehicle", "extras"],
    services: [
      { name: "Intérieur", duration: 60, price: 55 },
      { name: "Extérieur", duration: 45, price: 45 },
      { name: "Complet", duration: 120, price: 85 }
    ],
    intake: [
      "name",
      "phone",
      "vehicle",
      "condition",
      "service",
      "extras",
      "date",
      "notes"
    ],
    automation: [
      "calculate_quote",
      "create_request",
      "prepare_confirmation"
    ]
  },

  garden: {
    id: "garden",
    name: "Jardinage",
    keywords: ["jardin", "jardinier", "jardinage", "haie", "pelouse"],
    features: ["quote", "lead_capture", "availability"],
    services: [
      { name: "Taille de haie", duration: 120, price: null },
      { name: "Entretien jardin", duration: 120, price: null },
      { name: "Tonte", duration: 60, price: null }
    ],
    intake: [
      "name",
      "phone",
      "job_type",
      "surface",
      "description",
      "photos",
      "date"
    ],
    automation: [
      "create_quote_request",
      "prepare_followup"
    ]
  },

  beauty: {
    id: "beauty",
    name: "Beauté / Esthétique",
    keywords: ["beauté", "esthétique", "ongles", "nails", "soin"],
    features: ["booking", "services", "availability", "staff"],
    services: [
      { name: "Soin", duration: 60, price: 50 },
      { name: "Manucure", duration: 45, price: 35 }
    ],
    intake: ["name", "phone", "service", "date", "time", "staff", "notes"],
    automation: [
      "check_availability",
      "create_booking",
      "prepare_confirmation"
    ]
  }
};

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectBusinessType(description = "") {
  const text = normalizeText(description);

  for (const template of Object.values(BUSINESS_TEMPLATES)) {
    const matched = template.keywords.some(keyword =>
      text.includes(normalizeText(keyword))
    );

    if (matched) {
      return {
        confidence: "high",
        template
      };
    }
  }

  return {
    confidence: "custom",
    template: {
      id: "custom",
      name: "Business personnalisé",
      keywords: [],
      features: ["custom_form", "custom_workflow"],
      services: [],
      intake: ["name", "phone", "service", "date", "notes"],
      automation: ["create_request"]
    }
  };
}

function buildBusinessConfiguration(description) {
  const result = detectBusinessType(description);

  return {
    businessType: result.template.id,
    detectedAs: result.template.name,
    confidence: result.confidence,
    services: structuredClone(result.template.services),
    intake: [...result.template.intake],
    features: [...result.template.features],
    automation: [...result.template.automation],
    status: "draft"
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    BUSINESS_TEMPLATES,
    detectBusinessType,
    buildBusinessConfiguration
  };
}
