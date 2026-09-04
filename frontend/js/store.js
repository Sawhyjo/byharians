/**
 * BYHARIANS STATE MANAGEMENT ENGINE (ECO-STORE)
 */
const INITIAL_PRODUCTS = [
  {
    id: 'byh-pad-day-reg',
    name: 'BYHARIANS Ultra-Thin Bamboo Day Pads',
    category: 'pads',
    categoryName: 'Organic Sanitary Pads',
    subType: 'Regular / Day (240mm)',
    price: 39000,
    originalPrice: 49000,
    flowLevel: 3,
    flowText: 'Medium Flow (Level 3/5)',
    lengthMm: '240mm with Flexible Wings',
    absorbencyMl: '80ml (3x standard pad absorbency)',
    badge: '',
    image: 'assets/images/product_day_pads.jpg',
    shortDesc: 'Ultra-thin, cooling day pads with high-absorbency banana pseudostem cellulose & kenaf fibers.',
    description: 'Designed for all-day comfort, EKAPADS biodegradable organic pads combine a banana pseudostem cellulose core and a kenaf fiber distribution layer. Wrapped in eco-friendly decomposition starter pouches, 100% biodegradable, 0% microplastics, 0% chlorine, and hypoallergenic.',
    packOptions: [
      { name: '10-Pcs Regular', count: 10, multiplier: 1 },
      { name: '24-Pcs Duo Pack', count: 24, multiplier: 2.02 },
      { name: '48-Pcs 3-Month Supply', count: 48, multiplier: 3.82 }
    ],
    composition: ['Banana Pseudostem Cellulose Core', 'Kenaf Fiber Distribution Layer (ADL)', 'Breathable Natural Fiber Top Sheet', 'Decomposition Starter Pouch'],
    stock: 145,
    isEcoCertified: true
  },
  {
    id: 'byh-pad-night-heavy',
    name: 'BYHARIANS Overnight Super Heavy Flow Pads',
    category: 'pads',
    categoryName: 'Organic Sanitary Pads',
    subType: 'Night / Heavy (330mm)',
    price: 45000,
    originalPrice: 58000,
    flowLevel: 5,
    flowText: 'Heavy Flow / Night (Level 5/5)',
    lengthMm: '330mm Extra-Wide Rear Wings',
    absorbencyMl: '160ml (5x standard absorbency)',
    badge: '',
    image: 'assets/images/product_night_pads.jpg',
    shortDesc: '330mm extra-wide protection for 12 hours of leak-free, itch-free sleep.',
    description: 'Overnight protection with Dual Anti-Leak Barrier technology and 160ml absorbency. Breathable bamboo top sheet keeps intimate skin dry and irritation-free all night.',
    packOptions: [
      { name: '8-Pcs Overnight Heavy', count: 8, multiplier: 1 },
      { name: '16-Pcs Night Duo Pack', count: 16, multiplier: 1.95 },
      { name: '32-Pcs 3-Month Supply', count: 32, multiplier: 3.7 }
    ],
    composition: ['Natural Bamboo Fiber', '330mm Extra-Wide Rear Wings', 'Plastic-Free Cornstarch Membrane', 'Recyclable Paper Wrapper'],
    stock: 98,
    isEcoCertified: true
  },
  {
    id: 'byh-liner-daily',
    name: 'BYHARIANS Ultra-Breathable Panty Liners',
    category: 'liners',
    categoryName: 'Organic Panty Liners',
    subType: 'Daily Care (155mm)',
    price: 32000,
    originalPrice: 39000,
    flowLevel: 1,
    flowText: 'Daily Care / Spotting (Level 1/5)',
    lengthMm: '155mm Ultra-Thin Breathable',
    absorbencyMl: '25ml (Ultra Comfort)',
    badge: '',
    image: 'assets/images/product_panty_liners.jpg',
    shortDesc: 'Ultra-thin breathable panty liners from organic bamboo for daily freshness and end-of-period days.',
    description: 'Feels like wearing nothing. These ultra-thin liners keep you feeling fresh all day without clogging sensitive skin pores.',
    packOptions: [
      { name: '20-Pcs Daily Liners', count: 20, multiplier: 1 },
      { name: '40-Pcs Double Pack', count: 40, multiplier: 1.9 }
    ],
    composition: ['100% Bamboo Top Sheet', 'Breathable Non-GMO Film', 'Natural Tree Resin Glue'],
    stock: 210,
    isEcoCertified: true
  },
  {
    id: 'byh-kit-first-period',
    name: 'BYHARIANS First Period Starter Box',
    category: 'kits',
    categoryName: 'Menstrual Care Kits',
    subType: 'Teen & Starter Kit',
    price: 149000,
    originalPrice: 189000,
    flowLevel: 4,
    flowText: 'Complete All-Flow Suite',
    lengthMm: 'Mixed Pack 240mm + 330mm',
    absorbencyMl: 'Complete Day & Night Protection',
    badge: '',
    image: 'assets/images/product_first_period_kit.jpg',
    shortDesc: 'Comprehensive starter care box to welcome first periods with confidence, featuring cycle guidebooks & herbal relief.',
    description: 'Complete starter kit containing 1x Day Pads, 1x Night Pads, 1x Panty Liners, Organic Drawstring Bag, Herbal Warm Patches, and Educational Cycle Guidebook.',
    packOptions: [
      { name: 'Complete Starter Box', count: 1, multiplier: 1 }
    ],
    composition: ['Complete Organic Pad Suite', 'Cramp Relief Herbal Tea', 'Natural Ginger Heating Patch', 'Cycle Literacy Guidebook'],
    stock: 64,
    isEcoCertified: true
  },
  {
    id: 'byh-kit-menstrual-ritual',
    name: 'BYHARIANS Ultimate Menstrual Ritual Box',
    category: 'kits',
    categoryName: 'Menstrual Care Kits',
    subType: 'Self-Care Wellness Ritual',
    price: 199000,
    originalPrice: 249000,
    flowLevel: 4,
    flowText: 'Complete Wellness Ritual',
    lengthMm: 'Full Cycle Suite',
    absorbencyMl: '1 Full Month Supply',
    badge: '',
    image: 'assets/images/product_menstrual_kit.jpg',
    shortDesc: 'Luxury monthly ritual box containing full organic pad supply, aromatherapy herbal tea, and natural pH 4.5 wash.',
    description: 'Transform period days into a natural recovery ritual. Contains full bamboo pad supply for day & night, PMS tea blend, and natural chamomile intimate cleanser.',
    packOptions: [
      { name: '1 Month Full Ritual Box', count: 1, multiplier: 1 }
    ],
    composition: ['Day & Night Bamboo Pads', 'Daily Panty Liners', 'Chamomile & Lavender Herbal Tea', 'Organic pH 4.5 Cleanser'],
    stock: 52,
    isEcoCertified: true
  }
];

