# COFFEE TIME — sitio del menú

Sitio estático de COFFEE TIME: portada, menú completo, promociones, carrito y
pedidos por WhatsApp. No usa frameworks ni backend; todo vive en `assets/`.

## Ejecutar

```powershell
cd "C:\Users\Jorge\Desktop\JORGE\Proyecto predeterminado\coffee-time"
python -m http.server 4173 --bind 127.0.0.1
```

Abre <http://localhost:4173/>. También funciona abriendo `index.html` directamente
(las rutas usan hash, no requieren servidor).

## Estructura

```
index.html            shell: header, main vacío, drawers de carrito y tema, modal de personalización
assets/data.js        ← edita aquí categorías, productos, precios, sabores, extras, promos, mesas y QR
assets/app.js         router, carrito con personalización, modal, carrusel, tema, pedido por WhatsApp
assets/styles.css     tema por variables CSS + layout responsive + patrón de fondo + modal + QR
assets/img/logo.png   logo real de COFFEE TIME (header)
assets/img/pattern.png fondo de doodles (arte original, fondo transparente)
assets/img/*.svg      ilustraciones de producto generadas (respaldo)
assets/img/promociones/  promociones vigentes (promo-1..9.webp)
assets/img/productos/    fotos WebP de productos (ver IMAGENES-FALTANTES.md)
assets/img/qr/           letreros QR listos para imprimir
assets/img/IMAGENES-FALTANTES.md  lista de fotos, nombres y medidas
```

## Portada y menú

La portada **no** muestra los 35 productos: es un escaparate compacto con
hero + carrusel, tarjetas de categoría, seis favoritos y contacto. El menú
completo vive en `#/menu`, con buscador y chips por categoría.

- Para cambiar los favoritos: edita `FEATURED` en `assets/app.js`.
- Para agregar categorías o productos: edita `assets/data.js`.

## Formatos de bebida

| Bebidas | Formatos |
|---|---|
| Café, té y bebidas calientes | **Taza** (para aquí) y **Vaso** (para llevar) |
| Smoothies, frappés, malteadas y sodas | **Vaso 12 oz** únicamente |
| Shakers | **Vaso chico** y **Vaso grande** |

El modal muestra una pista según el producto: si solo hay un formato, lo dice
(“Se sirve en vaso para llevar”), y ya no aparece el selector Taza/Vaso cuando
el producto no lo maneja.

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

- **Sabor:** si el producto tiene `flavors`, hay que elegir **un solo sabor**;
  el modal lo marca como selección única (sin costo extra) y el resto de
  opciones se desmarca al elegir otra.
- **Tisanas y Shaker Tisanas:** usan `askFlavor: true` y piden escribir el
  sabor, porque su lista real aún no está definida.
- **Tamaño y formato:** si las variantes ya dicen *Taza* / *Vaso*, se agrupan
  por formato. **Taza = para aquí**, **Vaso = para llevar**.
- **Extras:** se muestran solo los que aplican a la categoría del producto.

### Extras (`MENU.customize.addons`)

| Extra | Precio | Aplica a |
|---|---|---|
| Perlas explosivas | $15 | Bebidas frías |
| Jarabe 1 oz | $15 | Calientes y frías (elige sabor) |
| Portavaso | $5 | Calientes y frías |

Los sabores de jarabe son **provisionales**; ajústalos en `assets/data.js`
cuando el dueño confirme disponibilidad y precios. El licor de café se retiró
por ahora.

### Otros tipos

`kind: "sabor"` (por ejemplo, el croissant rol) abre un modal para elegir un
solo sabor, sin tamaño ni extras.

## Mesas, QR y letreros

El local maneja dos mesas. `MENU.tables` en `assets/data.js` define sus nombres:

```js
tables: ["Mesa 1", "Mesa 2"]
```

El carrito incluye el selector **“¿Dónde lo vas a disfrutar?”** con las
opciones **Para llevar**, **Mesa 1** y **Mesa 2**. La elección se guarda en
`localStorage` y se agrega como `Lugar:` en el mensaje de WhatsApp, así que un
mismo QR puede servir para todo el local.

La vista `#/qr` reúne seis letreros listos para imprimir:

| Letrero | QR apunta a |
|---|---|
| Menú completo | `#/menu` del sitio |
| Pedir por WhatsApp | chat con mensaje listo |
| Promociones | `#/promociones` |
| Tu opinión | WhatsApp con mensaje de opinión |
| Club Coffee Time | WhatsApp con alta al club |
| Favoritos de la casa | portada del sitio |

