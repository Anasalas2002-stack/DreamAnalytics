const STORAGE_KEY = "dreamanalytics.entries";

const dreamForm = document.getElementById("dream-form");
const dreamList = document.getElementById("dream-list");
const dreamCountEl = document.getElementById("dream-count");
const archetypeCountEl = document.getElementById("archetype-count");
const moodLabelEl = document.getElementById("mood-label");
const patternSummaryEl = document.getElementById("pattern-summary");
const clearAllBtn = document.getElementById("clear-all");
const seedDemoBtn = document.getElementById("seed-demo");

const today = new Date();
const defaultDate = today.toISOString().split("T")[0];
document.getElementById("date").value = defaultDate;

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function buildArchetypes(entry) {
  const content = `${entry.title} ${entry.symbols} ${entry.narrative} ${entry.emotions}`.toLowerCase();
  const archetypes = [];

  const keywordMap = {
    shadow: ["sombra", "miedo", "oscuro", "pesadilla", "persecucion", "enemigo", "monstruo", "caida", "ruido", "peligro", "terror", "náusea", "caza", "trampa"],
    self: ["luz", "espejo", "mandala", "círculo", "integracion", "completo", "equilibrio", "camino", "montaña", "sabiduría", "sabio", "granito", "alma"],
    transform: ["agua", "rio", "mar", "puerta", "transformacion", "cambio", "muda", "serpiente", "reptil", "metamorfosis", "vuelo", "despertar", "nacimiento", "renacer"],
    persona: ["cara", "máscara", "rol", "trabajo", "reunion", "escena", "publico", "fama", "aparecer", "vestido", "social", "persona"],
    anima: ["princesa", "reina", "mujer", "madre", "esposa", "sacerdotisa", "figura femenina", "anima", "misterio", "intuitivo", "suave", "sensibilidad"],
  };

  Object.entries(keywordMap).forEach(([archetype, keywords]) => {
    if (keywords.some((keyword) => content.includes(keyword))) {
      archetypes.push(archetype);
    }
  });

  if (archetypes.length === 0) {
    archetypes.push("self");
  }

  return archetypes;
}

function buildInterpretation(entry) {
  const archetypes = buildArchetypes(entry);
  const emotionalTone = entry.mood || "equilibrado";
  const symbols = (entry.symbols || "símbolos").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  const symbolText = symbols.length ? symbols.join(", ") : "imágenes recurrentes";

  const archetypeText = archetypes.map((archetype) => {
    switch (archetype) {
      case "shadow":
        return "la sombra, que emerge cuando lo reprimido trata de integrarse a la conciencia";
      case "self":
        return "el Self, que señala un centro de identidad más completo y unificador";
      case "transform":
        return "la transformación, en la que el cambio interno toma forma simbólica";
      case "persona":
        return "la persona, como la máscara social que a veces no coincide con lo más profundo";
      case "anima":
        return "la animus/anima, como fuerza de equilibrio entre lo consciente y lo inconsciente";
      default:
        return "la necesidad de unificación y comprensión";
    }
  }).join(" y ");

  return `Tu sueño refleja una experiencia emocional marcada por ${emotionalTone}. Los elementos más significativos —${symbolText}— parecen apuntar a ${archetypeText}. Desde una lectura junguiana, el sueño no solo narra un evento, sino que comunica un proceso de individuación: lo que está presente en la escena podría estar señalando un conflicto, una creatividad emergente o una parte de ti que busca reconocimiento. El mensaje central es que la conciencia está dialogando con lo inconsciente para producir significado, integración y crecimiento personal.`;
}

