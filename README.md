# COFFEE TIME — sitio del menú

Sitio estático de COFFEE TIME: portada, menú completo, promociones, carrito y
pedidos por WhatsApp. No usa frameworks ni backend; todo vive en `assets/`.

## Ejecutar

```powershell
cd "C:\Users\Jorge\Desktop\JORGE\Proyecto predeterminado\cafe-norte"
python -m http.server 4173 --bind 127.0.0.1
```

Abre <http://localhost:4173/>. También funciona abriendo `index.html` directamente
(las rutas usan hash, no requieren servidor).

## Estructura

```
index.html            shell: header, main vacío, drawers de carrito y tema, modal de personalización
assets/data.js        ← edita aquí categorías, productos, precios, sabores, extras, promos y contacto
assets/app.js         router, carrito con personalización, modal, carrusel, tema, pedido por WhatsApp
assets/styles.css     tema por variables CSS + layout responsive + patrón de fondo + modal
assets/img/logo.png   logo real de COFFEE TIME (header)
assets/img/pattern.png fondo de doodles (arte original, fondo transparente)
assets/img/*.svg      ilustraciones de producto generadas (respaldo)
assets/img/promos/    promociones (promo-1..9; las 1, 2, 3 y 9 son arte real)
assets/img/products/  fotos WebP de productos (ver IMAGENES-FALTANTES.md)
assets/img/IMAGENES-FALTANTES.md  lista de fotos pendientes, nombres y medidas
gen-images.js         regenera las ilustraciones SVG
gen-png.js            rasteriza los SVG a PNG solo si falta el PNG (usa `sharp`)
```

## Portada y menú

La portada **no** muestra los 35 productos: es un escaparate compacto con
hero + carrusel, tarjetas de categoría, seis favoritos y contacto. El menú
completo vive en `#/menu`, con buscador y chips por categoría.

- Para cambiar los favoritos: edita `FEATURED` en `assets/app.js`.
- Para agregar categorías o productos: edita `assets/data.js`.

## Personalización de pedidos

Al agregar un producto con `kind` en `assets/data.js` se abre un modal
(`<dialog id="custom-dialog">`) con las opciones de ese producto. Sin `kind`,
el producto se agrega directo al carrito.

### Crepas (`kind: "crepa"`)

El modal muestra los ingredientes agrupados en **Dulce**, **Fruta** y
**Salada**, y se pueden mezclar entre grupos.

| Ingredientes | Precio |
|---|---|
| 1 | $60 |
| 2 | $70 (avisa que el tercero va incluido) |
| 3 | $70 (promo aplicada) |
| 4 o más | $70 + $10 por cada ingrediente extra |

El precio de 4 o más ingredientes es **provisional**: está configurado en
`MENU.customize.crepa` y falta confirmarlo con el dueño del negocio.

```js
customize: {
  crepa: { base: 60, extra: 10, promoAt: 3, promoPrice: 70, groups: [ /* ... */ ] }
}
```

### Bebidas (`kind: "bebida"`)

- **Sabor o mezcla:** si el producto tiene `flavors`, hay que elegir al menos
  uno; se permiten varios sin costo extra.
- **Tisanas y Shaker Tisanas:** usan `askFlavor: true` y piden escribir el
  sabor, porque su lista real aún no está definida.
- **Tamaño y formato:** si las variantes ya dicen *Taza* / *Vaso*, se agrupan
  por formato. Si no, aparece un selector aparte. **Taza = para aquí**,
  **Vaso = para llevar**.
- **Extras:** se muestran solo los que aplican a la categoría del producto.

### Extras (`MENU.customize.addons`)

| Extra | Precio | Aplica a |
|---|---|---|
| Perlas explosivas | $15 | Bebidas frías |
| Jarabe 1 oz | $15 | Calientes y frías (elige sabor) |
| Licor de café | $15 (provisional) | Calientes y frías |
| Portavaso | $5 | Calientes y frías |

El licor de café y los sabores de jarabe son **provisionales**; ajústalos en
`assets/data.js` cuando el dueño confirme disponibilidad y precios.

### Otros tipos

`kind: "sabor"` (por ejemplo, el croissant rol) abre un modal para elegir un
solo sabor, sin tamaño ni extras.

## Carrusel de promociones

La portada muestra un carrusel con las promociones marcadas con `hero: true` en
`assets/data.js`. Cambia solo cada 5 segundos, se detiene al pasar el mouse o
enfocar, y tiene flechas, puntos y botón de pausa (❙❙ / ▶). Cada slide tiene su
botón **Pedir** que abre WhatsApp con esa promo.

El alto se adapta a la pantalla con `clamp(300px, 44vh, 450px)` y el póster se
muestra completo (`object-fit: contain`) sobre un fondo desenfocado del mismo
arte, así no se recorta en pantallas pequeñas.

```js
{ id: "p1", hero: true, title: "Capuchino grande + sándwich", price: 100, /* ... */ }
```

Para sumar una promo al carrusel: agrega su imagen y ponle `hero: true`.

## Imágenes

