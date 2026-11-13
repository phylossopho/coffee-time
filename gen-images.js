/* Genera ilustraciones SVG propias: iconos, patrón de fondo y arte de promociones. */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "assets", "img");
fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(path.join(dir, "promos"), { recursive: true });

const C = { ink: "#2a201a", cream: "#f6eee2", terra: "#d9825a", green: "#2f6b5a", gold: "#e0b063" };

/* ---------- glifos de línea (para el patrón) ---------- */
const G = {
  cup: `<path d="M-16-8h26v14a9 9 0 0 1-9 9h-8a9 9 0 0 1-9-9z"/><path d="M10-4h4a5 5 0 0 1 0 10h-4"/><path d="M-9-16c0-4 4-4 4-8M-2-16c0-4 4-4 4-8"/>`,
  bean: `<ellipse cx="0" cy="0" rx="9" ry="13"/><path d="M0-13c-4 5-4 21 0 26"/>`,
  croissant: `<path d="M-24 6c0-14 11-24 24-24s24 10 24 24z"/><path d="M-14 4c3-9 8-14 14-14s11 5 14 14"/>`,
  crepe: `<path d="M-18-16h36l-14 34h-8z"/><path d="M-8-6h16M-5 4h10"/>`,
  sandwich: `<path d="M-20 4h40l-20 16z"/><path d="M-20 4c0-10 9-16 20-16s20 6 20 16"/>`,
  strawcup: `<path d="M-12-10h24l-3 26a6 6 0 0 1-6 5h-6a6 6 0 0 1-6-5z"/><path d="M6-24 2-10"/>`,
  donut: `<circle cx="0" cy="0" r="14"/><circle cx="0" cy="0" r="5"/>`,
  teapot: `<path d="M-14-4h22v10a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z"/><path d="M8-1h4a4 4 0 0 1 0 8h-4"/><path d="M-16 16h28"/>`,
  leaf: `<path d="M0-14c12 4 16 14 12 24-12-2-18-12-12-24z"/><path d="M2 8C0 0 4-6 10-10"/>`
};

