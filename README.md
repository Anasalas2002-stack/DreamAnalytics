# DreamAnalytics

Una app web para registrar sueños diarios y mantener una memoria onírica con interpretación basada en la teoría de Carl Jung y apoyo opcional de Inteligencia Artificial.

## Características

- Registro diario de sueños con fecha, título, emoción, intensidad y tipo de sueño.
- Análisis automático de símbolos y emociones para detectar arquetipos junguianos.
- Interpretación local con enfoque junguiano.
- Soporte opcional para IA usando una clave API compatible con OpenAI.
- Vista de mapa de sueños con gráficos de arquetipos y estados emocionales.
- Persistencia local con `localStorage`, sin backend.

## Cómo ejecutarla

Opción 1: abrir directamente `index.html` en el navegador.

Opción 2: levantar un servidor local:

```bash
python -m http.server 8000
```

Luego abrir:

```text
http://localhost:8000
```

## Configuración de IA

En la interfaz de la app puedes guardar una clave API compatible con OpenAI. Si la defines, la app intentará interpretar los sueños con un modelo como `gpt-4o-mini` usando el endpoint `https://api.openai.com/v1/chat/completions`.

Si no agregas clave, la app funciona 100% local con una interpretación basada en símbolos y arquetipos junguianos.

## Estructura

- `index.html` — interfaz principal
- `styles.css` — estilos visuales y gráficos
- `app.js` — lógica del formulario, almacenamiento, interpretación y mapa de sueños

## Idea de expansión futura

- autenticación con usuario
- base de datos para guardar sueños en la nube
- análisis de patrones mensuales y tendencias
- IA con contexto personal del usuario
- exportación en PDF o CSV
- dashboard con tendencias semanales y mensuales

## Licencia

Sin licencia específica por ahora.