| Archivo | Uso | Tamaño |
|---|---|---|
| `assets/img/logo.png` | logo del header | cuadrada, 256×256 |
| `assets/img/pattern.png` | fondo de doodles (cover, sin repetir) | 1104×1552 |
| `assets/img/promos/promo-1.jpg` | Capuchino + sándwich | vertical 4:5 |
| `assets/img/promos/promo-2.jpg` | Chapata + capuchino | vertical 4:5 |
| `assets/img/promos/promo-3.jpg` | Crepa $70 | vertical 4:5 |
| `assets/img/promos/promo-9.jpg` | Sodas italianas 2×$100 | vertical 4:5 |
| `assets/img/promos/promo-4..8.png` | Smoothies, ensalada, frappes, croissant, latte | vertical 4:5 |

Las tarjetas de promoción usan formato vertical 4:5. El sitio intenta cargar
primero `promo-N.webp` y, si no existe, usa el JPG/PNG actual. Las promos 4 a 8
siguen con arte vectorial de respaldo: reemplaza `promo-4.png` … `promo-8.png`
por tus diseños y se verán solas. El patrón se pinta con `opacity: .055`.

## Fotos de producto

El sitio ya apunta a `assets/img/products/<id>.webp` para los 35 productos. No
hace falta editar código: guarda la imagen con el nombre exacto y aparece sola.
Mientras no exista, la tarjeta usa la ilustración vectorial de respaldo.

- Tamaño recomendado: **800 × 800 px** (1:1), WebP calidad 80–82, 60–120 KB.
- Una sola imagen se ve bien en escritorio y en móvil.
- La lista completa de nombres, productos y orden sugerido está en
  [`assets/img/IMAGENES-FALTANTES.md`](assets/img/IMAGENES-FALTANTES.md).
- También puedes cambiar la foto desde la ficha del producto (se guarda solo en
  tu navegador con `localStorage`).

Si prefieres otra ruta o formato, edita el campo `photo` del producto:

```js
{ id: "capuccino", cat: "calientes", name: "Capuccino", icon: "cup",
  photo: "assets/img/products/capuccino.webp", /* ... */ }
```

## Pedido por WhatsApp

El botón **Confirmar pedido** del carrito arma un mensaje con cada producto,
su tamaño/formato, sabores o ingredientes, extras, cantidad y el total, y abre
WhatsApp al 55 6692 2796. Cada promo tiene además su propio botón **Pedir** con
el texto de esa promoción.

Las líneas del carrito se separan por producto, variante, sabores, extras y
formato: dos cafés iguales con distinto jarabe quedan como dos líneas.

## Contacto

Dirección, ciudad, horarios, Instagram, Facebook y enlace al mapa viven en
`MENU.contact` dentro de `assets/data.js`. Reemplázalos por los reales; se
muestran en la sección **Visítanos** del inicio y en `#/contacto`.

## Qué es editable en vivo

- **Paletas**: Casa, Verde, Tostado, Noche.
- **Colores**: principal, acento, fondo, superficie, texto.
- **Forma**: redondeo (0–32 px), tipografía (sans/serif/mono), modo oscuro.
- **Imágenes**: foto por producto desde su ficha.
- Todo se guarda en `localStorage` y se puede restablecer.

## Rutas

| Ruta | Vista |
|---|---|
| `#/` | portada: hero, carrusel, categorías, favoritos y contacto |
| `#/menu` | menú completo con buscador y chips |
| `#/categoria/<id>` | categoría (`calientes`, `frias`, `crepas`, `comida`, `extras`) |
| `#/producto/<id>` | ficha con variantes, sabores, cantidad y cambio de foto |

## Pendientes con el dueño

Estos datos están provisionales en `assets/data.js`:

- Lista y precios reales de extras (en especial **licor de café**).
- Sabores reales de tisanas y Shaker Tisanas.
- Precio de las crepas con **4 o más** ingredientes.
- Dirección, ciudad, horarios, Instagram y Facebook reales.
- Fotos WebP pendientes (ver `assets/img/IMAGENES-FALTANTES.md`).
| `#/promociones` | las 9 promociones completas |
| `#/contacto` | dirección, horarios, redes y WhatsApp |

## GitHub

El repositorio local ya está creado en la rama `main` y el remoto está
configurado como:

```
https://github.com/phylossopho/coffee-time.git
```

Solo falta crear el repositorio vacío en <https://github.com/new> con el nombre
`coffee-time` (público, sin README ni licencia) y subir el proyecto:

```powershell
git push -u origin main
```

Para publicarlo gratis con **GitHub Pages**: Settings → Pages → Source
"Deploy from a branch", branch `main` y carpeta `/ (root)`. Queda en
`https://phylossopho.github.io/coffee-time/`. Como el sitio usa rutas con `#`,
no necesita configuración extra. `.gitignore` excluye dependencias, logs y
archivos del sistema.

Para actualizar después de un cambio:

```powershell
git add .
git commit -m "Describe el cambio"
git push
```

## Notas

- Carrito de demostración sin backend: el pedido se cierra por WhatsApp (55 6692 2796).
- `data.js` es la única fuente de datos; añadir un producto es agregar un objeto.
  - `variants: [["Taza chica", 43], ...]` genera selector de tamaño y precio "desde".
  - `flavors: ["Fresa", ...]` muestra los sabores disponibles como etiquetas.
  - `kind: "crepa" | "bebida" | "sabor"` activa el modal de personalización.
  - `photo` apunta a la foto WebP; sin ella se usa la ilustración SVG.
  - `price` se usa cuando no hay variantes.
- El buscador filtra por nombre, descripción, categoría, sabores y tamaños.
- El modal usa `<dialog>` nativo: cierra con Escape, clic en el fondo o el botón ✕.
