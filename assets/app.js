/* COFFEE TIME — router, carrito con variantes, promociones y tema. */
(() => {
  "use strict";

  const MENU = window.MENU;
  const byId = Object.fromEntries(MENU.products.map(p => [p.id, p]));
  const catById = Object.fromEntries(MENU.categories.map(c => [c.id, c]));
  const addonById = Object.fromEntries(MENU.customize.addons.map(a => [a.id, a]));
  const crepaCfg = MENU.customize.crepa;

  /* Selección curada para la portada: pocos productos, no los 35. */
  const FEATURED = ["latte", "frappe-basico", "arma-tu-crepa", "sandwich", "soda-italiana", "ensalada"];
  const LS = { theme: "coffeetime.theme.v1", cart: "coffeetime.cart.v1", place: "coffeetime.place.v1" };

  const read = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* cuota llena */ }
  };

  const DEFAULT_THEME = {
    primary: "#b23a2f",
    accent: "#e8a33d",
    radius: 18,
    font: "sans",
    dark: false,
    light: { bg: "#fbf6ee", surface: "#ffffff", ink: "#201c18" },
    darkv: { bg: "#141210", surface: "#1d1a17", ink: "#f6efe6" }
  };

  const PRESETS = [
    { id: "casa",    name: "Casa",    primary: "#b23a2f", accent: "#e8a33d", bg: "#fbf6ee", surface: "#ffffff", ink: "#201c18" },
    { id: "verde",   name: "Verde",   primary: "#2f6b5a", accent: "#d9825a", bg: "#f7f4ec", surface: "#ffffff", ink: "#1b1a17" },
    { id: "tostado", name: "Tostado", primary: "#7a3e1d", accent: "#d9a441", bg: "#fdf6ec", surface: "#fffdf9", ink: "#241a12" },
    { id: "noche",   name: "Noche",   primary: "#e8a33d", accent: "#b23a2f", bg: "#141210", surface: "#1d1a17", ink: "#f6efe6" }
  ];

  const state = {
    theme: Object.assign(structuredClone(DEFAULT_THEME), read(LS.theme, {})),
    /* Descarta líneas de versiones anteriores cuyos productos ya no existen. */
    cart: (() => {
      const saved = read(LS.cart, []);
      return Array.isArray(saved) ? saved.filter(r => r && byId[r.id]) : [];
    })(),
    orderPlace: read(LS.place, "Para llevar"),
    query: "",
    pq: 1,
    pv: 0
  };

  /* Estado del modal de personalización. */
  const custom = {
    productId: null,
    kind: "",
    variant: null,
    qty: 1,
    format: "",
    flavors: [],
    flavorText: "",
    extras: []
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = n => "$" + n.toFixed(2).replace(/\.00$/, "");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* Búsqueda sin acentos: “cafe” encuentra “café”. */
  const fold = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const imgFor = p => p.photo || `assets/img/${p.icon}.svg`;
  const imgClass = p => p.photo ? "photo" : "";
  const imgFallback = p => p.gallery?.[0] || `assets/img/${p.icon}.svg`;
  const imgOnError = p => `this.onerror=null;this.src='${imgFallback(p)}';${p.gallery?.length ? "this.classList.add('photo')" : "this.classList.remove('photo')"}`;
  const promoImg = p => p.webp || p.img.replace(/\.(jpe?g|png)$/i, ".webp");
  const promoFallback = p => p.img;
  const basePrice = p => p.variants ? Math.min(...p.variants.map(v => v[1])) : p.price;
  const priceLabel = p => p.variants || p.kind === "crepa" ? `desde ${money(basePrice(p))}` : money(p.price);

  function crepaPrice(n) {
    if (n <= 1) return crepaCfg.base;
    return crepaCfg.promoPrice + Math.max(0, n - crepaCfg.promoAt) * crepaCfg.extra;
  }

  const addonsFor = p => MENU.customize.addons.filter(a => !a.cats || a.cats.includes(p.cat));
  const defaultFormat = p => p.cat === "frias" ? "vaso" : "taza";
  const needsFormat = p => p.kind === "bebida" && !(p.variants || []).some(v => /taza|vaso/i.test(v[0]));

  function formatHint(p) {
    const hasTaza = (p.variants || []).some(v => /^taza\b/i.test(v[0]));
    const hasVaso = (p.variants || []).some(v => /^vaso\b/i.test(v[0]));
    if (hasVaso && !hasTaza) return "Se sirve en vaso para llevar.";
    if (hasTaza && !hasVaso) return "Se sirve en taza para aquí.";
    if (hasTaza && hasVaso) return "Taza = para aquí · Vaso = para llevar.";
    if (!(p.variants || []).length && needsFormat(p)) return "Taza = para aquí · Vaso = para llevar.";
    return "";
  }

  const rowKey = r => `${r.id}::${r.v ?? ""}::${(r.flavors || []).join("|")}::${(r.extras || []).map(e => `${e.id}${e.option ? "=" + e.option : ""}`).join("|")}::${r.format || ""}`;

  function rowPrice(r) {
    const p = byId[r.id];
    if (!p) return 0;
    let base;
    if (p.kind === "crepa") base = crepaPrice((r.flavors || []).length);
    else if (r.v != null && p.variants) base = p.variants[r.v]?.[1] ?? basePrice(p);
    else base = p.variants ? p.variants[0][1] : p.price;
    const extras = (r.extras || []).reduce((n, e) => n + (addonById[e.id]?.price || 0), 0);
    return base + extras;
  }

  function rowDetails(r) {
    const p = byId[r.id];
    if (!p) return [];
    const out = [];
    if (r.v != null && p.variants) {
      const variant = p.variants[r.v][0];
      out.push(variant);
      if (r.format && !/taza|vaso/i.test(variant)) {
        out.push(r.format === "taza" ? "Taza (para aquí)" : "Vaso (para llevar)");
      }
    } else if (r.format) {
      out.push(r.format === "taza" ? "Taza (para aquí)" : "Vaso (para llevar)");
    }
    if ((r.flavors || []).length) {
      out.push(`${p.kind === "crepa" ? "Ingredientes" : "Sabor"}: ${r.flavors.join(p.kind === "crepa" ? ", " : " + ")}`);
    }
    if ((r.extras || []).length) {
      out.push(`Extras: ${r.extras.map(e => {
        const a = addonById[e.id];
        return a ? a.name + (e.option ? ` (${e.option})` : "") : e.id;
      }).join(", ")}`);
    }
    return out;
  }

  /* Las crepas se cotizan una por una: cada línea vale según sus propios ingredientes. */
  const cartCrepaRows = () => state.cart.filter(r => byId[r.id]?.kind === "crepa");
  const cartCrepaCount = () => cartCrepaRows().reduce((n, r) => n + r.qty, 0);
  const cartCrepaTotal = () => cartCrepaRows().reduce((n, r) => n + rowPrice(r) * r.qty, 0);
  const crepaCounter = n => n === 1 ? "Va 1 crepa" : `Van ${n} crepas`;

  /* ---------------- WhatsApp ---------------- */
  const waLink = text => `${MENU.whatsapp}?text=${encodeURIComponent(text)}`;
  const orderMessage = () => {
    const lines = state.cart.map(i => {
      const p = byId[i.id];
      const details = rowDetails(i);
      return `• ${i.qty} × ${p.name} — ${money(rowPrice(i) * i.qty)}${details.length ? "\n   " + details.join("\n   ") : ""}`;
    });
    return [
      "¡Hola COFFEE TIME! Quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `Total: ${money(cartTotal())}`,
      "",
      `Lugar: ${state.orderPlace}`,
      "Mi nombre es: "
    ].join("\n");
  };

  /* ---------------- Tema ---------------- */
  function contrastInk(hex) {
    const h = hex.replace("#", "");
    const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
      .map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return (.2126 * r + .7152 * g + .0722 * b) > .45 ? "#14130f" : "#ffffff";
  }

  function applyTheme() {
    const t = state.theme;
    const mode = t.dark ? t.darkv : t.light;
    const root = document.documentElement;
    root.dataset.mode = t.dark ? "dark" : "light";
    root.dataset.font = t.font;
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-ink", contrastInk(t.primary));
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--bg", mode.bg);
    root.style.setProperty("--surface", mode.surface);
    root.style.setProperty("--ink", mode.ink);
    root.style.setProperty("--radius", t.radius + "px");

    const cur = t.dark ? t.darkv : t.light;
    $("#c-primary").value = t.primary;
    $("#c-accent").value = t.accent;
    $("#c-bg").value = cur.bg;
    $("#c-surface").value = cur.surface;
    $("#c-ink").value = cur.ink;
    $("#r-radius").value = t.radius;
    $("#f-font").value = t.font;
    $("#m-dark").checked = t.dark;
    $$(".preset").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.preset === t.preset)));
  }

  function setTheme(patch, { save = true } = {}) {
    Object.assign(state.theme, patch);
    applyTheme();
    if (save) write(LS.theme, state.theme);
  }

  function buildPresets() {
    $("#presets").innerHTML = PRESETS.map(p => `
      <button class="preset" data-preset="${p.id}" aria-pressed="false" title="${p.name}">
        <span style="background:linear-gradient(135deg, ${p.primary} 0 60%, ${p.accent} 60% 100%)"></span>
      </button>`).join("");
  }

  /* ---------------- Carrito ---------------- */
  const cartCount = () => state.cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = () => state.cart.reduce((n, i) => n + rowPrice(i) * i.qty, 0);

  function addToCart(id, qty = 1, v = null, opts = {}) {
    const p = byId[id];
    if (v == null && p.variants) v = 0;
    const row = {
      id,
      v,
      qty,
      kind: opts.kind || p.kind || "",
      flavors: opts.flavors || [],
      extras: opts.extras || [],
      format: opts.format || ""
    };
    const key = rowKey(row);
    const existing = state.cart.find(i => rowKey(i) === key);
    if (existing) existing.qty += qty;
    else state.cart.push(row);
    write(LS.cart, state.cart);
    paintCart();
    toast(`${p.name} agregado`);
  }

  function setQty(key, qty) {
    const row = state.cart.find(i => rowKey(i) === key);
    if (!row) return;
    row.qty = qty;
    if (row.qty <= 0) state.cart = state.cart.filter(i => rowKey(i) !== key);
    write(LS.cart, state.cart);
    paintCart();
  }

  function paintCart() {
    const n = cartCount();
    const badge = $("#cart-count");
    badge.textContent = n;
    badge.hidden = n === 0;
    $("#cart-total").textContent = money(cartTotal());

    const body = $("#cart-body");
    if (!state.cart.length) {
      body.innerHTML = `<div class="cart-empty"><p><strong>Tu carrito está vacío.</strong></p><p class="small">Agrega algo del menú para empezar tu pedido.</p></div>`;
      return;
    }
    body.innerHTML = state.cart.map(i => {
      const p = byId[i.id];
      const key = rowKey(i);
      const details = rowDetails(i);
      return `<div class="cart-item">
        <img src="${imgFor(p)}" alt="" loading="lazy" class="${imgClass(p)}" onerror="${imgOnError(p)}">
        <div>
          <h4>${esc(p.name)}</h4>
          ${details.map(d => `<div class="muted cart-detail">${esc(d)}</div>`).join("")}
          <div class="muted cart-detail">${money(rowPrice(i))} c/u · ${i.qty} pza</div>
          <button class="rm" data-remove="${esc(key)}">Quitar</button>
        </div>
        <div class="qty">
          <button data-dec="${esc(key)}" aria-label="Quitar uno">−</button>
          <output>${i.qty}</output>
          <button data-inc="${esc(key)}" aria-label="${i.kind === "crepa" ? "Agregar otra crepa" : "Agregar uno"}">+</button>
        </div>
      </div>`;
    }).join("");
  }

  function syncOrderPlace() {
    const sel = $("#order-place");
    if (sel) sel.value = state.orderPlace;
  }

  function buildOrderPlaces() {
    const sel = $("#order-place");
    if (!sel) return;
    const places = ["Para llevar", ...(MENU.tables || [])];
    if (!places.includes(state.orderPlace)) state.orderPlace = places[0];
    sel.innerHTML = places.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");
    syncOrderPlace();
  }

  /* ---------------- Drawers ---------------- */
  let lastFocus = null;
  function openDrawer(el) {
    lastFocus = document.activeElement;
    $("#overlay").hidden = false;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    el.querySelector("button")?.focus();
  }
  function closeDrawers() {
    $$(".drawer").forEach(d => { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); });
    $("#overlay").hidden = true;
    lastFocus?.focus?.();
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------- Vistas ---------------- */
  function carousel() {
    const list = MENU.promos.filter(p => p.hero);
    return `<div class="hero-side">
      <div class="hero-media carousel" id="hero-carousel" role="region"
           aria-roledescription="carrusel" aria-label="Promociones destacadas">
        <div class="car-track">
          ${list.map((p, i) => `<div class="car-slide${i === 0 ? " is-active" : ""}" data-slide="${i}"
               aria-hidden="${i === 0 ? "false" : "true"}">
            <div class="car-bg" aria-hidden="true" style="background-image:url('${p.img}')"></div>
            <img src="${promoImg(p)}" alt="${esc(p.title)}" decoding="async" ${i === 0 ? 'fetchpriority="high"' : ""}
                 onerror="this.onerror=null;this.src='${promoFallback(p)}'">
          </div>`).join("")}
        </div>
        <button class="car-btn car-prev" type="button" data-car="prev" aria-label="Promoción anterior">‹</button>
        <button class="car-btn car-next" type="button" data-car="next" aria-label="Promoción siguiente">›</button>
      </div>
      <div class="car-dots" role="group" aria-label="Elegir promoción">
        ${list.map((p, i) => `<button class="car-dot${i === 0 ? " is-active" : ""}" type="button"
             data-car-to="${i}" aria-label="Promoción ${i + 1} de ${list.length}: ${esc(p.title)}"
             aria-current="${i === 0 ? "true" : "false"}"></button>`).join("")}
      </div>
      <div class="car-bar">
        <div class="car-info" aria-live="polite">
          <strong id="car-title">${esc(list[0].title)}</strong>
          <span class="car-price" id="car-price">${money(list[0].price)}</span>
        </div>
        <div class="car-actions">
          <button class="car-toggle" type="button" data-car-pause aria-pressed="false"
                  aria-label="Pausar el cambio automático" title="Pausar / reanudar">❙❙</button>
          <a class="btn btn-primary btn-sm" id="car-link" target="_blank" rel="noopener"
             href="${waLink(`¡Hola COFFEE TIME! Me interesa la promo: ${list[0].title} (${money(list[0].price)}).`)}">Pedir</a>
        </div>
      </div>
    </div>`;
  }

  function hero() {
    const h = MENU.hero;
    return `<section class="hero">
      <div class="wrap hero-grid">
        <div>
          <span class="eyebrow">Café · crepas · antojos</span>
          <h1>${h.title}</h1>
          <p>${esc(h.text)}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#/menu">Ver el menú</a>
            <a class="btn btn-ghost" href="#/promociones">Promociones</a>
          </div>
          <p class="hero-phone">Pedidos por WhatsApp · <a href="${MENU.whatsapp}" target="_blank" rel="noopener">${esc(MENU.phone)}</a></p>
        </div>
        ${carousel()}
      </div>
    </section>`;
  }

  function promosSection(full = false) {
    const list = full ? MENU.promos : MENU.promos.slice(0, 4);
    return `<section class="wrap promos-section">
      ${full ? "" : `<div class="section-head">
        <h2>Promociones</h2>
        <a class="link-more" href="#/promociones">Ver todas →</a>
      </div>`}
      <div class="promos">
        ${list.map(p => `<article class="promo">
          <div class="promo-media">
            <img src="${promoImg(p)}" alt="${esc(p.title)}" loading="lazy"
                 onerror="this.onerror=null;this.src='${promoFallback(p)}'">
            <span class="promo-badge">${esc(p.badge)}</span>
          </div>
          <div class="promo-body">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.note)}</p>
            <div class="promo-foot">
              <span class="promo-price">${money(p.price)}</span>
              <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener"
                 href="${waLink(`¡Hola COFFEE TIME! Me interesa la promo: ${p.title} (${money(p.price)}).`)}">Pedir</a>
            </div>
          </div>
        </article>`).join("")}
      </div>
    </section>`;
  }

  function contactSection() {
    const c = MENU.contact;
    return `<section class="wrap contact" id="contacto">
      <div class="section-head"><h2>Visítanos</h2></div>
      <div class="contact-grid">
        <div class="contact-card">
          <h3>Dónde estamos</h3>
          <p>${esc(c.address)}<br>${esc(c.city)}</p>
          <a class="btn btn-ghost btn-sm" href="${c.maps}" target="_blank" rel="noopener">Ver en el mapa</a>
        </div>
        <div class="contact-card">
          <h3>Horarios</h3>
          <ul class="hours">
            ${c.hours.map(([d, h]) => `<li><span>${esc(d)}</span><strong>${esc(h)}</strong></li>`).join("")}
          </ul>
        </div>
        <div class="contact-card">
          <h3>Pedidos y redes</h3>
          <p>WhatsApp <a href="${MENU.whatsapp}" target="_blank" rel="noopener">${esc(MENU.phone)}</a></p>
          <div class="socials">
            <a href="${c.instagram}" target="_blank" rel="noopener">Instagram</a>
            <a href="${c.facebook}" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  function chips() {
    const hash = location.hash || "#/";
    const active = hash.startsWith("#/categoria/") ? hash.split("/")[2] : "all";
    return `<div class="wrap chips" role="group" aria-label="Categorías">
      <a class="chip" href="#/menu" aria-current="${active === "all" ? "page" : "false"}">Todo</a>
      ${MENU.categories.map(c => `<a class="chip" href="#/categoria/${c.id}" aria-current="${active === c.id ? "page" : "false"}">${esc(c.name)}</a>`).join("")}
    </div>`;
  }

  function card(p) {
    return `<article class="card">
      <a class="card-media" href="#/producto/${p.id}" aria-label="Ver ${esc(p.name)}">
        ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
        <img src="${imgFor(p)}" alt="${esc(p.name)}" loading="lazy" class="${imgClass(p)}" onerror="${imgOnError(p)}">
      </a>
      <div class="card-body">
        <h3><a href="#/producto/${p.id}">${esc(p.name)}</a></h3>
        <p class="desc">${esc(p.desc)}</p>
        <div class="card-foot">
          <span class="price">${priceLabel(p)}</span>
          <button class="add-btn" data-add="${p.id}">Agregar</button>
        </div>
      </div>
    </article>`;
  }

  function grid(list) {
    if (!list.length) return `<div class="wrap"><p class="muted" style="padding:40px 0 80px">Sin resultados. Prueba otra búsqueda o categoría.</p></div>`;
    return `<div class="wrap grid">${list.map(card).join("")}</div>`;
  }

  function filtered(catId = null) {
    const q = state.query.trim().toLowerCase();
    return MENU.products.filter(p => {
      if (catId && p.cat !== catId) return false;
      if (!q) return true;
      const hay = [
        p.name, p.desc, catById[p.cat].name,
        ...(p.flavors || []),
        ...(p.variants || []).map(v => v[0])
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  function categoryCards() {
    return `<section class="wrap cats">
      <div class="section-head">
        <h2>Explora el menú</h2>
        <a class="link-more" href="#/menu">Ver todo →</a>
      </div>
      <div class="cat-grid">
        ${MENU.categories.map(c => {
          const n = MENU.products.filter(p => p.cat === c.id).length;
          return `<a class="cat-card" href="#/categoria/${c.id}">
            <span class="cat-ico"><img src="assets/img/${c.icon}.svg" alt="" loading="lazy"></span>
            <span class="cat-txt">
              <strong>${esc(c.name)}</strong>
              <small>${n} producto${n === 1 ? "" : "s"}</small>
            </span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </a>`;
        }).join("")}
      </div>
    </section>`;
  }

  function featuredSection() {
    const list = FEATURED.map(id => byId[id]).filter(Boolean);
    return `<section class="wrap featured">
      <div class="section-head">
        <h2>Los favoritos</h2>
        <a class="link-more" href="#/menu">Ver menú completo →</a>
      </div>
      <div class="grid grid-featured">${list.map(card).join("")}</div>
      <div class="section-cta">
        <a class="btn btn-primary" href="#/menu">Ver el menú completo</a>
      </div>
    </section>`;
  }

  function homeView() {
    return `${hero()}
      ${categoryCards()}
      ${featuredSection()}
      ${contactSection()}`;
  }

  function menuView() {
    const list = filtered();
    const n = list.length;
    return `<section class="wrap page-head">
      <div class="crumbs"><a href="#/">Inicio</a> / Menú</div>
      <h1>Menú completo</h1>
      <p class="muted">${MENU.products.length} productos · precios en pesos · pide por WhatsApp al ${esc(MENU.phone)}.</p>
    </section>
    ${chips()}
    <section class="wrap">
      <div class="section-head menu-head">
        <span class="count">${n} producto${n === 1 ? "" : "s"}</span>
        ${state.query ? `<button class="chip clear-query" id="clear-query" type="button" data-clear-query>Limpiar búsqueda ✕</button>` : ""}
      </div>
    </section>
    ${grid(list)}`;
  }

  /* Galería de una crepa: 3 vistas (dulce, fruta y salada) o su foto si aún no hay galería. */
  const galleryFor = p => (p.gallery?.length ? p.gallery : [imgFor(p)]);

  function crepaCarousel(list) {
    const first = list[0];
    const slides = list.flatMap((p, pi) => galleryFor(p).map((src, si) => ({ p, pi, src, si })));
    const multi = slides.length > 1;
    return `<section class="crepa-wrap" aria-label="Crepas">
      <div class="hero-media carousel crepa-carousel" id="crepa-carousel" role="region"
           aria-roledescription="carrusel" aria-label="Arma tu crepa">
        <div class="car-track">
          ${slides.map((s, i) => `<div class="car-slide${i === 0 ? " is-active" : ""}" data-slide="${i}"
               data-crepa-product="${s.pi}" data-crepa-view="${s.si}"
               aria-hidden="${i === 0 ? "false" : "true"}">
            <div class="car-bg" aria-hidden="true" style="background-image:url('${s.src}')"></div>
            <img src="${s.src}" alt="${esc(s.p.name)} — vista ${s.si + 1}" decoding="async">
          </div>`).join("")}
        </div>
        ${multi ? `<button class="car-btn car-prev" type="button" data-crepa-car="prev" aria-label="Vista anterior">‹</button>
        <button class="car-btn car-next" type="button" data-crepa-car="next" aria-label="Vista siguiente">›</button>` : ""}
      </div>
      ${multi ? `<div class="car-dots" role="group" aria-label="Vistas de la crepa">
        ${slides.map((s, i) => `<button class="car-dot${i === 0 ? " is-active" : ""}" type="button"
             data-crepa-to="${i}" aria-label="Vista ${i + 1} de ${slides.length}"
             aria-current="${i === 0 ? "true" : "false"}"></button>`).join("")}
      </div>` : ""}
      <div class="car-bar crepa-bar">
        <div class="car-info">
          <strong id="crepa-title"><a href="#/producto/${first.id}">${esc(first.name)}</a></strong>
          <span class="car-sub">Dulce · Fruta · Salada · hecha al momento</span>
          <span class="car-price" id="crepa-price">${priceLabel(first)}</span>
        </div>
        <div class="car-actions">
          <a class="btn btn-ghost btn-sm" id="crepa-link" href="#/producto/${first.id}">Ver ficha</a>
          <button class="btn btn-primary btn-sm" type="button" id="crepa-add" data-add="${first.id}">Elegir ingredientes</button>
        </div>
      </div>
    </section>`;
  }

  function categoryView(id) {
    const c = catById[id];
    if (!c) return notFound();
    const list = filtered(id);
    return `<div class="wrap page-head">
        <div class="crumbs"><a href="#/">Inicio</a> / <a href="#/menu">Menú</a> / ${esc(c.name)}</div>
        <h1>${esc(c.name)}</h1>
        <p class="muted">${esc(c.blurb)}</p>
      </div>
      ${chips()}
      ${id === "crepas" && list.length ? crepaCarousel(list) : grid(list)}`;
  }

  function customSummary(p) {
    if (p.kind === "crepa") {
      return `<div class="custom-summary">
        <strong>Hazla a tu gusto</strong>
        <p>Dulce, de fruta o salada: tú eliges. Se prepara al momento y cada crepa se cotiza aparte: 1 ingrediente = ${money(crepaCfg.base)} · 3 ingredientes = ${money(crepaCfg.promoPrice)}.</p>
      </div>`;
    }
    if (p.kind === "bebida") {
      return `<div class="custom-summary">
        <strong>Personaliza tu bebida</strong>
        <p>Elige ${p.flavors || p.askFlavor ? "sabor, " : ""}tamaño/formato y extras en el siguiente paso.</p>
      </div>`;
    }
    return `<div class="custom-summary">
      <strong>Elige el sabor</strong>
      <p>Selecciona el sabor al agregar al pedido.</p>
    </div>`;
  }

  function productView(id) {
    const p = byId[id];
    if (!p) return notFound();
    const c = catById[p.cat];
    const rel = MENU.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    const hasV = !!p.variants;
    const modalKind = !!p.kind;
    const price = modalKind ? basePrice(p) : hasV ? p.variants[state.pv][1] : p.price;
    return `<div class="wrap crumbs"><a href="#/">Inicio</a> / <a href="#/menu">Menú</a> / <a href="#/categoria/${c.id}">${esc(c.name)}</a> / ${esc(p.name)}</div>
      <section class="wrap product">
        <div class="product-media">
          <img src="${imgFor(p)}" alt="${esc(p.name)}" class="${imgClass(p)}" onerror="${imgOnError(p)}">
        </div>
        <div class="product-info">
          ${p.tag ? `<span class="eyebrow">${esc(p.tag)}</span>` : ""}
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(p.desc)}</p>

          ${modalKind ? customSummary(p) : ""}

          ${!modalKind && hasV ? `<div class="variant-block">
            <span class="variant-label">Elige tamaño / formato</span>
            <div class="variants">
              ${p.variants.map((v, i) => `<button class="chip" data-pv="${i}" aria-pressed="${i === state.pv}">${esc(v[0])} · ${money(v[1])}</button>`).join("")}
            </div>
          </div>` : ""}

          ${!modalKind && p.flavors ? `<div class="variant-block">
            <span class="variant-label">Sabores disponibles</span>
            <div class="flavors">${p.flavors.map(f => `<span class="flavor">${esc(f)}</span>`).join("")}</div>
          </div>` : ""}

          <div class="product-price" id="prod-price">${modalKind ? priceLabel(p) : money(price)}</div>
          <div class="product-actions">
            ${p.kind === "crepa" ? "" : `<div class="qty">
              <button data-pq="-1" aria-label="Menos">−</button>
              <output id="pq">${state.pq}</output>
              <button data-pq="1" aria-label="Más">+</button>
            </div>`}
            <button class="btn btn-primary" data-add-prod="${p.id}">${modalKind ? (p.kind === "crepa" ? "Elegir ingredientes" : "Elegir opciones") : `Agregar ${state.pq} al pedido`}</button>
          </div>
          <div class="meta">
            <div><strong>Categoría</strong>${esc(c.name)}</div>
            <div><strong>Pedidos</strong>${esc(MENU.phone)}</div>
            ${p.kind === "crepa" ? `<div><strong>Promo</strong>3 ingredientes por ${money(crepaCfg.promoPrice)}</div>` : ""}
          </div>
        </div>
      </section>
      ${rel.length ? `<div class="wrap related"><h2>También te puede gustar</h2></div>${grid(rel)}` : ""}`;
  }

  function promosView() {
    return `<div class="wrap page-head">
        <div class="crumbs"><a href="#/">Inicio</a> / Promociones</div>
        <h1>Promociones</h1>
        <p class="muted">Vigentes en sucursal. Pregunta por WhatsApp al ${esc(MENU.phone)}.</p>
      </div>
      ${promosSection(true)}
      <div class="wrap" style="padding:0 0 70px">
        <a class="btn btn-primary" href="${MENU.whatsapp}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      </div>`;
  }

  function contactView() {
    return `<div class="wrap page-head">
        <div class="crumbs"><a href="#/">Inicio</a> / Contacto</div>
        <h1>Contacto</h1>
        <p class="muted">Pedidos, dudas y promociones por WhatsApp al ${esc(MENU.phone)}.</p>
      </div>
      ${contactSection()}
      <div class="wrap" style="padding:0 0 70px">
        <a class="btn btn-primary" href="${MENU.whatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
      </div>`;
  }

  function notFound() {
    return `<div class="wrap" style="padding:80px 0"><h1>No encontrado</h1><p class="muted">Esa página no existe en el sitio.</p><a class="btn btn-primary" href="#/">Volver al menú</a></div>`;
  }

  /* ---------------- Centro QR ---------------- */
  function qrView() {
    const cards = [
      { img: "assets/img/qr/menu.svg", title: "Menú completo", text: "Escanea para ver el menú, elegir y armar tu pedido." },
      { img: "assets/img/qr/pedir.svg", title: "Pedir por WhatsApp", text: "Abre el chat con el mensaje listo para enviar." },
      { img: "assets/img/qr/promos.svg", title: "Promociones", text: "Las promociones vigentes, siempre actualizadas." },
      { img: "assets/img/qr/opinion.svg", title: "Tu opinión", text: "Cuéntanos cómo te fue en tu visita." },
      { img: "assets/img/qr/club.svg", title: "Club Coffee Time", text: "Únete para recibir avisos y promociones." },
      { img: "assets/img/qr/favoritos.svg", title: "Favoritos de la casa", text: "Vuelve directo a lo más pedido del menú." }
    ];
    return `<div class="wrap page-head qr-head">
        <div class="crumbs"><a href="#/">Inicio</a> / QR y letreros</div>
        <h1>QR y letreros</h1>
        <p class="muted">Letreros listos para imprimir. Un mismo QR puede servir para todo el local: el cliente elige mesa al confirmar su pedido.</p>
        <div class="qr-actions">
          <button class="btn btn-primary" type="button" data-print>Imprimir todos</button>
          <a class="btn btn-ghost" href="#/menu">Ver el menú</a>
        </div>
      </div>
      <section class="wrap qr-grid">
        ${cards.map(c => `<article class="qr-card">
          <div class="qr-brand">COFFEE TIME</div>
          <img src="${c.img}" alt="Código QR: ${esc(c.title)}" width="512" height="512" loading="lazy">
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.text)}</p>
          <span class="qr-scan">Escanea con la cámara</span>
        </article>`).join("")}
      </section>
      <section class="wrap qr-ideas">
        <h2>Formas creativas de usar el QR</h2>
        <div class="qr-ideas-grid">
          <article><h3>Un QR para dos mesas</h3><p>El mismo letrero en cada mesa. Al confirmar, el cliente elige <strong>Mesa 1</strong> o <strong>Mesa 2</strong> y el pedido llega con esa referencia.</p></article>
          <article><h3>En el portavasos o vaso</h3><p>Un sticker con el QR de favoritos invita a volver a pedir y a conocer las promociones.</p></article>
          <article><h3>En la cuenta o el recibo</h3><p>El QR de opinión convierte cada visita en una reseña o un comentario directo por WhatsApp.</p></article>
          <article><h3>Promoción del día</h3><p>El QR de promociones siempre muestra lo vigente: puedes cambiar la promo sin reimprimir el letrero.</p></article>
          <article><h3>Club Coffee Time</h3><p>El QR de lealtad abre WhatsApp con el mensaje de alta. Ideal para la barra o la caja.</p></article>
          <article><h3>WiFi para clientes</h3><p>Cuando definas la contraseña, agrega un QR de WiFi en <code>assets/data.js</code>; se conectan sin preguntar.</p></article>
        </div>
      </section>`;
  }

  /* ---------------- Modal de personalización ---------------- */
  const SERVING = [
    { id: "taza", label: "Taza", hint: "para aquí" },
    { id: "vaso", label: "Vaso", hint: "para llevar" }
  ];

  function variantGroups(p) {
    const taza = [], vaso = [], otros = [];
    p.variants.forEach((v, i) => {
      if (/^taza\s+/i.test(v[0])) taza.push({ i, label: v[0].replace(/^taza\s+/i, "") });
      else if (/^vaso\s+/i.test(v[0])) vaso.push({ i, label: v[0].replace(/^vaso\s+/i, "") });
      else otros.push({ i, label: v[0] });
    });
    const out = [];
    if (taza.length) out.push({ name: "Taza · para aquí", items: taza });
    if (vaso.length) out.push({ name: "Vaso · para llevar", items: vaso });
    if (otros.length) out.push({ name: taza.length || vaso.length ? "Otros tamaños" : "Tamaño", items: otros });
    return out;
  }

  function customUnitPrice() {
    const p = byId[custom.productId];
    if (!p) return 0;
    let base;
    if (p.kind === "crepa") base = crepaPrice(custom.flavors.length);
    else if (p.variants) base = p.variants[custom.variant ?? 0][1];
    else base = p.price;
    return base + custom.extras.reduce((n, e) => n + (addonById[e.id]?.price || 0), 0);
  }

  function customMissing(p) {
    if (p.kind === "crepa" && !custom.flavors.length) return "Elige al menos un ingrediente";
    if (p.flavors && !custom.flavors.length) return "Elige un sabor";
    if (p.askFlavor && !custom.flavorText.trim()) return "Escribe el sabor que deseas";
    if (custom.extras.some(e => addonById[e.id]?.options && !e.option)) return "Elige el sabor del jarabe";
    return "";
  }

  function customNote(p) {
    if (p.kind === "crepa") {
      const n = custom.flavors.length;
      if (n === 0) return `Elige al menos 1 ingrediente. 1 = ${money(crepaCfg.base)} · 3 = ${money(crepaCfg.promoPrice)}.`;
      if (n === 1) return `Con 3 ingredientes pagas ${money(crepaCfg.promoPrice)}. Cada ingrediente extra cuesta ${money(crepaCfg.extra)}.`;
      if (n === 2) return `Te falta 1 ingrediente y pagas lo mismo: ${money(crepaCfg.promoPrice)}. ¡El tercero va incluido!`;
      if (n === crepaCfg.promoAt) return `Promo aplicada: 3 ingredientes por ${money(crepaCfg.promoPrice)}.`;
      const total = crepaCfg.promoPrice + (n - crepaCfg.promoAt) * crepaCfg.extra;
      return `${n} ingredientes: ${money(total)}. Cada ingrediente después de 3 cuesta ${money(crepaCfg.extra)}.`;
    }
    if (p.kind === "bebida") {
      if (p.flavors && !custom.flavors.length) return "Elige un sabor.";
      if (p.askFlavor && !custom.flavorText.trim()) return "Escribe el sabor que deseas.";
      if (custom.extras.some(e => addonById[e.id]?.options && !e.option)) return "Elige el sabor del jarabe.";
      return formatHint(p);
    }
    return "";
  }

  function customMarkup(p) {
    const kind = p.kind;
    const blocks = [];
    const isCrepa = kind === "crepa";
    const crepaN = isCrepa ? cartCrepaCount() + 1 : 0;

    if (kind === "crepa") {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3 id="opt-flavors">Ingredientes</h3>
          <span class="opt-hint">Puedes mezclar dulce, fruta y salada.</span>
        </div>
        ${crepaCfg.groups.map(g => `<div class="opt-group">
          <span class="opt-group-name">${esc(g.name)}</span>
          <div class="opt-chips">
            ${g.items.map(f => `<button class="opt-chip" type="button" data-flavor="${esc(f)}" aria-pressed="false">${esc(f)}</button>`).join("")}
          </div>
        </div>`).join("")}
      </section>`);
    } else if (p.flavors) {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3 id="opt-flavors">Sabor</h3>
        </div>
        <div class="opt-chips">
          ${p.flavors.map(f => `<button class="opt-chip" type="button" data-flavor="${esc(f)}" aria-pressed="false">${esc(f)}</button>`).join("")}
        </div>
      </section>`);
    } else if (p.askFlavor) {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3 id="opt-flavors">Sabor</h3>
          <span class="opt-hint">Escríbelo y lo preparamos.</span>
        </div>
        <label class="opt-field">Sabor de ${esc(p.name.toLowerCase())}
          <input type="text" id="modal-flavor-text" maxlength="60" placeholder="Ej. manzanilla, menta, frutos rojos" autocomplete="off">
        </label>
      </section>`);
    }

    if (p.variants) {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3 id="opt-size">Tamaño / formato</h3>
          <span class="opt-hint">${esc(formatHint(p))}</span>
        </div>
        ${variantGroups(p).map(g => `<div class="opt-group">
          <span class="opt-group-name">${esc(g.name)}</span>
          <div class="opt-chips">
            ${g.items.map(it => `<button class="opt-chip opt-size" type="button" data-modal-variant="${it.i}" aria-pressed="${it.i === custom.variant}">${esc(it.label)}</button>`).join("")}
          </div>
        </div>`).join("")}
      </section>`);
    } else if (kind === "bebida" && needsFormat(p)) {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3 id="opt-size">Formato</h3>
          <span class="opt-hint">Taza = para aquí · Vaso = para llevar.</span>
        </div>
        <div class="opt-chips">
          ${SERVING.map(s => `<button class="opt-chip" type="button" data-modal-format="${s.id}" aria-pressed="${custom.format === s.id}">${esc(s.label)} <small>${esc(s.hint)}</small></button>`).join("")}
        </div>
      </section>`);
    }

    const addons = addonsFor(p);
    if (addons.length) {
      blocks.push(`<section class="opt-block">
        <div class="opt-head">
          <h3>¿Quieres agregar un extra?</h3>
          <span class="opt-hint">Opcional.</span>
        </div>
        <div class="extras-list">
          ${addons.map(a => `<div class="extra-row">
            <label class="extra-check">
              <input type="checkbox" data-addon="${a.id}">
              <span>${esc(a.name)}${a.note ? ` <small>${esc(a.note)}</small>` : ""}</span>
              <strong>+${money(a.price)}</strong>
            </label>
            ${a.options ? `<label class="extra-option" data-addon-option-wrap="${a.id}" hidden>
              <span>Elige el sabor de ${esc(a.name.toLowerCase())}:</span>
              <select data-addon-option="${a.id}">
                <option value="">Elige sabor…</option>
                ${a.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
              </select>
            </label>` : ""}
          </div>`).join("")}
        </div>
      </section>`);
    }

    return `<div class="modal-card">
      <header class="modal-head">
        <div class="modal-product">
          <img src="${imgFor(p)}" alt="" class="${imgClass(p)}" onerror="${imgOnError(p)}">
          <div>
            <h2 id="modal-title">${esc(p.name)}</h2>
            <p>${esc(p.desc)}</p>
            ${isCrepa ? `<p class="crepa-count" id="crepa-count">${crepaCounter(crepaN)}</p>` : ""}
          </div>
        </div>
        <button class="icon-btn" type="button" data-close-modal aria-label="Cerrar">✕</button>
      </header>
      <div class="modal-body">
        ${blocks.join("")}
        <p class="promo-note" id="modal-note" aria-live="polite"></p>
      </div>
      <footer class="modal-foot">
        <div class="modal-sum">
          ${isCrepa ? `<div class="modal-qty">
            <span>Esta crepa</span>
            <strong id="modal-unit" aria-live="polite">${money(customUnitPrice())}</strong>
          </div>` : `<div class="modal-qty">
            <span>Cantidad</span>
            <div class="qty">
              <button type="button" data-modal-qty="-1" aria-label="Menos">−</button>
              <output id="modal-qty">${custom.qty}</output>
              <button type="button" data-modal-qty="1" aria-label="Más">+</button>
            </div>
          </div>`}
          <div class="modal-total">
            <span>${isCrepa ? "Total de crepas" : "Total"}</span>
            <strong id="modal-total" aria-live="polite">${money(isCrepa ? cartCrepaTotal() + customUnitPrice() : customUnitPrice() * custom.qty)}</strong>
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="button" data-modal-add id="modal-add">Agregar al pedido</button>
        <div class="modal-secondary">
          ${isCrepa ? `<button class="btn btn-ghost" type="button" data-modal-more-crepa>+ Otra crepa</button>` : ""}
          <button class="btn btn-ghost" type="button" data-modal-picker>+ Agregar otro producto</button>
        </div>
        <p class="modal-legal">Precios en pesos · el pedido se confirma por WhatsApp.</p>
      </footer>
    </div>`;
  }

  function syncCustom() {
    const p = byId[custom.productId];
    const dlg = $("#custom-dialog");
    if (!p || !dlg) return;

    $$("[data-flavor]", dlg).forEach(b => {
      const on = custom.flavors.includes(b.dataset.flavor);
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    $$("[data-modal-variant]", dlg).forEach(b => {
      const on = Number(b.dataset.modalVariant) === custom.variant;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    $$("[data-modal-format]", dlg).forEach(b => {
      const on = b.dataset.modalFormat === custom.format;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    $$("[data-addon]", dlg).forEach(cb => {
      cb.checked = custom.extras.some(e => e.id === cb.dataset.addon);
    });
    $$("[data-addon-option-wrap]", dlg).forEach(w => {
      w.hidden = !custom.extras.some(e => e.id === w.dataset.addonOptionWrap);
    });
    $$("[data-addon-option]", dlg).forEach(sel => {
      const e = custom.extras.find(x => x.id === sel.dataset.addonOption);
      sel.value = e?.option || "";
    });

    const qtyOut = $("#modal-qty", dlg);
    if (qtyOut) qtyOut.textContent = custom.qty;
    const unitOut = $("#modal-unit", dlg);
    if (unitOut) unitOut.textContent = money(customUnitPrice());
    const total = $("#modal-total", dlg);
    if (total) total.textContent = money(p.kind === "crepa" ? cartCrepaTotal() + customUnitPrice() : customUnitPrice() * custom.qty);
    const note = $("#modal-note", dlg);
    if (note) note.textContent = customNote(p);
    const add = $("#modal-add", dlg);
    if (add) {
      const missing = customMissing(p);
      add.disabled = !!missing;
      add.setAttribute("aria-disabled", String(!!missing));
    }
  }

  function openCustom(id, opts = {}) {
    const p = byId[id];
    if (!p) return;
    if (!p.kind) {
      addToCart(id, opts.qty || 1, p.variants ? (opts.variant ?? 0) : null);
      return;
    }
    custom.productId = id;
    custom.kind = p.kind;
    custom.variant = p.variants ? (opts.variant ?? 0) : null;
    custom.qty = p.kind === "crepa" ? 1 : Math.max(1, Math.min(20, opts.qty || 1));
    custom.format = needsFormat(p) ? (opts.format || defaultFormat(p)) : "";
    custom.flavors = [];
    custom.flavorText = "";
    custom.extras = [];

    const dlg = $("#custom-dialog");
    if (dlg.open) dlg.close();
    dlg.innerHTML = customMarkup(p);
    dlg.showModal();
    syncCustom();
    dlg.querySelector("[data-flavor], [data-modal-variant], [data-modal-format]")?.focus();
  }

  function closeCustom() {
    const dlg = $("#custom-dialog");
    if (dlg?.open) dlg.close();
  }

  function addCustomToCart(opts = {}) {
    const p = byId[custom.productId];
    if (!p) return false;
    const missing = customMissing(p);
    if (missing) { toast(missing); return false; }
    const flavors = p.askFlavor && !p.flavors ? [custom.flavorText.trim()] : [...custom.flavors];
    addToCart(p.id, p.kind === "crepa" ? 1 : custom.qty, custom.variant, {
      kind: p.kind,
      flavors,
      extras: custom.extras.map(e => ({ id: e.id, option: e.option || "" })),
      format: needsFormat(p) ? custom.format : ""
    });
    if (opts.next === "picker") { closeCustom(); openPicker(); }
    else if (opts.next === "more") openCustom(p.id);
    else closeCustom();
    return true;
  }

  /* ---------------- Selector “Agregar otro producto” ---------------- */
  const PICKER_SKIP = new Set(["extras"]);

  function pickerItem(p) {
    const search = fold(`${p.name} ${p.desc || ""} ${(p.flavors || []).join(" ")} ${catById[p.cat]?.name || ""}`);
    const price = p.kind && !p.variants && p.kind !== "crepa" ? money(p.price) : priceLabel(p);
    return `<button class="picker-item" type="button" data-picker-item data-picker-add="${p.id}"
        data-search="${esc(search)}" aria-label="${p.kind ? "Elegir" : "Agregar"} ${esc(p.name)}">
      <img src="${imgFor(p)}" alt="" loading="lazy" class="${imgClass(p)}" onerror="${imgOnError(p)}">
      <span class="picker-item-info">
        <strong>${esc(p.name)}</strong>
        <small>${esc(p.desc || "")}</small>
      </span>
      <span class="picker-item-side">
        <span class="picker-item-price">${price}</span>
        <span class="picker-plus" aria-hidden="true">+</span>
      </span>
    </button>`;
  }

  function pickerMarkup() {
    const cats = MENU.categories.filter(c => !PICKER_SKIP.has(c.id));
    return `<div class="modal-card picker-card">
      <header class="picker-head">
        <div>
          <span class="picker-kicker">Sigue armando tu pedido</span>
          <h2 id="picker-title">Agrega otro producto</h2>
          <p>Bebidas calientes, frías, crepas y comida. Toca uno para sumarlo.</p>
        </div>
        <button class="icon-btn" type="button" data-close-picker aria-label="Cerrar">✕</button>
      </header>
      <div class="picker-search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="search" id="picker-search" placeholder="Buscar café, frappé, crepa…" autocomplete="off">
      </div>
      <div class="modal-body picker-body" id="picker-body">
        ${cats.map(c => {
          const items = MENU.products.filter(p => p.cat === c.id);
          if (!items.length) return "";
          return `<section class="picker-section" data-picker-section>
            <h3>${esc(c.name)}<span>${items.length}</span></h3>
            <div class="picker-list">${items.map(pickerItem).join("")}</div>
          </section>`;
        }).join("")}
        <p class="picker-empty" id="picker-empty" hidden>No encontramos ese producto. Prueba con otra palabra.</p>
      </div>
      <footer class="modal-foot picker-foot">
        <div class="picker-cart-summary">
          <span id="picker-cart-count">Tu pedido está vacío</span>
          <strong id="picker-cart-total">$0</strong>
        </div>
        <div class="picker-foot-actions">
          <button class="btn btn-ghost" type="button" data-close-picker>Seguir viendo</button>
          <button class="btn btn-primary" type="button" data-open-cart>Ver mi pedido</button>
        </div>
      </footer>
    </div>`;
  }

  function paintPickerCart() {
    const n = cartCount();
    const count = $("#picker-cart-count");
    const total = $("#picker-cart-total");
    if (count) count.textContent = n ? `${n} producto${n === 1 ? "" : "s"} en tu pedido` : "Tu pedido está vacío";
    if (total) total.textContent = money(cartTotal());
  }

  function filterPicker() {
    const q = fold(($("#picker-search")?.value || "").trim());
    let any = false;
    $$("[data-picker-item]").forEach(item => {
      const match = !q || item.dataset.search.includes(q);
      item.hidden = !match;
      if (match) any = true;
    });
    $$("[data-picker-section]").forEach(section => {
      section.hidden = !$$("[data-picker-item]:not([hidden])", section).length;
    });
    const empty = $("#picker-empty");
    if (empty) empty.hidden = any;
  }

  function openPicker() {
    const dlg = $("#picker-dialog");
    if (!dlg) return;
    if (dlg.open) dlg.close();
    dlg.innerHTML = pickerMarkup();
    dlg.showModal();
    paintPickerCart();
    $("#picker-search")?.focus();
  }

  function closePicker() {
    const dlg = $("#picker-dialog");
    if (dlg?.open) dlg.close();
  }

  /* ---------------- Carruseles ---------------- */
  let carTimer = null;
  let carIndex = 0;
  let carPaused = false;
  let carShow = null;
  let carStart = null;
  let crepaTimer = null;
  let crepaIndex = 0;
  let crepaShow = null;
  let crepaStart = null;

  /* Deslizamiento con el dedo o el mouse (flechas y puntos siguen funcionando). */
  function addSwipe(el, onNext, onPrev) {
    let x0 = null, y0 = 0;
    el.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      x0 = e.clientX;
      y0 = e.clientY;
      try { el.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    });
    el.addEventListener("pointerup", e => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) onNext(); else onPrev();
    });
    el.addEventListener("pointercancel", () => { x0 = null; });
  }

  function initCarousel() {
    clearInterval(carTimer);
    carTimer = null;
    carPaused = false;
    carShow = null;
    carStart = null;

    const root = $("#hero-carousel");
    if (!root) return;
    const region = root.closest(".hero-side") || root;
    const list = MENU.promos.filter(p => p.hero);
    const slides = $$(".car-slide", root);
    const dots = $$(".car-dot", region);
    if (slides.length < 2) return;

    const show = n => {
      carIndex = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle("is-active", k === carIndex);
        s.setAttribute("aria-hidden", String(k !== carIndex));
      });
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === carIndex);
        d.setAttribute("aria-current", String(k === carIndex));
      });
      const p = list[carIndex];
      $("#car-title").textContent = p.title;
      $("#car-price").textContent = money(p.price);
      $("#car-link").href = waLink(`¡Hola COFFEE TIME! Me interesa la promo: ${p.title} (${money(p.price)}).`);
    };
    const stop = () => { clearInterval(carTimer); carTimer = null; };
    const start = () => {
      stop();
      if (!carPaused && !document.hidden) {
        carTimer = setInterval(() => show(carIndex + 1), 5000);
      }
    };

    carShow = n => { show(n); start(); };
    carStart = start;

    region.addEventListener("mouseenter", stop);
    region.addEventListener("mouseleave", start);
    region.addEventListener("focusin", stop);
    region.addEventListener("focusout", start);
    addSwipe(root, () => carShow?.(carIndex + 1), () => carShow?.(carIndex - 1));

    show(0);
    start();
  }

  /* Carrusel de crepas: una vista a la vez, rotando la galería de "Arma tu crepa". */
  function initCrepaCarousel() {
    clearInterval(crepaTimer);
    crepaTimer = null;
    crepaShow = null;
    crepaStart = null;

    const root = $("#crepa-carousel");
    if (!root) return;
    const wrap = root.parentElement;
    const list = filtered("crepas");
    const slides = $$(".car-slide", root);
    const dots = $$(".car-dot", wrap);
    if (!slides.length) return;

    const show = n => {
      crepaIndex = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle("is-active", k === crepaIndex);
        s.setAttribute("aria-hidden", String(k !== crepaIndex));
      });
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === crepaIndex);
        d.setAttribute("aria-current", String(k === crepaIndex));
      });
      const active = slides[crepaIndex];
      const p = list[Number(active?.dataset.crepaProduct) || 0];
      if (!p) return;
      const title = $("#crepa-title");
      const price = $("#crepa-price");
      const link = $("#crepa-link");
      const add = $("#crepa-add");
      if (title) title.innerHTML = `<a href="#/producto/${p.id}">${esc(p.name)}</a>`;
      if (price) price.textContent = priceLabel(p);
      if (link) link.href = `#/producto/${p.id}`;
      if (add) add.dataset.add = p.id;
    };
    const stop = () => { clearInterval(crepaTimer); crepaTimer = null; };
    const start = () => {
      stop();
      if (!document.hidden && slides.length > 1) crepaTimer = setInterval(() => show(crepaIndex + 1), 5000);
    };

    crepaShow = n => { show(n); start(); };
    crepaStart = start;

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    if (slides.length > 1) addSwipe(root, () => crepaShow?.(crepaIndex + 1), () => crepaShow?.(crepaIndex - 1));

    show(0);
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(carTimer);
      clearInterval(crepaTimer);
    } else {
      carStart?.();
      crepaStart?.();
    }
  });

  /* ---------------- Router ---------------- */
  function route() {
    const hash = location.hash || "#/";
    const [, kind, id] = hash.split("/");
    state.pq = 1;

    let html, title;
    if (!kind) { html = homeView(); title = "COFFEE TIME — Café, crepas y antojos"; }
    else if (kind === "menu") { html = menuView(); title = "Menú — COFFEE TIME"; }
    else if (kind === "categoria") { html = categoryView(id); title = `${catById[id]?.name ?? "Categoría"} — COFFEE TIME`; }
    else if (kind === "producto") {
      const p = byId[id];
      state.pv = 0;
      html = productView(id);
      title = `${p?.name ?? "Producto"} — COFFEE TIME`;
    }
    else if (kind === "promociones") { html = promosView(); title = "Promociones — COFFEE TIME"; }
    else if (kind === "contacto") { html = contactView(); title = "Contacto — COFFEE TIME"; }
    else if (kind === "qr") { html = qrView(); title = "QR y letreros — COFFEE TIME"; }
    else if (kind === "mesa") {
      const n = Number(id);
      const table = MENU.tables?.[n - 1];
      if (table) {
        state.orderPlace = table;
        write(LS.place, state.orderPlace);
      }
      html = menuView();
      title = "Menú — COFFEE TIME";
    }
    else { html = notFound(); title = "No encontrado — COFFEE TIME"; }

    $("#main").innerHTML = html;
    document.title = title;
    $$(".main-nav a").forEach(a => {
      a.setAttribute("aria-current", a.getAttribute("href") === hash ? "page" : "false");
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    paintCart();
    syncOrderPlace();
    initCarousel();
    initCrepaCarousel();
  }

  /* ---------------- Eventos ---------------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-add],[data-add-prod],[data-inc],[data-dec],[data-remove],[data-pq],[data-pv],[data-close-drawer],[data-noop],[data-preset],[data-car],[data-car-to],[data-car-pause],[data-crepa-car],[data-crepa-to],[data-clear-query],[data-close-modal],[data-flavor],[data-addon],[data-modal-variant],[data-modal-format],[data-modal-qty],[data-modal-add],[data-modal-more-crepa],[data-modal-picker],[data-picker-add],[data-close-picker],[data-open-cart],[data-print]");
    if (!t) return;

    if (t.matches("[data-print]")) { window.print(); return; }

    if (t.matches("[data-clear-query]")) {
      state.query = "";
      const input = $("#search");
      if (input) input.value = "";
      route();
      return;
    }

    if (t.matches("[data-car]")) { carShow?.(carIndex + (t.dataset.car === "next" ? 1 : -1)); return; }
    if (t.matches("[data-car-to]")) { carShow?.(Number(t.dataset.carTo)); return; }
    if (t.matches("[data-crepa-car]")) { crepaShow?.(crepaIndex + (t.dataset.crepaCar === "next" ? 1 : -1)); return; }
    if (t.matches("[data-crepa-to]")) { crepaShow?.(Number(t.dataset.crepaTo)); return; }
    if (t.matches("[data-car-pause]")) {
      carPaused = !carPaused;
      t.setAttribute("aria-pressed", String(carPaused));
      t.setAttribute("aria-label", carPaused ? "Reanudar el cambio automático" : "Pausar el cambio automático");
      t.textContent = carPaused ? "▶" : "❙❙";
      if (carPaused) clearInterval(carTimer); else carStart?.();
      return;
    }

    if (t.matches("[data-add]")) {
      const p = byId[t.dataset.add];
      if (p?.kind) openCustom(p.id);
      else addToCart(t.dataset.add);
      return;
    }
    if (t.matches("[data-add-prod]")) {
      const p = byId[t.dataset.addProd];
      if (p?.kind) openCustom(p.id, { qty: state.pq, variant: p.variants ? state.pv : null });
      else addToCart(p.id, state.pq, p.variants ? state.pv : null);
      return;
    }

    if (t.matches("[data-close-modal]")) { closeCustom(); return; }
    if (t.matches("[data-flavor]")) {
      const f = t.dataset.flavor;
      const p = byId[custom.productId];
      if (p?.kind === "crepa") {
        const i = custom.flavors.indexOf(f);
        if (i >= 0) custom.flavors.splice(i, 1); else custom.flavors.push(f);
      } else {
        /* Bebidas y productos de un sabor: una sola selección. */
        custom.flavors = [f];
      }
      syncCustom();
      return;
    }
    if (t.matches("[data-modal-variant]")) { custom.variant = Number(t.dataset.modalVariant); syncCustom(); return; }
    if (t.matches("[data-modal-format]")) { custom.format = t.dataset.modalFormat; syncCustom(); return; }
    if (t.matches("[data-modal-qty]")) {
      custom.qty = Math.max(1, Math.min(20, custom.qty + Number(t.dataset.modalQty)));
      syncCustom();
      return;
    }
    if (t.matches("[data-modal-add]")) { addCustomToCart(); return; }
    if (t.matches("[data-modal-more-crepa]")) { addCustomToCart({ next: "more" }); return; }
    if (t.matches("[data-modal-picker]")) { addCustomToCart({ next: "picker" }); return; }

    if (t.matches("[data-picker-add]")) {
      const p = byId[t.dataset.pickerAdd];
      if (!p) return;
      if (p.kind) { closePicker(); openCustom(p.id); }
      else {
        addToCart(p.id);
        paintPickerCart();
        t.classList.add("is-added");
        setTimeout(() => t.classList.remove("is-added"), 700);
      }
      return;
    }
    if (t.matches("[data-close-picker]")) { closePicker(); return; }
    if (t.matches("[data-open-cart]")) { closePicker(); openDrawer($("#cart-drawer")); return; }
    if (t.matches("[data-addon]")) {
      const id = t.dataset.addon;
      if (t.checked) custom.extras.push({ id, option: "" });
      else custom.extras = custom.extras.filter(x => x.id !== id);
      syncCustom();
      return;
    }

    if (t.matches("[data-inc]")) {
      const r = state.cart.find(i => rowKey(i) === t.dataset.inc);
      if (!r) return;
      const p = byId[r.id];
      /* Bebidas con sabor y crepas: reabre el modal en blanco para la nueva pieza. */
      if (p && (p.flavors || p.askFlavor || p.kind === "crepa")) {
        openCustom(p.id, { qty: 1, variant: r.v, format: r.format });
        return;
      }
      setQty(t.dataset.inc, r.qty + 1);
      return;
    }
    if (t.matches("[data-dec]")) { const r = state.cart.find(i => rowKey(i) === t.dataset.dec); if (r) setQty(t.dataset.dec, r.qty - 1); return; }
    if (t.matches("[data-remove]")) { setQty(t.dataset.remove, 0); return; }

    if (t.matches("[data-pv]")) {
      state.pv = Number(t.dataset.pv);
      const p = byId[$("[data-add-prod]").dataset.addProd];
      $$("[data-pv]").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.pv) === state.pv)));
      $("#prod-price").textContent = money(p.variants[state.pv][1]);
      return;
    }

    if (t.matches("[data-pq]")) {
      state.pq = Math.max(1, Math.min(20, state.pq + Number(t.dataset.pq)));
      const out = $("#pq");
      if (out) out.textContent = state.pq;
      const btn = $("[data-add-prod]");
      if (btn) {
        const bp = byId[btn.dataset.addProd];
        btn.textContent = bp?.kind ? (bp.kind === "crepa" ? "Elegir ingredientes" : "Elegir opciones") : `Agregar ${state.pq} al pedido`;
      }
      return;
    }

    if (t.matches("[data-close-drawer]")) { closeDrawers(); return; }
    if (t.matches("[data-noop]")) { e.preventDefault(); toast("Enlace no disponible"); return; }

    if (t.matches("[data-preset]")) {
      const p = PRESETS.find(x => x.id === t.dataset.preset);
      const dark = p.id === "noche";
      setTheme({
        preset: p.id, primary: p.primary, accent: p.accent, dark,
        light: dark ? structuredClone(DEFAULT_THEME.light) : { bg: p.bg, surface: p.surface, ink: p.ink },
        darkv: dark ? { bg: p.bg, surface: p.surface, ink: p.ink } : structuredClone(DEFAULT_THEME.darkv)
      });
      return;
    }
  });

  document.addEventListener("change", e => {
    if (e.target.id === "order-place") {
      state.orderPlace = e.target.value;
      write(LS.place, state.orderPlace);
      return;
    }
    const sel = e.target.closest("[data-addon-option]");
    if (!sel) return;
    const entry = custom.extras.find(x => x.id === sel.dataset.addonOption);
    if (entry) entry.option = sel.value;
    syncCustom();
  });

  document.addEventListener("input", e => {
    if (e.target.id === "picker-search") { filterPicker(); return; }
    if (e.target.id !== "modal-flavor-text") return;
    custom.flavorText = e.target.value;
    syncCustom();
  });

  const customDialog = $("#custom-dialog");
  customDialog?.addEventListener("click", e => {
    if (e.target === customDialog) closeCustom();
  });

  const pickerDialog = $("#picker-dialog");
  pickerDialog?.addEventListener("click", e => {
    if (e.target === pickerDialog) closePicker();
  });

  $("#search").addEventListener("input", e => {
    state.query = e.target.value;
    if (location.hash !== "#/menu") location.hash = "#/menu";
    else route();
  });

  $("#cart-open").addEventListener("click", () => openDrawer($("#cart-drawer")));
  $("#theme-toggle").addEventListener("click", () => openDrawer($("#theme-drawer")));
  $("#overlay").addEventListener("click", closeDrawers);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawers(); });

  $("#cart-clear").addEventListener("click", () => { state.cart = []; write(LS.cart, state.cart); paintCart(); toast("Carrito vacío"); });
  $("#checkout").addEventListener("click", () => {
    if (!state.cart.length) return toast("Agrega algo primero");
    window.open(waLink(orderMessage()), "_blank", "noopener");
    toast("Abriendo WhatsApp con tu pedido…");
  });

  $("#theme-reset").addEventListener("click", () => {
    state.theme = structuredClone(DEFAULT_THEME);
    write(LS.theme, state.theme);
    applyTheme();
    toast("Tema restablecido");
  });

  $("#c-primary").addEventListener("input", e => setTheme({ primary: e.target.value, preset: "" }));
  $("#c-accent").addEventListener("input", e => setTheme({ accent: e.target.value, preset: "" }));
  $("#c-bg").addEventListener("input", e => setTheme({ [state.theme.dark ? "darkv" : "light"]: { ...(state.theme.dark ? state.theme.darkv : state.theme.light), bg: e.target.value }, preset: "" }));
  $("#c-surface").addEventListener("input", e => setTheme({ [state.theme.dark ? "darkv" : "light"]: { ...(state.theme.dark ? state.theme.darkv : state.theme.light), surface: e.target.value }, preset: "" }));
  $("#c-ink").addEventListener("input", e => setTheme({ [state.theme.dark ? "darkv" : "light"]: { ...(state.theme.dark ? state.theme.darkv : state.theme.light), ink: e.target.value }, preset: "" }));
  $("#r-radius").addEventListener("input", e => setTheme({ radius: Number(e.target.value), preset: "" }));
  $("#f-font").addEventListener("change", e => setTheme({ font: e.target.value, preset: "" }));
  $("#m-dark").addEventListener("change", e => setTheme({ dark: e.target.checked }));

  /* ---------------- Archivos opcionales (PNG reales) ---------------- */
  const exists = async url => {
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      return r.ok;
    } catch { return false; }
  };

  (async function pattern() {
    if (await exists("assets/img/pattern.png")) {
      document.documentElement.style.setProperty("--pattern", 'url("img/pattern.png")');
    }
  })();

  /* ---------------- Init ---------------- */
  write(LS.cart, state.cart);
  try { localStorage.removeItem("coffeetime.img.v1"); } catch { /* sin almacenamiento */ }
  buildPresets();
  applyTheme();
  buildOrderPlaces();
  paintCart();
  window.addEventListener("hashchange", route);
  route();
})();