const glyph = (name, x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${G[name]}</g>`;

/* ---------- patrón de fondo (tesela 600x600) ---------- */
const cells = [
  ["crepe", 80, 70, -18, 1.05], ["bean", 230, 60, 20, .9], ["strawcup", 360, 95, 8, 1], ["cup", 500, 70, -6, 1.05],
  ["bean", 60, 210, -30, .8], ["donut", 190, 190, 0, .95], ["leaf", 330, 210, 12, 1], ["croissant", 480, 190, -10, 1],
  ["cup", 110, 330, 6, 1.1], ["sandwich", 260, 330, -8, 1], ["bean", 400, 320, 35, .85], ["teapot", 530, 340, 0, 1],
  ["strawcup", 70, 470, -10, 1.05], ["crepe", 210, 480, 14, 1], ["bean", 350, 470, -20, .9], ["cup", 490, 480, 8, 1],
  ["donut", 560, 540, 0, .8], ["leaf", 20, 560, 0, .9]
];
const pattern = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<g opacity="1">${cells.map(([g, x, y, r, s]) => glyph(g, x, y, r, s)).join("")}</g>
</svg>`;
fs.writeFileSync(path.join(dir, "pattern.svg"), pattern);

/* ---------- iconos de producto ---------- */
const wrap = (body, bg1 = "#efe4d5", bg2 = "#e3d3bf") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img">
<defs><radialGradient id="g" cx="30%" cy="15%" r="90%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient></defs>
<rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="205" r="140" fill="#ffffff" opacity=".38"/>${body}</svg>`;

const steam = (x, y) => `<path d="M${x} ${y}c0-14 10-14 10-28s-10-14-10-28" fill="none" stroke="${C.ink}" stroke-opacity=".45" stroke-width="7" stroke-linecap="round"/>`;

const icons = {
  "cup.svg": wrap(`${steam(160, 120)}${steam(200, 108)}${steam(240, 120)}
    <ellipse cx="200" cy="300" rx="120" ry="20" fill="${C.ink}" opacity=".12"/>
    <path d="M120 170h150v78a56 56 0 0 1-56 56h-38a56 56 0 0 1-56-56z" fill="${C.ink}"/>
    <path d="M270 190h20a30 30 0 0 1 0 60h-20" fill="none" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/>
    <path d="M120 170h150v22H120z" fill="${C.cream}" opacity=".9"/>
    <ellipse cx="195" cy="170" rx="75" ry="12" fill="${C.terra}"/>
    <path d="M100 312h200" stroke="${C.ink}" stroke-width="12" stroke-linecap="round" opacity=".8"/>`),
  "iced.svg": wrap(`
    <ellipse cx="200" cy="318" rx="96" ry="16" fill="${C.ink}" opacity=".12"/>
    <path d="M140 140h120l-14 150a24 24 0 0 1-24 22h-44a24 24 0 0 1-24-22z" fill="#ffffff" opacity=".55"/>
    <path d="M140 140h120l-14 150a24 24 0 0 1-24 22h-44a24 24 0 0 1-24-22z" fill="none" stroke="${C.ink}" stroke-width="8"/>
    <path d="M150 196h100l-10 96a16 16 0 0 1-16 14h-48a16 16 0 0 1-16-14z" fill="${C.terra}" opacity=".85"/>
    <rect x="168" y="168" width="34" height="34" rx="6" fill="${C.cream}" opacity=".9" transform="rotate(-14 185 185)"/>
    <rect x="206" y="206" width="30" height="30" rx="6" fill="${C.cream}" opacity=".8" transform="rotate(18 221 221)"/>
    <path d="M232 96 208 148" stroke="${C.green}" stroke-width="12" stroke-linecap="round"/>`),
  "frappe.svg": wrap(`
    <ellipse cx="200" cy="322" rx="92" ry="15" fill="${C.ink}" opacity=".12"/>
    <path d="M144 186h112l-12 118a22 22 0 0 1-22 20h-44a22 22 0 0 1-22-20z" fill="${C.ink}" opacity=".85"/>
    <path d="M156 226h88l-8 80a14 14 0 0 1-14 12h-44a14 14 0 0 1-14-12z" fill="${C.cream}" opacity=".55"/>
    <circle cx="170" cy="176" r="26" fill="${C.cream}"/><circle cx="206" cy="166" r="30" fill="${C.cream}"/>
    <circle cx="238" cy="180" r="22" fill="${C.cream}"/><circle cx="206" cy="150" r="14" fill="${C.gold}"/>
    <path d="M238 92 214 158" stroke="${C.terra}" stroke-width="12" stroke-linecap="round"/>
    <path d="M150 186h100" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>`),
  "tea.svg": wrap(`
    <ellipse cx="200" cy="308" rx="104" ry="18" fill="${C.ink}" opacity=".12"/>
    <path d="M136 190h108v54a54 54 0 0 1-54 54 54 54 0 0 1-54-54z" fill="#ffffff" opacity=".6"/>
    <path d="M136 190h108v54a54 54 0 0 1-54 54 54 54 0 0 1-54-54z" fill="none" stroke="${C.ink}" stroke-width="8"/>
    <path d="M244 204h14a26 26 0 0 1 0 52h-14" fill="none" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>
    <path d="M118 298h164" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>
    <path d="M196 120c26 6 40 24 36 46-26-4-42-22-36-46z" fill="${C.green}"/>
    <path d="M200 168c-2-18 4-32 18-40" fill="none" stroke="${C.green}" stroke-width="6" stroke-linecap="round"/>`),
  "food.svg": wrap(`
    <ellipse cx="200" cy="300" rx="112" ry="18" fill="${C.ink}" opacity=".12"/>
    <path d="M108 250c0-56 44-96 92-96s92 40 92 96z" fill="${C.gold}"/>
    <path d="M124 244c14-40 44-64 76-64s62 24 76 64" fill="none" stroke="${C.ink}" stroke-width="7" stroke-opacity=".5"/>
    <path d="M108 250h184v18a16 16 0 0 1-16 16H124a16 16 0 0 1-16-16z" fill="${C.terra}"/>
    <path d="M150 214c6-16 22-26 38-26M198 190c18 0 34 10 40 26" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-opacity=".45"/>`),
  "beans.svg": wrap(`
    <ellipse cx="200" cy="206" rx="118" ry="96" fill="#ffffff" opacity=".3"/>
    <g transform="rotate(-18 200 150)"><ellipse cx="200" cy="140" rx="40" ry="56" fill="${C.ink}"/>
      <path d="M200 88c-16 18-16 86 0 104" fill="none" stroke="${C.cream}" stroke-width="7" stroke-linecap="round" opacity=".85"/></g>
    <g transform="rotate(20 132 240)"><ellipse cx="132" cy="240" rx="34" ry="48" fill="${C.terra}"/>
      <path d="M132 196c-14 16-14 72 0 88" fill="none" stroke="${C.cream}" stroke-width="6" stroke-linecap="round" opacity=".85"/></g>
    <g transform="rotate(34 268 250)"><ellipse cx="268" cy="250" rx="34" ry="48" fill="${C.green}"/>
      <path d="M268 206c-14 16-14 72 0 88" fill="none" stroke="${C.cream}" stroke-width="6" stroke-linecap="round" opacity=".85"/></g>`),
  "crepe.svg": wrap(`
    <ellipse cx="200" cy="306" rx="118" ry="18" fill="${C.ink}" opacity=".12"/>
    <path d="M92 250h216l-84 46h-48z" fill="${C.gold}"/>
    <path d="M92 250h216l-84 46h-48z" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M120 226c22-26 44-38 70-38s48 12 70 38" fill="${C.cream}" opacity=".9"/>
    <circle cx="170" cy="236" r="10" fill="${C.terra}"/><circle cx="214" cy="228" r="9" fill="${C.green}"/>
    <circle cx="246" cy="240" r="8" fill="${C.ink}" opacity=".7"/>
    <path d="M132 258h60M186 258h50" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" opacity=".5"/>`),
  "salad.svg": wrap(`
    <ellipse cx="200" cy="308" rx="116" ry="18" fill="${C.ink}" opacity=".12"/>
    <path d="M104 244h192l-22 56a20 20 0 0 1-18 12h-112a20 20 0 0 1-18-12z" fill="#ffffff" opacity=".6"/>
    <path d="M104 244h192l-22 56a20 20 0 0 1-18 12h-112a20 20 0 0 1-18-12z" fill="none" stroke="${C.ink}" stroke-width="8"/>
    <circle cx="158" cy="228" r="20" fill="${C.green}"/><circle cx="204" cy="220" r="24" fill="${C.gold}"/>
    <circle cx="250" cy="230" r="18" fill="${C.terra}"/>
    <path d="M140 214c14-10 28-14 42-12M228 206c16 2 28 8 38 18" stroke="${C.green}" stroke-width="7" fill="none" stroke-linecap="round"/>`)
};
for (const [n, svg] of Object.entries(icons)) fs.writeFileSync(path.join(dir, n), svg);

