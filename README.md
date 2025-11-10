# -angel aristizabal sanchez -
AVENTURA  WED
# angel-aristizabal-
README.MD
# Snake — Aventura Web (VS Code + GitHub)

Proyecto listo para abrir en Visual Studio Code y subir a GitHub.

## Archivos
- `index.html` — estructura y referencias a CSS/JS.
- `styles.css` — estilos, paleta y skins.
- `main.js` — lógica del juego (movimiento, niveles, puntaje, obstáculos, guardado en localStorage).
- `README.md` — este archivo.
- 

## Cómo abrir en VS Code
1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server** (opcional pero recomendado).
3. Abre `index.html` y usa **Open with Live Server** o ábrelo directamente en tu navegador.

## Cómo subir a GitHub (pasos rápidos)
1. Crea un nuevo repositorio en GitHub (por ejemplo `snake-aventura-web`).
2. En la carpeta del proyecto en tu máquina, abre la terminal y ejecuta:

```bash
git init
git add .
git commit -m "Juego Snake - Aventura Web (inicial)"
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/<NOMBRE_REPO>.git
git push -u origin main
```

Si usas autenticación por token o la CLI `gh`, sigue las instrucciones de GitHub.

## Notas
- El mejor puntaje se guarda en `localStorage` con la clave `snake_best`.
- Si querés que genere el workflow para publicar en GitHub Pages o que cree un script `push.sh`, lo puedo añadir.
