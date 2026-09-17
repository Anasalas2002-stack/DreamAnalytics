const STORAGE_KEY = "dreamanalytics.entries";
const API_KEY_STORAGE = "dreamanalytics.api-key";
const MODEL_STORAGE = "dreamanalytics.model";
const DEFAULT_MODEL = "gpt-4o-mini";

const dreamForm = document.getElementById("dream-form");
const dreamList = document.getElementById("dream-list");
const dreamMap = document.getElementById("dream-map");
const dreamCountEl = document.getElementById("dream-count");
const archetypeCountEl = document.getElementById("archetype-count");
const moodLabelEl = document.getElementById("mood-label");
const patternSummaryEl = document.getElementById("pattern-summary");
const clearAllBtn = document.getElementById("clear-all");
const seedDemoBtn = document.getElementById("seed-demo");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key");

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

function loadApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

function saveApiKey(value) {
  if (!value) {
    localStorage.removeItem(API_KEY_STORAGE);
    return;
  }

  localStorage.setItem(API_KEY_STORAGE, value.trim());
}

function loadModel() {
  return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
}

function buildArchetypes(entry) {
  const content = `${entry.title} ${entry.symbols} ${entry.narrative} ${entry.emotions}`.toLowerCase();
  const archetypes = [];

  const keywordMap = {
    shadow: ["sombra", "miedo", "oscuro", "pesadilla", "persecucion", "enemigo", "monstruo", "caida", "ruido", "peligro", "terror", "náusea", "caza", "trampa", "oscuro", "sombrío"],
    self: ["luz", "espejo", "mandala", "círculo", "integracion", "completo", "equilibrio", "camino", "montaña", "sabiduría", "sabio", "granito", "alma", "centro", "nucleo", "identidad"],
    transform: ["agua", "rio", "mar", "puerta", "transformacion", "cambio", "muda", "serpiente", "reptil", "metamorfosis", "vuelo", "despertar", "nacimiento", "renacer", "volar", "subir", "caer"],
    persona: ["cara", "máscara", "rol", "trabajo", "reunion", "escena", "publico", "fama", "aparecer", "vestido", "social", "persona", "profesión", "oficina"],
    anima: ["princesa", "reina", "mujer", "madre", "esposa", "sacerdotisa", "figura femenina", "anima", "misterio", "intuitivo", "suave", "sensibilidad", "amor", "intimidad"],
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

function buildLocalInterpretation(entry) {
  const archetypes = buildArchetypes(entry);
  const emotionalTone = entry.mood || "equilibrado";
  const symbols = (entry.symbols || "símbolos").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  const symbolText = symbols.length ? symbols.join(", ") : "imágenes recurrentes";

  const archetypeText = archetypes
    .map((archetype) => {
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
    })
    .join(" y ");

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

function renderDreamMap(entries) {
  if (!entries.length) {
    dreamMap.innerHTML = `<div class="empty-state">Tu mapa de sueños aparecerá cuando registres tu primer sueño.</div>`;
    return;
  }

  const archetypeCounts = {};
  entries.forEach((entry) => {
    buildArchetypes(entry).forEach((type) => {
      archetypeCounts[type] = (archetypeCounts[type] || 0) + 1;
    });
  });

  const moodCounts = {};
  entries.forEach((entry) => {
    const mood = entry.mood || "tranquilo";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const maxArchetype = Math.max(...Object.values(archetypeCounts), 1);
  const archetypeRows = Object.entries(archetypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => {
      const label = {
        shadow: "Sombra",
        self: "Self",
        transform: "Transformación",
        persona: "Persona",
        anima: "Anima",
      }[type] || type;

      return `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${(count / maxArchetype) * 100}%"></div></div>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join("");

  const moodColors = {
    tranquilo: "var(--chart-1)",
    ansioso: "var(--chart-2)",
    emocionado: "var(--chart-3)",
    miedo: "var(--chart-4)",
    alegria: "var(--chart-5)",
    confuso: "#c084fc",
  };

  const moodEntries = Object.entries(moodCounts);
  const totalMood = moodEntries.reduce((sum, [, count]) => sum + count, 0);
  const moodSegments = [];
  let cursor = 0;

  moodEntries.forEach(([mood, count]) => {
    const value = (count / totalMood) * 100;
    const start = cursor;
    const end = start + value;
    moodSegments.push(`${moodColors[mood] || "#c084fc"} ${start}% ${end}%`);
    cursor = end;
  });

  const legendMarkup = moodEntries
    .map(([mood, count]) => `
      <li>
        <div><span class="dot" style="background:${moodColors[mood] || "#c084fc"};"></span>${capitaliza(mood)}</div>
        <strong>${count}</strong>
      </li>
    `)
    .join("");

  dreamMap.innerHTML = `
    <div class="chart-card">
      <h3>Arquetipos</h3>
      <div class="bar-list">
        ${archetypeRows}
      </div>
    </div>

    <div class="chart-card">
      <h3>Emociones predominantes</h3>
      <div class="mood-donut" style="background: conic-gradient(${moodSegments.join(", ")})"></div>
      <ul class="mood-legend">${legendMarkup}</ul>
    </div>
  `;
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

  renderDreamMap(entries);

  if (!entries.length) {
    dreamList.innerHTML = `
      <div class="empty-state">
        Aún no registras sueños. Empieza por tu primera entrada para construir tu memoria onírica.
      </div>
    `;
    return;
  }

  dreamList.innerHTML = entries
    .map((entry) => {
      const archetypes = buildArchetypes(entry);
      const chipMarkup = archetypes
        .map(
          (type) =>
            `<span class="chip ${type === "shadow" ? "shadow" : type === "self" ? "self" : type === "transform" ? "transform" : type === "persona" ? "persona" : "anima"}">${type}</span>`
        )
        .join("");

      const aiText = entry.aiInterpretation || "";
      const interpretationText = aiText || entry.interpretation || buildLocalInterpretation(entry);

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
          <p class="dream-analysis"><strong>Interpretación:</strong> ${escapeHtml(interpretationText)}</p>
          <div class="ai-actions">
            <button class="ghost-btn retry-ai" data-id="${entry.id}" type="button">Reinterpretar con IA</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".retry-ai").forEach((button) => {
    button.addEventListener("click", async () => {
      const entries = loadEntries();
      const target = entries.find((dream) => dream.id === button.dataset.id);
      if (!target) return;

      const updated = await resolveDreamInterpretation(target);
      const nextEntries = entries.map((dream) =>
        dream.id === target.id ? { ...dream, aiInterpretation: updated } : dream
      );

      saveEntries(nextEntries);
      renderEntries();
    });
  });
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

function capitaliza(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

async function resolveDreamInterpretation(entry) {
  const apiKey = loadApiKey();

  if (apiKey) {
    try {
      const aiText = await callOpenAI(entry, apiKey);
      if (aiText) return aiText;
    } catch (error) {
      console.warn("La IA falló, se usa la interpretación local.", error);
    }
  }

  return buildLocalInterpretation(entry);
}

async function callOpenAI(entry, apiKey) {
  const model = loadModel();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de sueños con enfoque junguiano. Responde en español, de forma clara, útil, respetuosa y no médica. Señala símbolos, arquetipos, emociones y posibles significados personales. No hagas diagnósticos clínicos."
        },
        {
          role: "user",
          content: `Analiza este sueño con enfoque junguiano. Título: ${entry.title}. Estado emocional: ${entry.mood}. Intensidad: ${entry.intensity}. Tipo: ${entry.wonderType}. Símbolos: ${entry.symbols}. Emociones: ${entry.emotions}. Relato: ${entry.narrative}. Genera 2 párrafos de interpretación útil y evocadora.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

dreamForm.addEventListener("submit", async (event) => {
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
  const interpretation = await resolveDreamInterpretation(entry);
  const enrichedEntry = { ...entry, interpretation, aiInterpretation: (loadApiKey() ? interpretation : "") };
  entries.unshift(enrichedEntry);
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

  const entries = [
    {
      ...demoDream,
      interpretation: buildLocalInterpretation(demoDream),
      aiInterpretation: "",
    },
    ...loadEntries(),
  ];

  saveEntries(entries);
  renderEntries();
});

saveKeyBtn.addEventListener("click", () => {
  const value = apiKeyInput.value.trim();
  saveApiKey(value);
  apiKeyInput.value = value ? "********" : "";

  if (value) {
    alert("Clave guardada. En el próximo sueño o cuando reinterpretes, se usará IA si la API responde.");
  } else {
    alert("Se borró la clave guardada. La app volverá al modo local.");
  }
});

apiKeyInput.value = loadApiKey() ? "********" : "";
renderEntries();
