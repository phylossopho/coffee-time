# Imágenes del sitio — qué falta y cómo nombrarlas

El sitio ya apunta a los archivos WebP definitivos. **No hace falta editar código**:
si guardas la imagen con el nombre exacto de esta lista, aparece automáticamente.
Mientras no exista, se muestra la ilustración SVG de respaldo.

## Formato recomendado

| Uso | Tamaño | Formato | Peso ideal |
|---|---|---|---|
| Productos | **800 × 800 px** (1:1) | WebP, calidad 80–82 | 60–120 KB |
| Promociones | **1080 × 1350 px** (4:5) | WebP, calidad 82–85 | 120–220 KB |
| Logo (opcional) | 512 × 512 px | WebP con transparencia | < 40 KB |
| Fondo de doodles (opcional) | 1600 × 1600 px | WebP | < 150 KB |

- Fotografía del producto **centrada y con margen**; el sitio la recorta en cuadrado.
- Fondo limpio o transparente. Para bebidas, que se vea el vaso/taza completo.
- Una sola imagen de 800 × 800 se ve bien en escritorio y en móvil. Si después
  quieres versiones móviles más ligeras, se pueden agregar con `srcset`.
- Guarda todo en **sRGB** y sin espacios en el nombre.

---

## 1. Fotos de productos — 35 archivos

Ruta: `assets/img/productos/`

| # | Archivo | Producto | Categoría |
|---|---|---|---|
| 1 | `capuccino.webp` | Capuccino | Calientes |
| 2 | `latte.webp` | Latte | Calientes |
| 3 | `americano.webp` | Americano | Calientes |
| 4 | `mokachino.webp` | Mokachino | Calientes |
| 5 | `espresso.webp` | Espresso | Calientes |
| 6 | `cortado.webp` | Cortado | Calientes |
| 7 | `chocolate.webp` | Chocolate | Calientes |
| 8 | `tisanas.webp` | Tisanas | Calientes |
| 9 | `latte-chai.webp` | Latte Chai | Calientes |
| 10 | `matcha.webp` | Matcha (té) | Calientes |
| 11 | `chai.webp` | Chai (té) | Calientes |
| 12 | `taro.webp` | Taro (té) | Calientes |
| 13 | `soda-italiana.webp` | Soda italiana con perlas explosivas | Frías |
| 14 | `smoothie.webp` | Smoothie con pulpa de fruta | Frías |
| 15 | `frappe-basico.webp` | Frappé básico | Frías |
| 16 | `frappe-especial.webp` | Frappé de especialidad | Frías |
| 17 | `malteada.webp` | Malteada | Frías |
| 18 | `shaker-chai.webp` | Shaker Chai · Taro · Matcha | Frías |
| 19 | `shaker-americano.webp` | Shaker Americano | Frías |
| 20 | `shaker-capuchino.webp` | Shaker Capuchino | Frías |
| 21 | `shaker-tisanas.webp` | Shaker Tisanas | Frías |
| 22 | `shaker-latte.webp` | Shaker Latte | Frías |
| 23 | `shaker-mokachino.webp` | Shaker Mokachino | Frías |
| 24 | `crepa-dulce.webp` | Crepa dulce | Crepas |
| 25 | `crepa-fruta.webp` | Crepa de fruta | Crepas |
| 26 | `crepa-salada.webp` | Crepa salada | Crepas |
| 27 | `croissant-rol.webp` | Croissant rol | Crepas |
| 28 | `sandwich.webp` | Sándwich | Comida |
| 29 | `chapata.webp` | Chapata | Comida |
| 30 | `molletes.webp` | Molletes | Comida |
| 31 | `ensalada.webp` | Ensalada | Comida |
| 32 | `extra-crepa.webp` | Ingrediente extra para crepa | Extras (opcional) |
| 33 | `perlas.webp` | Perlas explosivas | Extras (opcional) |
| 34 | `jarabe.webp` | Jarabe 1 oz | Extras (opcional) |
| 35 | `portavaso.webp` | Portavaso | Extras (opcional) |

> Los cuatro extras pueden quedarse con su SVG; no es obligatorio fotografiarlos.
> Hoy **ninguna** foto de producto está cargada: todas usan la ilustración de respaldo.

---

## 2. Promociones — 9 archivos (completas)

Ruta: `assets/img/promociones/`

| Archivo WebP | Promoción |
|---|---|
| `promo-1.webp` | Capuchino grande + sándwich · $100 |
| `promo-2.webp` | Chapata de jamón y queso manchego · $100 |
| `promo-3.webp` | Crepa · 3 ingredientes por $70 |
| `promo-4.webp` | Smoothies con perlas explosivas · 2 × $100 |
| `promo-5.webp` | Ensalada · $100 |
| `promo-6.webp` | Frappes básicos · 2 × $100 |
| `promo-7.webp` | Croissant rol · $50 |
| `promo-8.webp` | Latte caliente grande · $46 |
| `promo-9.webp` | Sodas italianas · 2 × $100 |

Las nueve promociones ya tienen su WebP real. Para cambiar una, reemplaza el
archivo conservando el mismo nombre.

---

## 3. Imágenes de marca y QR

| Archivo | Uso | Tamaño |
|---|---|---|
| `assets/img/logo.png` (ya existe) | Logo del encabezado | 512 × 512, fondo transparente |
| `assets/img/pattern.png` (ya existe) | Fondo de doodles | 1600 × 1600 |
| `assets/img/hero.svg` (respaldo) | Imagen del hero (hoy manda el carrusel) | 1200 × 900 |
| `assets/img/qr/*.svg` (ya existen) | Letreros QR: menú, pedir, promos, opinión, club y favoritos | 512 × 512 |

Las tarjetas de categoría usan iconos SVG (`cup.svg`, `iced.svg`, `crepe.svg`,
`food.svg`, `beans.svg`, `salad.svg`, `tea.svg`, `frappe.svg`). No hace falta
cambiarlos; si algún día quieres fotos por categoría, se puede ajustar el código.

---

## Orden sugerido para ir creando

1. **Favoritos de la portada:** `latte`, `frappe-basico`, `crepa-dulce`,
   `sandwich`, `soda-italiana`, `ensalada`.
2. **Crepas y bebidas calientes** (las más pedidas).
3. **Bebidas frías y shakers.**
4. **Comida y extras.**

Cuando termines una tanda, publícala con:

```powershell
cd "C:\Users\Jorge\Desktop\JORGE\Proyecto predeterminado\coffee-time"
.\publicar-github.bat
```