const INITIAL_CUSTOMER_PACKAGES = [];
const INITIAL_CUSTOMER_GROCERIES = [];

const INITIAL_ECO_BASKETS = [
  {
    id: 'byh-basket-bamboo-duo',
    name: 'Monthly Organic Bamboo Pad Suite',
    itemsSummary: '1x Day Pads (24-Pcs), 1x Night Pads (16-Pcs)',
    monthlyPrice: 84000,
    badge: 'Best Seller',
    image: 'assets/images/product_day_pads.jpg',
    description: 'Full supply of ultra-thin organic day & night pads for 1 monthly cycle.'
  },
  {
    id: 'byh-basket-full-ritual',
    name: 'Menstrual Ritual & Wellness Suite',
    itemsSummary: '1x Day Pads, 1x Night Pads, 1x Panty Liners, Herbal Tea',
    monthlyPrice: 165000,
    badge: 'Complete Care',
    image: 'assets/images/product_menstrual_kit.jpg',
    description: 'Monthly self-care suite combining bamboo pads, panty liners, and PMS cramp relief tea.'
  },
  {
    id: 'byh-basket-daily-care',
    name: 'Daily Panty Liner Freshness Auto-Refill',
    itemsSummary: '2x Daily Panty Liners (40-Pcs)',
    monthlyPrice: 58000,
    badge: 'Daily Freshness',
    image: 'assets/images/product_panty_liners.jpg',
    description: 'Ultra-breathable panty liners from organic bamboo for daily freshness.'
  }
];

