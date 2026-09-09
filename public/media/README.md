# Video de bienvenida

Origen: video IMG_7265.MOV suministrado por el propietario del proyecto el 9 de septiembre de 2026.

- MP4: video completo (35 s), H.264 1280×720 y AAC, optimizado para inicio de reproducción sin descargar todo el archivo. No se corta ni modifica el mensaje.
- JPG: fotograma del mismo video, segundo 8, utilizado como portada. No es una imagen generada.

El archivo original se conserva fuera del repositorio. No contiene credenciales.

## Fondo del hero: Colombia conectada

Restauración visual del 9 de septiembre de 2026, siguiendo la referencia del propietario: mapa protagonista azul/dorado, texturas y logos originales. La generación no incluye logos ni cifras; estos se renderizan por separado y el contador sigue conectado al dato real.

- `colombia-red-dorada.jpg`: fondo decorativo generado, 1280 × 1280.
- `colombia-red-dorada-mobile.jpg`: versión optimizada de 768 × 768 para pantallas pequeñas.
- Herramienta: generación de imágenes integrada de Codex (no CLI/API externa).
- Referencia de estilo y silueta: `public/hero-map.png`, activo preexistente del proyecto.
- Los PNG oficiales de Somos Misión Colombia y 5.000 Amigos se reutilizan sin redibujarlos. `src/assets/logos/optimized/amigos-home.png` es una copia reducida del original, con transparencia conservada.
- La textura clara de fondo conserva `public/bg-palmas.png`, también preexistente.

Prompt final utilizado:

> Use case: ads-marketing. Create a NEW production background artwork for the public home hero of Somos Misión Colombia, using the supplied existing map illustration as style and geographic reference. This is an image asset only, NOT a website mockup. A beautiful luminous metallic-gold silhouette of Colombia, complete and geographically recognizable with the northern peninsula and southern border fully visible, viewed straight-on and centered. Delicate gold paths and warm illuminated nodes connect the country, suggesting its national community. Refine the visual into rich deep midnight-navy indigo with tactile matte paper grain and fine gold dust, subtle embossed topographic contours in the background and understated warm light rays. Feel celebratory, premium, warm and alive, not sci-fi. Square 1536x1536 composition. Map fits entirely within the middle 70% of the canvas width and middle 78% of its height, with navy breathing room at all edges; bottom-left area stays darker and less detailed so we can overlay the real 5000 Amigos logo separately in HTML. Crisp gold-map edges, nuanced embossed metallic material, dark navy outer edges matching #080e2c. Preserve the reference's Colombian identity, navy-gold palette and connected-map motif. No text, no logos, no numbers, no UI, no buttons, no borders, no watermark, no glowing planets, no generic bokeh.