Los SVG viven en `assets/img/qr/` y se generan con cualquier generador de QR
(contenido en `MENU.qr.base` y en el número de WhatsApp). El botón **Imprimir
todos** usa los estilos `@media print` para acomodar dos letreros por hoja.

También existe la ruta `#/mesa/1` y `#/mesa/2`: abre el menú con esa mesa ya
seleccionada. Sirve si más adelante quieren un QR por mesa.

**Pendiente:** el QR de WiFi se agrega cuando exista la contraseña real
(`MENU.qr.wifi.password`, hoy vacío).

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
| `assets/img/promociones/promo-1..9.webp` | las nueve promociones | vertical 4:5 |
| `assets/img/productos/<id>.webp` | fotos de producto | cuadrada 1:1 |
| `assets/img/qr/*.svg` | letreros QR | cuadrado |

Las tarjetas de promoción usan formato vertical 4:5 y cargan directamente el
WebP. El patrón se pinta con `opacity: .055`.

## Fotos de producto

El sitio ya apunta a `assets/img/productos/<id>.webp` para los 35 productos. No
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
  photo: "assets/img/productos/capuccino.webp", /* ... */ }
```

## Pedido por WhatsApp

El botón **Confirmar pedido** del carrito arma un mensaje con cada producto,
su tamaño/formato, sabores o ingredientes, extras, cantidad, el total y el
lugar elegido, y abre WhatsApp al 55 6692 2796. Cada promo tiene además su
propio botón **Pedir** con el texto de esa promoción.

Las líneas del carrito se separan por producto, variante, sabores, extras y
formato: dos cafés iguales con distinto jarabe quedan como dos líneas.

En el carrito, el botón **+** de una bebida con sabores (frappé básico,
smoothie, malteada, soda italiana, shakers…) vuelve a abrir el modal y espera a
que se elija el sabor de la nueva pieza. Se agrega como línea aparte y el total
del carrito suma ambas selecciones.

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
| `#/promociones` | las nueve promociones completas |
| `#/contacto` | dirección, horarios, redes y WhatsApp |
| `#/qr` | centro de QR y letreros imprimibles |
| `#/mesa/<n>` | menú con la mesa `n` preseleccionada |

## Pendientes con el dueño

Estos datos están provisionales en `assets/data.js`:

- Sabores reales de tisanas y Shaker Tisanas.
- Precio de las crepas con **4 o más** ingredientes.
- Dirección, ciudad, horarios, Instagram y Facebook reales.
- Contraseña real del WiFi para el letrero QR.
- Fotos WebP pendientes (ver `assets/img/IMAGENES-FALTANTES.md`).

## GitHub

El repositorio local está en la rama `main` y el remoto configurado como:

```
https://github.com/phylossopho/coffee-time.git
```

El sitio se publica gratis con **GitHub Pages** en
`https://phylossopho.github.io/coffee-time/` (Settings → Pages → Deploy from a
branch, rama `main`, carpeta `/ (root)`). Como usa rutas con `#`, no necesita
configuración extra.

### Publicar cambios

Haz doble clic en **`publicar-github.bat`** o ejecútalo desde la carpeta del
proyecto:

```powershell
.\publicar-github.bat
```

El script:

1. Verifica que existan Node y Git.
2. Revisa la sintaxis de `assets/app.js` y `assets/data.js`.
3. Muestra los archivos modificados y pide un mensaje de commit.
4. Hace `git add`, `git commit` y `git push`.
5. Comprueba que GitHub Pages responda con la versión nueva.

Para hacerlo a mano:

```powershell
git add .
git commit -m "Describe el cambio"
git push
```

## Notas

- Carrito sin backend: el pedido se cierra por WhatsApp (55 6692 2796).
- `data.js` es la única fuente de datos; añadir un producto es agregar un objeto.
  - `variants: [["Taza chica", 43], ...]` genera selector de tamaño y precio "desde".
  - `flavors: ["Fresa", ...]` muestra los sabores disponibles como etiquetas.
  - `kind: "crepa" | "bebida" | "sabor"` activa el modal de personalización.
  - `photo` apunta a la foto WebP; sin ella se usa la ilustración SVG.
  - `price` se usa cuando no hay variantes.
- El buscador filtra por nombre, descripción, categoría, sabores y tamaños.
- El modal usa `<dialog>` nativo: cierra con Escape, clic en el fondo o el botón ✕.
- `data.js` debe guardarse en **UTF-8 sin BOM**.