/* ---------- portada ---------- */
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640" role="img">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d9c4"/><stop offset="1" stop-color="#cbb59a"/></linearGradient>
<radialGradient id="glow" cx="35%" cy="25%" r="70%"><stop offset="0" stop-color="#fff8ec" stop-opacity=".9"/><stop offset="1" stop-color="#fff8ec" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="640" fill="url(#bg)"/><rect width="800" height="640" fill="url(#glow)"/>
<circle cx="560" cy="150" r="120" fill="${C.gold}" opacity=".25"/><circle cx="150" cy="520" r="160" fill="${C.green}" opacity=".14"/>
<ellipse cx="400" cy="520" rx="250" ry="34" fill="${C.ink}" opacity=".14"/><ellipse cx="400" cy="512" rx="210" ry="24" fill="#ffffff" opacity=".45"/>
<path d="M250 300h300v150a90 90 0 0 1-90 90h-120a90 90 0 0 1-90-90z" fill="${C.ink}"/>
<path d="M550 340h34a56 56 0 0 1 0 112h-34" fill="none" stroke="${C.ink}" stroke-width="26" stroke-linecap="round"/>
<ellipse cx="400" cy="300" rx="150" ry="26" fill="${C.terra}"/><ellipse cx="400" cy="300" rx="118" ry="18" fill="${C.cream}" opacity=".55"/>
<path d="M330 190c0-26 18-26 18-52s-18-26-18-52" fill="none" stroke="#fff8ec" stroke-width="12" stroke-linecap="round" opacity=".7"/>
<path d="M400 170c0-26 18-26 18-52s-18-26-18-52" fill="none" stroke="#fff8ec" stroke-width="12" stroke-linecap="round" opacity=".7"/>
<path d="M470 190c0-26 18-26 18-52s-18-26-18-52" fill="none" stroke="#fff8ec" stroke-width="12" stroke-linecap="round" opacity=".7"/>
<g transform="rotate(-16 150 380)"><ellipse cx="150" cy="380" rx="34" ry="48" fill="${C.ink}"/><path d="M150 336c-14 16-14 72 0 88" stroke="${C.cream}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g>
<g transform="rotate(24 660 430)"><ellipse cx="660" cy="430" rx="30" ry="42" fill="${C.green}"/><path d="M660 392c-12 14-12 62 0 76" stroke="${C.cream}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/></g>
</svg>`;
fs.writeFileSync(path.join(dir, "hero.svg"), hero);

/* ---------- arte de promociones (respaldo si no hay PNG) ---------- */
const promoThemes = [
  { f: "promo-1.svg", a: "#f2c14e", b: "#d9825a", g: "cup" },
  { f: "promo-2.svg", a: "#8d6a4f", b: "#3b2a20", g: "sandwich" },
  { f: "promo-3.svg", a: "#2f4a6b", b: "#16243a", g: "crepe" },
  { f: "promo-4.svg", a: "#2f6b5a", b: "#12352c", g: "frappe" },
  { f: "promo-5.svg", a: "#6b6b2f", b: "#2b2b12", g: "salad" },
  { f: "promo-6.svg", a: "#a33b5c", b: "#3a1420", g: "strawcup" },
  { f: "promo-7.svg", a: "#2a3a4a", b: "#101820", g: "croissant" },
  { f: "promo-8.svg", a: "#3b3f8d", b: "#181a3a", g: "cup" }
];
for (const t of promoThemes) {
  const g = G[t.g] || G.cup;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img">
<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient></defs>
<rect width="800" height="1000" fill="url(#p)"/>
<circle cx="660" cy="140" r="220" fill="#ffffff" opacity=".07"/>
<circle cx="130" cy="840" r="260" fill="#ffffff" opacity=".05"/>
<g transform="translate(400 480) scale(8)" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${g}</g>
</svg>`;
  fs.writeFileSync(path.join(dir, "promos", t.f), svg);
}

console.log("assets generados:", fs.readdirSync(dir).join(", "));
