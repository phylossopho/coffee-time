/* COFFEE TIME — router, carrito con variantes, promociones, tema e imágenes. */
(() => {
  "use strict";

  const MENU = window.MENU;
  const byId = Object.fromEntries(MENU.products.map(p => [p.id, p]));
  const catById = Object.fromEntries(MENU.categories.map(c => [c.id, c]));

  /* Selección curada para la portada: pocos productos, no los 35. */
  const FEATURED = ["latte", "frappe-basico", "crepa-dulce", "sandwich", "soda-italiana", "ensalada"];
  const LS = { theme: "coffeetime.theme.v1", cart: "coffeetime.cart.v1", img: "coffeetime.img.v1" };

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
    cart: read(LS.cart, []),
    images: read(LS.img, {}),
    query: "",
    pq: 1,
    pv: 0
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = n => "$" + n.toFixed(2).replace(/\.00$/, "");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const imgFor = p => state.images[p.id] || p.photo || `assets/img/${p.icon}.svg`;
  const basePrice = p => p.variants ? Math.min(...p.variants.map(v => v[1])) : p.price;
  const priceLabel = p => p.variants ? `desde ${money(basePrice(p))}` : money(p.price);
  const rowKey = r => `${r.id}::${r.v ?? ""}`;
  const rowPrice = r => r.v == null ? byId[r.id].price : byId[r.id].variants[r.v][1];

  /* ---------------- WhatsApp ---------------- */
  const waLink = text => `${MENU.whatsapp}?text=${encodeURIComponent(text)}`;
  const orderMessage = () => {
    const lines = state.cart.map(i => {
      const p = byId[i.id];
      const v = i.v == null ? "" : ` (${p.variants[i.v][0]})`;
      return `• ${i.qty} × ${p.name}${v} — ${money(rowPrice(i) * i.qty)}`;
    });
    return [
      "¡Hola COFFEE TIME! Quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `Total: ${money(cartTotal())}`,
      "",
      "Mi nombre es: ",
      "Lo paso a recoger / envío a: "
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

  function addToCart(id, qty = 1, v = null) {
    const key = `${id}::${v ?? ""}`;
    const row = state.cart.find(i => rowKey(i) === key);
    if (row) row.qty += qty; else state.cart.push({ id, v, qty });
    write(LS.cart, state.cart);
    paintCart();
    toast(`${byId[id].name} agregado`);
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
      body.innerHTML = `<div class="cart-empty"><p><strong>Tu carrito está vacío.</strong></p><p class="small">Agrega algo del menú para probar el flujo.</p></div>`;
      return;
    }
    body.innerHTML = state.cart.map(i => {
      const p = byId[i.id];
      const v = i.v == null ? "" : p.variants[i.v][0];
      return `<div class="cart-item">
        <img src="${imgFor(p)}" alt="">
        <div>
          <h4>${esc(p.name)}</h4>
          <div class="muted">${v ? esc(v) + " · " : ""}${money(rowPrice(i))} · ${i.qty} pza</div>
          <button class="rm" data-remove="${rowKey(i)}">Quitar</button>
        </div>
        <div class="qty">
          <button data-dec="${rowKey(i)}" aria-label="Quitar uno">−</button>
          <output>${i.qty}</output>
          <button data-inc="${rowKey(i)}" aria-label="Agregar uno">+</button>
        </div>
      </div>`;
    }).join("");
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
            <img src="${p.img}" alt="${esc(p.title)}" decoding="async" ${i === 0 ? 'fetchpriority="high"' : ""}
                 onerror="this.onerror=null;this.src='${p.art}'">
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
            <img src="${p.img}" alt="${esc(p.title)}" loading="lazy"
                 onerror="this.onerror=null;this.src='${p.art}'">
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
        <img src="${imgFor(p)}" alt="${esc(p.name)}" loading="lazy">
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
      ${grid(list)}`;
  }

  function productView(id) {
    const p = byId[id];
    if (!p) return notFound();
    const c = catById[p.cat];
    const rel = MENU.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    const hasV = !!p.variants;
    const price = hasV ? p.variants[state.pv][1] : p.price;
    return `<div class="wrap crumbs"><a href="#/">Inicio</a> / <a href="#/menu">Menú</a> / <a href="#/categoria/${c.id}">${esc(c.name)}</a> / ${esc(p.name)}</div>
      <section class="wrap product">
        <div class="product-media">
          <img src="${imgFor(p)}" alt="${esc(p.name)}" class="${state.images[p.id] || p.photo ? "photo" : ""}">
        </div>
        <div class="product-info">
          ${p.tag ? `<span class="eyebrow">${esc(p.tag)}</span>` : ""}
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(p.desc)}</p>

          ${hasV ? `<div class="variant-block">
            <span class="variant-label">Elige tamaño / formato</span>
            <div class="variants">
              ${p.variants.map((v, i) => `<button class="chip" data-pv="${i}" aria-pressed="${i === state.pv}">${esc(v[0])} · ${money(v[1])}</button>`).join("")}
            </div>
          </div>` : ""}

          ${p.flavors ? `<div class="variant-block">
            <span class="variant-label">Sabores disponibles</span>
            <div class="flavors">${p.flavors.map(f => `<span class="flavor">${esc(f)}</span>`).join("")}</div>
          </div>` : ""}

          <div class="product-price" id="prod-price">${money(price)}</div>
          <div class="product-actions">
            <div class="qty">
              <button data-pq="-1" aria-label="Menos">−</button>
              <output id="pq">${state.pq}</output>
              <button data-pq="1" aria-label="Más">+</button>
            </div>
            <button class="btn btn-primary" data-add-prod="${p.id}">Agregar ${state.pq} al pedido</button>
          </div>
          <div class="meta">
            <div><strong>Categoría</strong>${esc(c.name)}</div>
            <div><strong>Pedidos</strong>${esc(MENU.phone)}</div>
            <div><strong>Extras</strong>Ingrediente +$10</div>
          </div>
          <p style="margin-top:20px"><button class="upload-link" data-upload="${p.id}">Cambiar foto de este producto</button></p>
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
    return `<div class="wrap" style="padding:80px 0"><h1>No encontrado</h1><p class="muted">Esa página no existe en el prototipo.</p><a class="btn btn-primary" href="#/">Volver al menú</a></div>`;
  }

  /* ---------------- Carrusel de promociones ---------------- */
  let carTimer = null;
  let carIndex = 0;
  let carPaused = false;
  let carShow = null;
  let carStart = null;

  function initCarousel() {
    clearInterval(carTimer);
    carTimer = null;
    carShow = null;
    carStart = null;

    const root = $("#hero-carousel");
    if (!root) return;
    const list = MENU.promos.filter(p => p.hero);
    const slides = $$(".car-slide", root);
    const dots = $$(".car-dot");
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

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    show(0);
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(carTimer);
    else carStart?.();
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
    else { html = notFound(); title = "No encontrado — COFFEE TIME"; }

    $("#main").innerHTML = html;
    document.title = title;
    $$(".main-nav a").forEach(a => {
      a.setAttribute("aria-current", a.getAttribute("href") === hash ? "page" : "false");
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    paintCart();
    initCarousel();
  }

  /* ---------------- Eventos ---------------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-add],[data-add-prod],[data-inc],[data-dec],[data-remove],[data-pq],[data-pv],[data-upload],[data-close-drawer],[data-noop],[data-preset],[data-car],[data-car-to],[data-car-pause],[data-clear-query]");
    if (!t) return;

    if (t.matches("[data-clear-query]")) {
      state.query = "";
      const input = $("#search");
      if (input) input.value = "";
      route();
      return;
    }

    if (t.matches("[data-car]")) { carShow?.(carIndex + (t.dataset.car === "next" ? 1 : -1)); return; }
    if (t.matches("[data-car-to]")) { carShow?.(Number(t.dataset.carTo)); return; }
    if (t.matches("[data-car-pause]")) {
      carPaused = !carPaused;
      t.setAttribute("aria-pressed", String(carPaused));
      t.setAttribute("aria-label", carPaused ? "Reanudar el cambio automático" : "Pausar el cambio automático");
      t.textContent = carPaused ? "▶" : "❙❙";
      if (carPaused) clearInterval(carTimer); else carStart?.();
      return;
    }

    if (t.matches("[data-add]")) { addToCart(t.dataset.add); return; }
    if (t.matches("[data-add-prod]")) {
      const p = byId[t.dataset.addProd];
      addToCart(p.id, state.pq, p.variants ? state.pv : null);
      return;
    }
    if (t.matches("[data-inc]")) { const r = state.cart.find(i => rowKey(i) === t.dataset.inc); setQty(t.dataset.inc, r.qty + 1); return; }
    if (t.matches("[data-dec]")) { const r = state.cart.find(i => rowKey(i) === t.dataset.dec); setQty(t.dataset.dec, r.qty - 1); return; }
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
      if (btn) btn.textContent = `Agregar ${state.pq} al pedido`;
      return;
    }

    if (t.matches("[data-upload]")) { pickImage(t.dataset.upload); return; }
    if (t.matches("[data-close-drawer]")) { closeDrawers(); return; }
    if (t.matches("[data-noop]")) { e.preventDefault(); toast("Enlace de demostración"); return; }

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

  /* ---------------- Imágenes ---------------- */
  let picker;
  function pickImage(id) {
    picker?.remove();
    picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.hidden = true;
    document.body.appendChild(picker);
    picker.addEventListener("change", () => {
      const file = picker.files?.[0];
      if (!file) return;
      const fr = new FileReader();
      fr.onload = () => {
        state.images[id] = fr.result;
        write(LS.img, state.images);
        route();
        toast("Imagen actualizada");
      };
      fr.readAsDataURL(file);
    });
    picker.click();
  }

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
  buildPresets();
  applyTheme();
  paintCart();
  window.addEventListener("hashchange", route);
  route();
})();