class StoreEngine {
  constructor() {
    this.products = INITIAL_PRODUCTS;
    this.ecoBaskets = INITIAL_ECO_BASKETS;
    this.customerPackages = INITIAL_CUSTOMER_PACKAGES;
    this.customerGroceries = INITIAL_CUSTOMER_GROCERIES;
    this.cart = [];
    this.orders = [];
    this.currency = 'IDR';
    this.currencySymbol = 'Rp ';
    this.exchangeRates = { IDR: 1, USD: 0.000063, SGD: 0.000085, MYR: 0.00028 };
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.currentView = 'home';

    this.userAccount = {
      name: 'Pelanggan BYHARIANS',
      email: 'pelanggan@byharians.id',
      phone: '0812-0000-0000',
      ecoPoints: 100,
      padsDiverted: 0,
      lastCycleDate: new Date().toISOString().split('T')[0],
      cycleLengthDays: 28,
      periodLengthDays: 5,
      activeSubscription: {
        productName: 'Organic Bamboo Pad Bundle',
        interval: 'Every 4 Weeks',
        nextDelivery: '2026-08-24',
        status: 'Active'
      }
    };

    this.adminRole = 'super_admin'; // 'super_admin' | 'warehouse_staff' | 'cs_support'

    this.storeSettings = {
      storeName: 'BYHARIANS Organic Store',
      originCity: 'Jakarta Selatan, DKI Jakarta',
      phone: '0812-8921-3401',
      email: 'care@byharians.id',
      bannerText: '🌿 Welcome to Eco-Friendly Periods | 15% Off Promo Code: ECOPERIOD',
      paymentGateways: {
        qris: true,
        bankTransfer: true,
        creditCard: true
      },
      couriers: {
        sicepat: true,
        jne: true,
        gojek: true
      }
    };

    this.promotions = [
      { id: 'PROM-101', code: 'ECOPERIOD', type: 'percentage', value: 15, minSpend: 50000, quota: 500, used: 142, expiry: '2026-12-31', status: 'active' },
      { id: 'PROM-102', code: 'ZEROPLASTIC', type: 'fixed', value: 20000, minSpend: 100000, quota: 200, used: 88, expiry: '2026-11-30', status: 'active' }
    ];

    this.coupons = [
      { code: 'ECOPERIOD', discountPercent: 15, description: '15% Off First Order' },
      { code: 'ZEROPLASTIC', discountPercent: 20, description: '20% Off Bundle' }
    ];
    this.appliedCoupon = null;

    this.loadState();
  }

  deductProductStockOnOrder(items) {
    if (!Array.isArray(items)) return;
    items.forEach(item => {
      const prod = this.products.find(p => p.id === item.id || p.name === item.name);
      if (prod && prod.stock !== undefined) {
        prod.stock = Math.max(0, prod.stock - (item.qty || item.quantity || 1));
      }
    });
    this.save();
    this.saveProductsToCloud();
  }

