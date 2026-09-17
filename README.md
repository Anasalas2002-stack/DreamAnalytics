# DreamAnalytics

Una app web para registrar sueños diarios y mantener una memoria onírica con interpretación basada en la teoría de Carl Jung.

## Características

- Registro diario de sueños con fecha, título, emoción, intensidad y tipo de sueño.
- Análisis automático de símbolos y emociones para detectar arquetipos junguianos.
- Interpretación generada con una lógica tipo Jung: sombra,Self, transformación, persona y animus/anima.
- Vista de memoria con todos los sueños guardados.
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

## Estructura

- `index.html` — interfaz principal
- `styles.css` — estilos visuales
- `app.js` — lógica de formulario, memoria y análisis

## Idea de expansión futura

- autenticación con usuario
- base de datos para guardar sueños en la nube
- análisis de patrones mensuales
- IA para interpretar sueños con un enfoque más profundo
- exportación en PDF o CSV

## Licencia

Sin licencia específica por ahora.
