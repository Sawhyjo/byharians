/**
 * BYHARIANS STATE MANAGEMENT ENGINE (ECO-STORE)
 */
const INITIAL_PRODUCTS = [
  {
    id: 'byh-pad-day-reg',
    name: 'BYHARIANS Ultra-Thin Bamboo Day Pads',
    category: 'pads',
    categoryName: 'Pembalut Wanita Organik',
    subType: 'Regular / Day (240mm)',
    price: 39000,
    originalPrice: 49000,
    rating: 4.9,
    reviewsCount: 342,
    flowLevel: 3,
    flowText: 'Aliran Sedang (Level 3/5)',
    lengthMm: '240mm dengan Sayap Fleksibel',
    absorbencyMl: '80ml (3x daya serap pembalut biasa)',
    badge: 'Paling Laris',
    image: 'assets/images/product_day_pads.jpg',
    shortDesc: 'Pembalut siang ultra-tipis, sejuk, dan selembut sutra dari 100% serat bambu organik dengan inti selulosa tumbuhan alami.',
    description: 'Didesain untuk kenyamanan seharian, pembalut organik biodegradable ini memberikan kelembutan alami serat bambu dengan lapisan anti-bocor nabati. Terurai 100% dalam 180 hari, 0% mikroplastik, 0% klorin, bebas pewangi sintetis, dan hipoalergenik.',
    packOptions: [
      { name: '10-Pcs Regular', count: 10, multiplier: 1 },
      { name: '24-Pcs Hemat Duo', count: 24, multiplier: 2.02 },
      { name: '48-Pcs Stok 3 Bulan', count: 48, multiplier: 3.82 }
    ],
    composition: ['100% Lapisan Atas Bambu Organik Bersertifikat', 'Inti Penyerap Kayu Pinus Alami & Gel Nabati', 'Lapisan Bawah Jagung Non-GMO Berpori', 'Bungkus Nabati Biodegradable & Perekat Aman'],
    stock: 145,
    isEcoCertified: true
  },
  {
    id: 'byh-pad-night-heavy',
    name: 'BYHARIANS Overnight Super Heavy Flow Pads',
    category: 'pads',
    categoryName: 'Pembalut Wanita Organik',
    subType: 'Night / Heavy (330mm)',
    price: 45000,
    originalPrice: 58000,
    rating: 5.0,
    reviewsCount: 512,
    flowLevel: 5,
    flowText: 'Aliran Deras / Malam (Level 5/5)',
    lengthMm: '330mm Sayap Belakang Ekstra Lebar',
    absorbencyMl: '160ml (5x daya serap standar)',
    badge: 'Pilihan Aliran Deras',
    image: 'assets/images/product_night_pads.jpg',
    shortDesc: 'Proteksi ekstra lebar 330mm untuk tidur nyenyak 12 jam tanpa bocor dan bebas rasa gatal.',
    description: 'Pelindung malam terbaik dengan teknologi Dual Anti-Leak Barrier dan daya serap 160ml. Lapisan atas bambu berpori menjaga area intim tetap kering dan bebas iritasi sepanjang malam.',
    packOptions: [
      { name: '8-Pcs Overnight Heavy', count: 8, multiplier: 1 },
      { name: '16-Pcs Night Duo Pack', count: 16, multiplier: 1.95 },
      { name: '32-Pcs Stok 3 Bulan', count: 32, multiplier: 3.7 }
    ],
    composition: ['100% Serat Bambu Organik Alami', 'Sayap Belakang Ekstra Lebar 330mm', 'Membran Jagung Nabati Bebas Plastik', 'Bungkus Kertas Daur Ulang'],
    stock: 98,
    isEcoCertified: true
  },
  {
    id: 'byh-liner-daily',
    name: 'BYHARIANS Ultra-Breathable Panty Liners',
    category: 'liners',
    categoryName: 'Panty Liner Organik',
    subType: 'Daily Care (155mm)',
    price: 32000,
    originalPrice: 39000,
    rating: 4.8,
    reviewsCount: 218,
    flowLevel: 1,
    flowText: 'Perawatan Harian / Keputihan (Level 1/5)',
    lengthMm: '155mm Tipis Berpori',
    absorbencyMl: '25ml (Sangat Nyaman)',
    badge: 'Perawatan Harian',
    image: 'assets/images/product_panty_liners.jpg',
    shortDesc: 'Panty liner tipis berpori dari bambu organik untuk kesegaran harian, keputihan, dan hari-hari akhir haid.',
    description: 'Terasa seperti tidak menggunakan apa-apa. Panty liner ultra-tipis ini dirancang untuk menjaga kesegaran harian Anda tanpa menyumbat pori-pori kulit sensitif.',
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
    categoryName: 'Ritual Menstrual Kit',
    subType: 'Starter Kit Remaja & Pemula',
    price: 149000,
    originalPrice: 189000,
    rating: 5.0,
    reviewsCount: 189,
    flowLevel: 4,
    flowText: 'Lengkap Semua Aliran',
    lengthMm: 'Paket Campuran 240mm + 330mm',
    absorbencyMl: 'Lengkap Siang & Malam',
    badge: 'Hadiah Edukasi Terbaik',
    image: 'assets/images/product_first_period_kit.jpg',
    shortDesc: 'Kotak perawatan lengkap untuk menyambut haid pertama tanpa rasa cemas, dilengkapi buku panduan edukasi & perawatan herbal.',
    description: 'Starter kit komprehensif berisi 1x Day Pads, 1x Night Pads, 1x Panty Liners, Kantong Organik Serut, Koyo Hangat Herbal, dan Buku Panduan Siklus Edukasi.',
    packOptions: [
      { name: 'Starter Box Lengkap', count: 1, multiplier: 1 }
    ],
    composition: ['Koleksi Lengkap Pembalut Bambu', 'Teh Herbal Pereda Kram', 'Koyo Jahe Alami', 'Panduan Edukasi'],
    stock: 64,
    isEcoCertified: true
  },
  {
    id: 'byh-kit-menstrual-ritual',
    name: 'BYHARIANS Ultimate Menstrual Ritual Box',
    category: 'kits',
    categoryName: 'Ritual Menstrual Kit',
    subType: 'Self-Care Wellness Ritual',
    price: 199000,
    originalPrice: 249000,
    rating: 4.9,
    reviewsCount: 276,
    flowLevel: 4,
    flowText: 'Ritual Perawatan Lengkap',
    lengthMm: 'Full Cycle Suite',
    absorbencyMl: 'Kebutuhan 1 Bulan Penuh',
    badge: 'Paling Populer',
    image: 'assets/images/product_menstrual_kit.jpg',
    shortDesc: 'Kotak ritual bulanan mewah berisi pasokan pembalut organik lengkap, teh herbal aromaterapi, dan pencuci kewanitaan alami pH 4.5.',
    description: 'Ubah hari haid Anda dari ketidaknyamanan menjadi ritual pemulihan alami. Berisi paket lengkap pembalut organik bambu siang & malam, teh herbal pereda PMS, dan sabun pembersih kewanitaan chamomile alami.',
    packOptions: [
      { name: '1 Month Full Ritual Box', count: 1, multiplier: 1 }
    ],
    composition: ['Pembalut Bambu Siang & Malam', 'Panty Liners Harian', 'Teh Herbal Chamomile & Lavender', 'Sabun Organik pH 4.5'],
    stock: 52,
    isEcoCertified: true
  }
];

const INITIAL_CUSTOMER_PACKAGES = [];
const INITIAL_CUSTOMER_GROCERIES = [];

class StoreEngine {
  constructor() {
    this.products = INITIAL_PRODUCTS;
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
        productName: 'Paket Pembalut Organik Bambu',
        interval: 'Setiap 4 Minggu',
        nextDelivery: '2026-08-24',
        status: 'Aktif'
      }
    };

    this.coupons = [
      { code: 'ECOPERIOD', discountPercent: 15, description: '15% Off First Order' },
      { code: 'ZEROPLASTIC', discountPercent: 20, description: '20% Off Bundle' }
    ];
    this.appliedCoupon = null;

    this.loadState();
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
      this.loadUserCartAndOrders();
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }

  normalizeOrder(row) {
    if (!row) return null;
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
    } catch (err) {
      console.warn('Failed to load user cart & orders:', err);
      this.cart = [];
      this.orders = [];
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

      localStorage.setItem('byharians_user', JSON.stringify({
        isLoggedIn: this.isLoggedIn,
        isAdmin: this.isAdmin,
        userAccount: this.userAccount
      }));
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
