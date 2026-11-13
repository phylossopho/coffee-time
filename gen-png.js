/* Rasteriza los SVG a PNG SOLO si el PNG no existe todavía.
   Así nunca sobrescribe las imágenes reales (patrón, promos, logo). */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = path.join(__dirname, "assets", "img");
const jobs = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
  src: path.join("promos", `promo-${n}.svg`),
  out: path.join("promos", `promo-${n}.png`),
  width: 800,
  height: 1000
}));

(async () => {
  for (const j of jobs) {
    const from = path.join(dir, j.src);
    const to = path.join(dir, j.out);
    if (!fs.existsSync(from)) { console.log("falta", j.src); continue; }
    if (fs.existsSync(to)) { console.log("existe, no se toca:", j.out); continue; }
    await sharp(from, { density: 150 })
      .resize(j.width, j.height, { fit: "fill" })
      .png({ compressionLevel: 9 })
      .toFile(to);
    console.log("creado", j.out);
  }
})().catch(e => { console.error(e); process.exit(1); });