  loadState() {
    try {
      const savedAuth = localStorage.getItem('byharians_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        this.isLoggedIn = parsed.isLoggedIn || false;
        this.isAdmin = parsed.isAdmin || false;
        if (parsed.userAccount) this.userAccount = { ...this.userAccount, ...parsed.userAccount };
      }

      const savedProds = localStorage.getItem('byharians_products');
      if (savedProds) {
        try {
          const parsedProds = JSON.parse(savedProds);
          if (Array.isArray(parsedProds) && parsedProds.length > 0) {
            this.products = parsedProds.map(p => {
              delete p.rating;
              delete p.reviewsCount;
              if (p.badge === 'Paling Laris' || p.badge === 'Pilihan Aliran Deras' || p.badge === 'Hadiah Edukasi Terbaik' || p.badge === 'Paling Populer') {
                p.badge = '';
              }
              return p;
            });
          }
        } catch (e) {}
      }

      this.loadUserCartAndOrders();

      // Synchronize with Supabase Cloud Catalog across all accounts & devices
      setTimeout(() => {
        this.syncProductsFromCloud();
        this.initRealtimeCatalogSync();
      }, 50);
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }

  async syncProductsFromCloud() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      // 1. First check if dedicated 'products' table exists in Supabase
      try {
        const { data: directProds, error: prodErr } = await supabaseClient
          .from('products')
          .select('*')
          .order('id');

        if (!prodErr && Array.isArray(directProds) && directProds.length > 0) {
          console.log('✅ Loaded products from Supabase products table:', directProds.length);
          this.products = directProds.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku || '',
            category: p.category || 'pads',
            categoryName: p.category_name || p.categoryName || 'Organic Sanitary Pads',
            subType: p.subtype || p.subType || '',
            price: Number(p.price) || 0,
            originalPrice: p.original_price ? Number(p.original_price) : null,
            weightGrams: Number(p.weight_grams || p.weightGrams) || 150,
            stock: p.stock !== undefined ? Number(p.stock) : 100,
            badge: p.badge || '',
            image: p.image || 'assets/images/product_day_pads.jpg',
            shortDesc: p.short_desc || p.shortDesc || '',
            description: p.description || '',
            rating: p.rating || 5.0,
            reviewsCount: p.reviews_count || p.reviewsCount || 1,
            flowLevel: p.flow_level || p.flowLevel || 3,
            isEcoCertified: p.is_eco_certified !== undefined ? p.is_eco_certified : true
          }));
          try { localStorage.setItem('byharians_products', JSON.stringify(this.products)); } catch(e) {}
          this.triggerProductUIUpdates();
          return;
        }
      } catch (e) {}

      // 2. Cloud Catalog Sync via Supabase Global Record (works seamlessly out-of-the-box across all accounts & browsers)
      const { data: sharedRow, error: sharedErr } = await supabaseClient
        .from('orders')
        .select('items')
        .eq('id', 'BYH-GLOBAL-CATALOG')
        .maybeSingle();

      if (!sharedErr && sharedRow && Array.isArray(sharedRow.items) && sharedRow.items.length > 0) {
        console.log('✅ Loaded products from Supabase Shared Cloud Catalog:', sharedRow.items.length);
        this.products = sharedRow.items;
        try { localStorage.setItem('byharians_products', JSON.stringify(this.products)); } catch(e) {}
        this.triggerProductUIUpdates();
      } else if (!sharedRow || !sharedRow.items) {
        // Initial seed of cloud catalog if empty
        console.log('⚡ Initializing Supabase Shared Cloud Catalog with default products...');
        await this.saveProductsToCloud();
      }
    } catch (err) {
      console.warn('⚠️ syncProductsFromCloud notice:', err);
    }
  }

  async saveProductsToCloud() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      // 1. Try upserting to dedicated products table if present
      try {
        const payload = this.products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku || '',
          category: p.category || 'pads',
          category_name: p.categoryName || 'Organic Sanitary Pads',
          subtype: p.subType || '',
          price: p.price,
          original_price: p.originalPrice || null,
          weight_grams: p.weightGrams || 150,
          stock: p.stock !== undefined ? p.stock : 100,
          badge: p.badge || '',
          image: p.image || 'assets/images/product_day_pads.jpg',
          short_desc: p.shortDesc || '',
          description: p.description || ''
        }));
        await supabaseClient.from('products').upsert(payload);
      } catch(e) {}

      // 2. Sync to Supabase Shared Catalog (persists across all customer devices and accounts)
      const { error: sharedErr } = await supabaseClient
        .from('orders')
        .upsert({
          id: 'BYH-GLOBAL-CATALOG',
          customer_name: 'BYHARIANS CATALOG SYSTEM',
          customer_email: 'catalog-sync@byharians.id',
          items: this.products,
          total: 0,
          status: 'system'
        });

      if (sharedErr) {
        console.warn('⚠️ Supabase shared catalog save notice:', sharedErr);
      } else {
        console.log('✅ Supabase shared catalog saved and synchronized to cloud!');
      }
    } catch (err) {
      console.warn('⚠️ saveProductsToCloud exception:', err);
    }
  }

  initRealtimeCatalogSync() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    if (this._hasSubscribedToRealtimeCatalog) return;
    this._hasSubscribedToRealtimeCatalog = true;

    try {
      supabaseClient
        .channel('byh-live-catalog-sync')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: 'id=eq.BYH-GLOBAL-CATALOG'
        }, (payload) => {
          console.log('⚡ Realtime catalog update received from Admin:', payload);
          if (payload.new && Array.isArray(payload.new.items) && payload.new.items.length > 0) {
            this.products = payload.new.items;
            try { localStorage.setItem('byharians_products', JSON.stringify(this.products)); } catch(e) {}
            this.triggerProductUIUpdates();
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, async () => {
          console.log('⚡ Realtime products table change detected, refreshing...');
          await this.syncProductsFromCloud();
        })
        .subscribe((status) => {
          console.log('📡 Realtime Catalog Channel Status:', status);
        });
    } catch(err) {
      console.warn('Realtime catalog subscription notice:', err);
    }
  }

  triggerProductUIUpdates() {
    if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
    if (typeof renderAdminProductsTable === 'function') renderAdminProductsTable();
    if (typeof updateCartBadgeAndDrawer === 'function') updateCartBadgeAndDrawer();
    if (typeof renderGroceriesShowcase === 'function') renderGroceriesShowcase();
    if (this.currentView === 'cart' && typeof renderFullCartPage === 'function') renderFullCartPage();
    if (this.currentView === 'checkout' && typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
  }

  normalizeOrder(row) {
    if (!row) return null;
    if (row.id === 'BYH-GLOBAL-CATALOG' || row.status === 'system') return null;
    let parsedItems = [];
    if (typeof row.items === 'string') {
      try { parsedItems = JSON.parse(row.items); } catch(e) { parsedItems = []; }
    } else if (Array.isArray(row.items)) {
      parsedItems = row.items;
    } else if (row.items) {
      parsedItems = [row.items];
    }

    const rawEmail = row.customer_email || row.customer?.email || row.user_email || '';
    const rawName = row.customer_name || row.customer?.name || row.user_name || 'Pelanggan BYHARIANS';
    const rawPhone = row.customer_phone || row.customer?.phone || '';
    const rawAddress = row.shipping_address || row.customer?.city || 'Jakarta, Indonesia';

    return {
      id: row.id || row.order_id || `BYH-${row.id_num || '89421'}`,
      date: row.created_at ? row.created_at.split('T')[0] : (row.date || new Date().toISOString().split('T')[0]),
      customer: {
        name: rawName,
        email: rawEmail.toLowerCase().trim(),
        phone: rawPhone,
        city: rawAddress
      },
      items: parsedItems,
      total: Number(row.total_price || row.total || 0),
      paymentMethod: (row.payment_method || row.paymentMethod || 'QRIS').toUpperCase(),
      status: row.status || 'processing',
      trackingNumber: row.tracking_number || row.trackingNumber || `SIC-ECO-${row.id || 'LIVE'}`,
      courier: row.courier || 'SiCepat BEST Eco-Fleet'
    };
  }

  normalizeRefill(row) {
    if (!row) return null;
    return {
      id: row.id || `REFILL-${Date.now()}`,
      customerName: row.customer_name || row.customerName || 'BYHARIANS Customer',
      customerEmail: (row.customer_email || row.customerEmail || '').toLowerCase().trim(),
      phone: row.phone || '',
      basketName: row.basket_name || row.basketName || 'Organic Auto-Refill Bundle',
      itemsSummary: row.items_summary || row.itemsSummary || 'Organic Bamboo Pads',
      monthlyPrice: Number(row.monthly_price || row.monthlyPrice || 0),
      frequency: row.frequency || 'Every 4 Weeks',
      nextRefillDate: row.next_refill_date || row.nextRefillDate || new Date().toISOString().split('T')[0],
      courier: row.courier || 'SiCepat BEST Eco-Fleet',
      shippingAddress: row.shipping_address || row.shippingAddress || 'Jakarta, Indonesia',
      status: row.status || 'active',
      statusText: row.status_text || row.statusText || 'Auto-Refill ON',
      lastRefillDate: row.last_refill_date || row.lastRefillDate || new Date().toISOString().split('T')[0]
    };
  }

  normalizePackage(row) {
    if (!row) return null;
    return {
      id: row.id || `PKG-${Date.now()}`,
      customerName: row.customer_name || row.customerName || 'BYHARIANS Customer',
      customerEmail: (row.customer_email || row.customerEmail || '').toLowerCase().trim(),
      phone: row.phone || '',
      packageName: row.package_name || row.packageName || 'Organic Bamboo Pad Bundle',
      itemsSummary: row.items_summary || row.itemsSummary || '1x Day Pads, 1x Night Pads',
      frequency: row.frequency || 'Every 4 Weeks',
      nextDeliveryDate: row.next_delivery_date || row.nextDeliveryDate || new Date().toISOString().split('T')[0],
      courier: row.courier || 'SiCepat BEST Eco-Fleet',
      trackingNumber: row.tracking_number || row.trackingNumber || `SIC-ECO-${row.id || 'LIVE'}`,
      shippingAddress: row.shipping_address || row.shippingAddress || 'Jakarta, Indonesia',
      status: row.status || 'active',
      statusText: row.status_text || row.statusText || 'Active / Subscribed',
      lastDispatched: row.last_dispatched || row.lastDispatched || new Date().toISOString().split('T')[0]
    };
  }

  getGlobalOrders() {
    try {
      const saved = localStorage.getItem('byharians_global_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveGlobalOrder(order) {
    try {
      const allOrders = this.getGlobalOrders();
      const existingIdx = allOrders.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        allOrders[existingIdx] = { ...allOrders[existingIdx], ...order };
      } else {
        allOrders.unshift(order);
      }
      localStorage.setItem('byharians_global_orders', JSON.stringify(allOrders));
    } catch (e) {
      console.warn('Failed to save global order:', e);
    }
  }

  updateOrderStatusInStorage(orderId, newStatus, trackingNum) {
    try {
      // 1. Update in Global Master Registry
      const allGlobal = this.getGlobalOrders();
      const targetG = allGlobal.find(o => o.id === orderId);
      if (targetG) {
        targetG.status = newStatus;
        if (trackingNum) targetG.trackingNumber = trackingNum;
        localStorage.setItem('byharians_global_orders', JSON.stringify(allGlobal));
      }

      // 2. Update in current store.orders
      const targetCur = (this.orders || []).find(o => o.id === orderId);
      if (targetCur) {
        targetCur.status = newStatus;
        if (trackingNum) targetCur.trackingNumber = trackingNum;
      }

      // 3. Update in customer's scoped orders key if email exists
      const targetEmail = targetG?.customer?.email || targetCur?.customer?.email;
      if (targetEmail) {
        const emailKey = targetEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const userOrderKey = `byharians_orders_${emailKey}`;
        const savedUserOrders = localStorage.getItem(userOrderKey);
        if (savedUserOrders) {
          const parsed = JSON.parse(savedUserOrders);
          const userOrder = parsed.find(o => o.id === orderId);
          if (userOrder) {
            userOrder.status = newStatus;
            if (trackingNum) userOrder.trackingNumber = trackingNum;
            localStorage.setItem(userOrderKey, JSON.stringify(parsed));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to update order status in storage:', err);
    }
  }

  loadUserCartAndOrders() {
    try {
      const emailKey = (this.isLoggedIn && this.userAccount?.email)
        ? this.userAccount.email.toLowerCase().replace(/[^a-z0-9]/g, '_')
        : 'guest';

      const cartKey = `byharians_cart_${emailKey}`;
      const savedCart = localStorage.getItem(cartKey);
      this.cart = savedCart ? JSON.parse(savedCart) : [];

      if (this.isAdmin) {
        // Admin sees all customer orders globally!
        this.orders = this.getGlobalOrders();
      } else {
        const orderKey = `byharians_orders_${emailKey}`;
        const savedOrders = localStorage.getItem(orderKey);
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];
      }

      // Fetch user-scoped cart from Supabase DB asynchronously if logged in
      if (this.isLoggedIn && this.userAccount?.email) {
        this.fetchCartFromSupabase();
      }
    } catch (err) {
      console.warn('Failed to load user cart & orders:', err);
      this.cart = [];
      this.orders = [];
    }
  }

  async fetchCartFromSupabase() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient && this.isLoggedIn && this.userAccount?.email) {
      try {
        const userEmail = this.userAccount.email.toLowerCase().trim();
        const { data, error } = await supabaseClient
          .from('user_carts')
          .select('cart_items')
          .eq('email', userEmail)
          .maybeSingle();

        if (!error && data && Array.isArray(data.cart_items)) {
          this.cart = data.cart_items;
          const emailKey = userEmail.replace(/[^a-z0-9]/g, '_');
          localStorage.setItem(`byharians_cart_${emailKey}`, JSON.stringify(this.cart));
          if (typeof updateCartBadgeAndDrawer === 'function') updateCartBadgeAndDrawer();
        }
      } catch (err) {
        console.warn('Supabase user cart fetch notice:', err);
      }
    }
  }

  async syncCartToSupabase() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient && this.isLoggedIn && this.userAccount?.email) {
      try {
        const userEmail = this.userAccount.email.toLowerCase().trim();
        await supabaseClient.from('user_carts').upsert({
          email: userEmail,
          cart_items: this.cart,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase user cart sync notice:', err);
      }
    }
  }

  save() {
    try {
      const emailKey = (this.isLoggedIn && this.userAccount?.email)
        ? this.userAccount.email.toLowerCase().replace(/[^a-z0-9]/g, '_')
        : 'guest';

      const cartKey = `byharians_cart_${emailKey}`;
      localStorage.setItem(cartKey, JSON.stringify(this.cart));

      const orderKey = `byharians_orders_${emailKey}`;
      localStorage.setItem(orderKey, JSON.stringify(this.orders));

      localStorage.setItem('byharians_products', JSON.stringify(this.products));

      localStorage.setItem('byharians_user', JSON.stringify({
        isLoggedIn: this.isLoggedIn,
        isAdmin: this.isAdmin,
        userAccount: this.userAccount
      }));

      // Sync user cart to Supabase DB
      this.syncCartToSupabase();
    } catch (err) {
      console.warn('Failed to save state:', err);
    }
  }

  formatPrice(priceIdr) {
    if (this.currency === 'IDR') {
      return `Rp ${Math.round(priceIdr).toLocaleString('id-ID')}`;
    }
    const rate = this.exchangeRates[this.currency] || 1;
    const converted = priceIdr * rate;
    const syms = { USD: '$', SGD: 'S$', MYR: 'RM ' };
    return `${syms[this.currency] || ''}${converted.toFixed(2)}`;
  }
}

const store = new StoreEngine();
