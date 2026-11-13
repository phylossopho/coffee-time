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
index.html            shell: header, main vacío, drawers de carrito y tema
assets/data.js        ← edita aquí categorías, productos, precios, sabores, promos y contacto
assets/app.js         router, carrito con variantes, carrusel, tema, pedido por WhatsApp
assets/styles.css     tema por variables CSS + layout responsive + patrón de fondo
assets/img/logo.png   logo real de COFFEE TIME (header)
assets/img/pattern.png fondo de doodles (arte original, fondo transparente)
assets/img/*.svg      ilustraciones de producto generadas (respaldo)
assets/img/promos/    promociones (promo-1..9; las 1, 2, 3 y 9 son arte real)
assets/img/products/  fotos reales de productos (ver LEEME.txt)
gen-images.js         regenera las ilustraciones SVG
gen-png.js            rasteriza los SVG a PNG solo si falta el PNG (usa `sharp`)
```

## Portada y menú

La portada **no** muestra los 35 productos: es un escaparate compacto con
hero + carrusel, tarjetas de categoría, seis favoritos y contacto. El menú
completo vive en `#/menu`, con buscador y chips por categoría.

- Para cambiar los favoritos: edita `FEATURED` en `assets/app.js`.
- Para agregar categorías o productos: edita `assets/data.js`.

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

Las tarjetas de promoción usan formato vertical 4:5. Las promos 4 a 8 siguen con
arte vectorial de respaldo: reemplaza `promo-4.png` … `promo-8.png` por tus
diseños y se verán solas. El patrón se pinta con `opacity: .055`.

## Fotos de producto

Guarda la foto en `assets/img/products/` y agrega `photo` al producto en
`assets/data.js`:

```js
{ id: "capuccino", cat: "calientes", name: "Capuccino", icon: "cup",
  photo: "assets/img/products/capuccino.jpg", /* ... */ }
```

Sin `photo`, la tarjeta usa la ilustración vectorial. La lista de ids está en
`assets/img/products/LEEME.txt`. También puedes cambiar la foto desde la ficha
del producto (se guarda solo en tu navegador).

## Pedido por WhatsApp

El botón **Confirmar pedido** del carrito arma un mensaje con cada producto,
su variante, cantidad y el total, y abre WhatsApp al 55 6692 2796. Cada promo
tiene además su propio botón **Pedir** con el texto de esa promoción.

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
  - `price` se usa cuando no hay variantes.
- El buscador filtra por nombre, descripción, categoría, sabores y tamaños.
