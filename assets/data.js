/* ! COFFEE TIME — datos del menú. Edita aquí para cambiar categorías, productos, precios y promos. */
window.MENU = {
  brand: "COFFEE TIME",
  phone: "55 6692 2796",
  whatsapp: "https://wa.me/525566922796",
  hero: {
    title: "Tu café,<br>tu <em>antojo</em>.",
    text: "Bebidas calientes y frías, crepas, sándwiches y postres. Precios claros, porciones generosas y promociones todos los días.",
    stamp: "Pedidos por WhatsApp · 55 6692 2796",
    image: "assets/img/hero.svg"
  },

  /* ! Reemplaza estos datos por los reales de la sucursal. */
  contact: {
    address: "Av. San Luis Tlatilco, 53580.",
    city: "Naucalpan de Juárez, Méx",
    hours: [
      ["Lunes a sábado", "9:00 – 20:00"],
      ["Domingo", "cerrado"]
    ],
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    maps: "https://maps.google.com/?q=COFFEE+TIME"
  },

  /* CONFIG Mesas del local. El cliente elige una al confirmar el pedido. */
  tables: ["Mesa 1", "Mesa 2"],

  /* TODO Agregar contraseña del WiFi cuando esté definida; mientras esté vacía, el letrero se muestra pendiente. */
  qr: {
    base: "https://phylossopho.github.io/coffee-time/",
    wifi: { ssid: "COFFEE TIME", password: "", security: "WPA" }
  },

  /* CONFIG Categorías principales del menú */
  categories: [
    { id: "calientes", name: "Bebidas calientes", icon: "cup",      blurb: "Café, chocolate, tisanas y especialidades." },
    { id: "frias",     name: "Bebidas frías",     icon: "iced",     blurb: "Sodas, smoothies, frappés, malteadas y shakers." },
    { id: "crepas",    name: "Crepas",            icon: "crepe",    blurb: "Arma la tuya: dulce, de fruta o salada, con los ingredientes que tú elijas." },
    { id: "comida",    name: "Comida y otros",    icon: "food",     blurb: "Sándwich, chapata, molletes, ensalada y otros antojos." },
    { id: "extras",    name: "Extras",            icon: "beans",    blurb: "Para personalizar tu bebida o tu crepa." }
  ],

  /* CONFIG Personalización de productos (crepas, bebidas y sabores)
     kind: "crepa"   → modal con ingredientes mezclables y precio por cantidad.
     kind: "bebida"  → modal con sabor, tamaño/formato y extras.
     kind: "sabor"   → modal solo para elegir sabor (croissant, por ejemplo).
     Sin kind: se agrega directo al carrito. */
  customize: {
    crepa: {
      base: 60,        /* 1 ingrediente */
      extra: 10,       /* cada ingrediente adicional */
      promoAt: 3,      /* a partir de 3 ingredientes */
      promoPrice: 70,  /* 3 ingredientes por $70 */
      groups: [
        { name: "Dulce", items: ["Cajeta", "Nutella", "Lechera", "Mermelada de zarzamora", "Galleta de chocolate", "Mazapán", "Chocolate semiamargo", "Chocolate con leche", "Chocolate"] },
        { name: "Fruta", items: ["Fresa", "Nuez", "Plátano", "Durazno"] },
        { name: "Salada", items: ["Jamón", "Pepperoni", "Queso crema", "Queso manchego"] }
      ]
    },
    addons: [
      { id: "perlas", name: "Perlas explosivas", price: 15, cats: ["frias"] },
      { id: "jarabe", name: "Jarabe 1 oz", price: 15, cats: ["calientes", "frias"],
        options: ["Crema irlandesa", "Amaretto", "Avellana", "Vainilla", "Caramelo", "Cajeta"] },
      { id: "portavaso", name: "Portavaso", price: 5, cats: ["calientes", "frias"] }
    ]
  },

  products: [
    /* ---------------- Bebidas calientes ---------------- */
    { id: "capuccino", cat: "calientes", kind: "bebida", name: "Capuccino", icon: "cup", tag: "",
      desc: "Espresso, leche vaporizada y espuma cremosa.",
      photo: "assets/img/productos/capuccino.webp",
      variants: [["Taza chica", 43], ["Taza grande", 50], ["Vaso chico", 40], ["Vaso grande", 50]] },
    { id: "latte", cat: "calientes", kind: "bebida", name: "Latte", icon: "cup", tag: "favorito",
      desc: "Espresso con leche vaporizada y una capa fina de espuma.",
      photo: "assets/img/productos/latte.webp",
      variants: [["Taza chica", 45], ["Taza grande", 50], ["Vaso chico", 45], ["Vaso grande", 55]] },
    { id: "americano", cat: "calientes", kind: "bebida", name: "Americano", icon: "cup", tag: "",
      desc: "Espresso alargado con agua caliente.",
      photo: "assets/img/productos/americano.webp",
      variants: [["Taza chica", 30], ["Taza grande", 40], ["Vaso chico", 30], ["Vaso grande", 35]] },
    { id: "mokachino", cat: "calientes", kind: "bebida", name: "Mokachino", icon: "cup", tag: "",
      desc: "Espresso, cacao y leche. Dulzor equilibrado.",
      photo: "assets/img/productos/mokachino.webp",
      variants: [["Taza chica", 45], ["Taza grande", 50], ["Vaso chico", 45], ["Vaso grande", 50]] },
    { id: "espresso", cat: "calientes", kind: "bebida", name: "Espresso", icon: "cup", tag: "",
      desc: "Café concentrado de cuerpo intenso.",
      photo: "assets/img/productos/espresso.webp",
      variants: [["Sencillo", 28], ["Doble", 33]] },
    { id: "cortado", cat: "calientes", kind: "bebida", name: "Cortado", icon: "cup", tag: "",
      desc: "Espresso cortado con un chorro de leche.",
      photo: "assets/img/productos/cortado.webp",
      variants: [["Sencillo", 38], ["Doble", 43]] },
    { id: "chocolate", cat: "calientes", kind: "bebida", name: "Chocolate", icon: "cup", tag: "sin café",
      desc: "Cacao caliente con textura cremosa.",
      photo: "assets/img/productos/chocolate.webp",
      variants: [["Taza chica", 50], ["Taza grande", 55], ["Vaso chico", 50], ["Vaso grande", 60]] },
    { id: "tisanas", cat: "calientes", kind: "bebida", askFlavor: true, name: "Tisanas", icon: "tea", tag: "sin cafeína",
      desc: "Infusiones de la casa, servidas calientes.",
      photo: "assets/img/productos/tisanas.webp",
      variants: [["Taza chica", 45], ["Taza grande", 50], ["Vaso chico", 45], ["Vaso grande", 50]] },
    { id: "latte-chai", cat: "calientes", kind: "bebida", name: "Latte Chai", icon: "tea", tag: "",
      desc: "Té chai especiado con leche vaporizada.",
      photo: "assets/img/productos/latte-chai.webp",
      variants: [["Taza chica", 53], ["Taza grande", 60], ["Vaso chico", 55], ["Vaso grande", 65]] },
    { id: "matcha", cat: "calientes", kind: "bebida", name: "Matcha (té)", icon: "tea", tag: "",
      desc: "Matcha batido con leche caliente.",
      photo: "assets/img/productos/matcha.webp",
      variants: [["Taza chica", 38], ["Taza grande", 45], ["Vaso chico", 40], ["Vaso grande", 45]] },
    { id: "chai", cat: "calientes", kind: "bebida", name: "Chai (té)", icon: "tea", tag: "",
      desc: "Mezcla de especias con té negro y leche.",
      photo: "assets/img/productos/chai.webp",
      variants: [["Taza chica", 38], ["Taza grande", 45], ["Vaso chico", 40], ["Vaso grande", 45]] },
    { id: "taro", cat: "calientes", kind: "bebida", name: "Taro (té)", icon: "tea", tag: "",
      desc: "Té de taro con leche, suave y dulce.",
      photo: "assets/img/productos/taro.webp",
      variants: [["Taza chica", 38], ["Taza grande", 45], ["Vaso chico", 40], ["Vaso grande", 45]] },

    /* ---------------- Bebidas frías ---------------- */
    { id: "soda-italiana", cat: "frias", kind: "bebida", name: "Soda italiana con perlas explosivas", icon: "iced", tag: "nuevo",
      desc: "Agua mineral, jarabe y perlas explosivas. Se sirve en vaso de 12 oz.",
      photo: "assets/img/productos/soda-italiana.webp",
      variants: [["Vaso 12 oz", 55]],
      flavors: ["Mora azul", "Manzana verde", "Menta", "Coco", "Kiwi", "Grosella", "Frambuesa", "Frutos rojos"] },
    { id: "smoothie", cat: "frias", kind: "bebida", name: "Smoothie con pulpa de fruta", icon: "frappe", tag: "",
      desc: "Pulpa natural licuada con hielo. Se sirve en vaso de 12 oz.",
      photo: "assets/img/productos/smoothie.webp",
      variants: [["Vaso 12 oz", 55]],
      flavors: ["Fresa", "Mango", "Maracuyá"] },
    { id: "frappe-basico", cat: "frias", kind: "bebida", name: "Frappé básico", icon: "frappe", tag: "2x$100",
      desc: "Mezcla helada y cremosa. Se sirve en vaso de 12 oz.",
      photo: "assets/img/productos/frappe-basico.webp",
      variants: [["Vaso 12 oz", 55]],
      flavors: ["Galleta de chocolate", "Chai", "Matcha", "Taro", "Capuchino"] },
    { id: "frappe-especial", cat: "frias", kind: "bebida", name: "Frappé de especialidad", icon: "frappe", tag: "",
      desc: "Frappé con ingredientes de la casa. Se sirve en vaso de 12 oz.",
      photo: "assets/img/productos/frappe-especial.webp",
      variants: [["Vaso 12 oz", 65]],
      flavors: ["Cajeta", "Crema de avellana", "Horchata", "Moras", "Chocomenta", "Mazapán", "Fresa-kiwi", "Capuchino con galleta", "Tisanas", "Fresa-mango"] },
    { id: "malteada", cat: "frias", kind: "bebida", name: "Malteada", icon: "frappe", tag: "",
      desc: "Helado batido con leche. Se sirve en vaso de 12 oz.",
      photo: "assets/img/productos/malteada.webp",
      variants: [["Vaso 12 oz", 55]],
      flavors: ["Chocolate", "Chocofresa", "Galleta de chocolate"] },
    { id: "shaker-chai", cat: "frias", kind: "bebida", name: "Shaker Chai · Taro · Matcha", icon: "iced", tag: "",
      desc: "Batido en shaker, servido bien frío.",
      photo: "assets/img/productos/shaker-chai.webp",
      variants: [["Vaso chico", 60], ["Vaso grande", 70]],
      flavors: ["Chai", "Taro", "Matcha"] },
    { id: "shaker-americano", cat: "frias", kind: "bebida", name: "Shaker Americano", icon: "iced", tag: "",
      desc: "Espresso y hielo, agitado.",
      photo: "assets/img/productos/shaker-americano.webp",
      variants: [["Vaso chico", 40], ["Vaso grande", 45]] },
    { id: "shaker-capuchino", cat: "frias", kind: "bebida", name: "Shaker Capuchino", icon: "iced", tag: "",
      desc: "Capuchino frío batido con hielo.",
      photo: "assets/img/productos/shaker-capuchino.webp",
      variants: [["Vaso chico", 48], ["Vaso grande", 56]] },
    { id: "shaker-tisanas", cat: "frias", kind: "bebida", askFlavor: true, name: "Shaker Tisanas", icon: "iced", tag: "",
      desc: "Infusión fría agitada.",
      photo: "assets/img/productos/shaker-tisanas.webp",
      variants: [["Vaso chico", 53], ["Vaso grande", 58]] },
    { id: "shaker-latte", cat: "frias", kind: "bebida", name: "Shaker Latte", icon: "iced", tag: "",
      desc: "Latte frío con espuma aireada.",
      photo: "assets/img/productos/shaker-latte.webp",
      variants: [["Vaso chico", 50], ["Vaso grande", 60]] },
    { id: "shaker-mokachino", cat: "frias", kind: "bebida", name: "Shaker Mokachino", icon: "iced", tag: "",
      desc: "Mokachino frío batido.",
      photo: "assets/img/productos/shaker-mokachino.webp",
      variants: [["Vaso chico", 55], ["Vaso grande", 60]] },

    /* ---------------- Crepas ---------------- */
    /* Un solo producto: tú eliges los ingredientes dentro del modal. */
    { id: "arma-tu-crepa", cat: "crepas", kind: "crepa", name: "Arma tu crepa", icon: "crepe", tag: "Hecha al momento",
      desc: "Tibia, suavecita y con los bordes doraditos: elige dulce, fruta o salada y deja que el relleno se derrita dentro. Se prepara al momento, así que llega a la mesa con ese olor que ya te está antojando la primera mordida.",
      price: 60,
      photo: "assets/img/productos/arma-tu-crepa.webp",
      gallery: [
        "assets/img/productos/arma-tu-crepa-1.svg",
        "assets/img/productos/arma-tu-crepa-2.svg",
        "assets/img/productos/arma-tu-crepa-3.svg"
      ],
      flavors: ["Cajeta", "Nutella", "Lechera", "Mermelada de zarzamora", "Galleta de chocolate", "Mazapán", "Chocolate semiamargo", "Chocolate con leche", "Chocolate", "Fresa", "Nuez", "Plátano", "Durazno", "Jamón", "Pepperoni", "Queso crema", "Queso manchego"] },

    /* ---------------- Comida y otros ---------------- */
    { id: "sandwich", cat: "comida", name: "Sándwich", icon: "food", tag: "",
      desc: "Pan de caja tostado con jamón, queso y vegetales.", price: 60,
      photo: "assets/img/productos/sandwich.webp" },
    { id: "chapata", cat: "comida", name: "Chapata", icon: "food", tag: "",
      desc: "Pan chapata con jamón y queso manchego.", price: 60,
      photo: "assets/img/productos/chapata.webp" },
    { id: "molletes", cat: "comida", name: "Molletes", icon: "food", tag: "",
      desc: "Pan bolillo con frijoles y queso gratinado.",
      photo: "assets/img/productos/molletes.webp",
      variants: [["Sencillos", 55], ["Especialidad", 70]] },
    { id: "ensalada", cat: "comida", name: "Ensalada", icon: "salad", tag: "$100",
      desc: "Pechuga empanizada, lechuga, zanahoria, pepino, nuez, fresa, pasta y ajonjolí.", price: 100,
      photo: "assets/img/productos/ensalada.webp" },
    { id: "croissant-rol", cat: "comida", kind: "sabor", name: "Croissant rol", icon: "food", tag: "WhatsApp",
      desc: "Relleno de crema pastelera o crema de avellana. Solo por pedido.", price: 50,
      photo: "assets/img/productos/croissant-rol.webp",
      flavors: ["Crema pastelera", "Crema de avellana"] },

    /* ---------------- Extras ---------------- */
    { id: "extra-crepa", cat: "extras", name: "Ingrediente extra para crepa", icon: "crepe", tag: "",
      desc: "Agrega otro ingrediente a tu crepa.", price: 10,
      photo: "assets/img/productos/extra-crepa.webp" },
    { id: "perlas", cat: "extras", name: "Perlas explosivas", icon: "iced", tag: "",
      desc: "Topping para sodas, smoothies o frappés.", price: 15,
      photo: "assets/img/productos/perlas.webp" },
    { id: "jarabe", cat: "extras", name: "Jarabe 1 oz", icon: "cup", tag: "",
      desc: "Crema irlandesa, amaretto, avellana, vainilla, caramelo o cajeta.", price: 15,
      photo: "assets/img/productos/jarabe.webp" },
    { id: "portavaso", cat: "extras", name: "Portavaso", icon: "cup", tag: "",
      desc: "Portavaso reutilizable de la casa.", price: 5,
      photo: "assets/img/productos/portavaso.webp" }
  ],

  /* CONFIG Promociones activas */
  promos: [
    { id: "p1", title: "Capuchino grande + sándwich", price: 100,
      note: "Llévate un capuchino grande y un sándwich por solo $100.",
      includes: ["Capuchino grande", "Sándwich a elegir"],
      hero: true, productId: "capuccino", img: "assets/img/promociones/promo-1.webp", badge: "Combo" },
    { id: "p2", title: "Chapata de jamón y queso manchego", price: 100,
      note: "Incluye capuchino grande.",
      includes: ["Chapata de jamón y queso manchego", "Capuchino grande"],
      hero: true, productId: "chapata", img: "assets/img/promociones/promo-2.webp", badge: "Combo" },
    { id: "p3", title: "Crepa", price: 70,
      note: "3 ingredientes a tu elección.",
      includes: ["Crepa con 3 ingredientes a tu elección", "Dulce, de fruta o salada"],
      hero: true, productId: "arma-tu-crepa", img: "assets/img/promociones/promo-3.webp", badge: "Promo" },
    { id: "p4", title: "Smoothies con perlas explosivas", price: 100,
      note: "2 x $100 · Solo martes y jueves.",
      includes: ["2 smoothies con perlas explosivas", "Sabores a elegir"],
      productId: "smoothie", img: "assets/img/promociones/promo-4.webp", badge: "2 x $100" },
    { id: "p9", title: "Sodas italianas", price: 100,
      note: "2 x $100 · Manzana verde, coco, kiwi, menta, grosella, mora azul, frambuesa y frutos rojos.",
      includes: ["2 sodas italianas", "Sabores a elegir"],
      hero: true, productId: "soda-italiana", img: "assets/img/promociones/promo-9.webp", badge: "2 x $100" },
    { id: "p5", title: "Ensalada", price: 100,
      note: "Hoy cumple tu antojo. Pechuga empanizada, lechuga, zanahoria, pepino, nuez, fresa, pasta y ajonjolí.",
      productId: "ensalada", img: "assets/img/promociones/promo-5.webp", badge: "Del día" },
    { id: "p6", title: "Frappes básicos", price: 100,
      note: "2 x $100 · Solo lunes y viernes.",
      includes: ["2 frappes básicos", "Sabores a elegir"],
      productId: "frappe-basico", img: "assets/img/promociones/promo-6.webp", badge: "2 x $100" },
    { id: "p7", title: "Croissant rol", price: 50,
      note: "Crema pastelera o crema de avellana · Solo pedido por WhatsApp.",
      productId: "croissant-rol", img: "assets/img/promociones/promo-7.webp", badge: "WhatsApp" },
    { id: "p8", title: "Latte caliente grande", price: 46,
      note: "También moka frío grande por $60.",
      productId: "latte", img: "assets/img/promociones/promo-8.webp", badge: "Promo" }
  ]
};