function buildPatternSummary(entries) {
  if (!entries.length) {
    return ["Registra tu primer sueño para activar la interpretación."];
  }

  const counts = {};
  entries.forEach((entry) => {
    const archetypes = buildArchetypes(entry);
    archetypes.forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const labels = {
    shadow: "la sombra aparece con frecuencia",
    self: "la búsqueda de totalidad es un hilo central",
    transform: "las transiciones y cambios te acompañan",
    persona: "las dinámicas sociales y de identidad están activas",
    anima: "las fuerzas internas más profundas están en movimiento",
  };

  return top.length ? top.map(([type, count]) => `${labels[type] || type} (${count} veces)`) : ["Todavía estás construyendo el mapa de tus sueños."];
}

function getDominantMood(entries) {
  if (!entries.length) return "—";

  const moodMap = {};
  entries.forEach((entry) => {
    moodMap[entry.mood] = (moodMap[entry.mood] || 0) + 1;
  });

  const [mood, count] = Object.entries(moodMap).sort((a, b) => b[1] - a[1])[0];
  return `${mood} (${count})`;
}

function renderEntries() {
  const entries = loadEntries();

  dreamCountEl.textContent = entries.length;
  archetypeCountEl.textContent = new Set(entries.flatMap((entry) => buildArchetypes(entry))).size;
  moodLabelEl.textContent = getDominantMood(entries);
  patternSummaryEl.innerHTML = "";
  buildPatternSummary(entries).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    patternSummaryEl.appendChild(li);
  });

  if (!entries.length) {
    dreamList.innerHTML = `
      <div class="empty-state">
        Aún no registras sueños. Empieza por tu primera entrada para construir tu memoria onírica.
      </div>
    `;
    return;
  }

  dreamList.innerHTML = entries.map((entry) => {
    const archetypes = buildArchetypes(entry);
    const chipMarkup = archetypes.map((type) => `<span class="chip ${type === "shadow" ? "shadow" : type === "self" ? "self" : type === "transform" ? "transform" : type === "persona" ? "persona" : "anima"}">${type}</span>`).join("");

    return `
      <article class="dream-card">
        <div class="dream-header">
          <div>
            <h3 class="dream-title">${escapeHtml(entry.title)}</h3>
            <div class="dream-date">${formatDate(entry.date)}</div>
          </div>
          <div class="chips">${chipMarkup}</div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <span>Estado</span>
            <strong>${escapeHtml(entry.mood)}</strong>
          </div>
          <div class="meta-box">
            <span>Intensidad</span>
            <strong>${escapeHtml(entry.intensity)}</strong>
          </div>
          <div class="meta-box">
            <span>Tipo</span>
            <strong>${escapeHtml(entry.wonderType)}</strong>
          </div>
        </div>

        <p class="dream-story"><strong>Relato:</strong> ${escapeHtml(entry.narrative)}</p>
        <p class="dream-analysis"><strong>Interpretación junguiana:</strong> ${escapeHtml(entry.interpretation)}</p>
      </article>
    `;
  }).join("");
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

dreamForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(dreamForm);
  const entry = {
    id: crypto.randomUUID(),
    title: formData.get("title").trim(),
    date: formData.get("date"),
    mood: formData.get("mood"),
    intensity: formData.get("intensity"),
    wonderType: formData.get("wonderType"),
    symbols: formData.get("symbols").trim(),
    emotions: formData.get("emotions").trim(),
    narrative: formData.get("narrative").trim(),
  };

  const entries = loadEntries();
  entry.interpretation = buildInterpretation(entry);
  entries.unshift(entry);
  saveEntries(entries);
  dreamForm.reset();
  document.getElementById("date").value = defaultDate;
  renderEntries();
});

clearAllBtn.addEventListener("click", () => {
  const shouldClear = window.confirm("¿Seguro que quieres borrar todos tus sueños guardados?");
  if (!shouldClear) return;

  localStorage.removeItem(STORAGE_KEY);
  renderEntries();
});

seedDemoBtn.addEventListener("click", () => {
  const demoDream = {
    id: crypto.randomUUID(),
    title: "Vuelo sobre un lago de espejos",
    date: "2026-09-17",
    mood: "ansioso",
    intensity: "moderada",
    wonderType: "mítico",
    symbols: "agua, espejo, lago, pájaros",
    emotions: "miedo, admiración, tensión",
    narrative: "Soñé que caminaba sobre un lago que reflejaba una luna enorme. Había espejos en lugar de agua, y cada paso deformaba mi rostro. De pronto sentí que podía volar, pero también que alguien me perseguía desde el fondo del reflejo.",
  };

  demoDream.interpretation = buildInterpretation(demoDream);
  const entries = [demoDream, ...loadEntries()];
  saveEntries(entries);
  renderEntries();
});

renderEntries();
