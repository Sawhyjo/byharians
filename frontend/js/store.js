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
    shortDesc: 'Kotak edukasi lengkap untuk pengalaman haid pertama yang penuh percaya diri, sehat, dan ramah lingkungan.',
    description: 'Dirancang khusus untuk remaja dan pemula, kotak ritual ini berisi 10x Day Pads, 8x Night Pads, 10x Liners, Panduan Edukasi Haid Pertama, Pouch Kain Katun Organik, dan Kantong Pembuangan Biodegradable.',
    packOptions: [
      { name: 'Complete Starter Gift Box', count: 1, multiplier: 1 }
    ],
    composition: ['Assorted Organic Pads', 'Cotton Storage Pouch', 'First Period Handbook', 'Biodegradable Disposal Bags'],
    stock: 45,
    isEcoCertified: true
  },
  {
    id: 'byh-kit-luxe-ritual',
    name: 'BYHARIANS Ultimate Eco Ritual Care Box',
    category: 'kits',
    categoryName: 'Ritual Menstrual Kit',
    subType: 'Paket Langganan Mewah',
    price: 185000,
    originalPrice: 235000,
    rating: 5.0,
    reviewsCount: 304,
    flowLevel: 5,
    flowText: 'Lengkap Seluruh Siklus',
    lengthMm: 'Set Lengkap Siang + Malam + Liner + Wipes',
    absorbencyMl: 'Perawatan Total 30 Hari',
    badge: 'Pilihan Langganan Hemat',
    image: 'assets/images/product_menstrual_kit.jpg',
    shortDesc: 'Pengalaman perawatan haid mewah bulanan dengan pembalut organik, minyak aromaterapi lavender, dan wipes bambu.',
    description: 'Kotak perawatan bulanan yang memanjakan tubuh dan pikiran saat haid. Berisi paket lengkap pembalut siang & malam, wipes bambu basah, teh herbal pereda kram, dan botol kompres hangat mini.',
    packOptions: [
      { name: '1 Month Self-Care Box', count: 1, multiplier: 1 },
      { name: '3 Months VIP Subscription (Disc 15%)', count: 3, multiplier: 2.55 }
    ],
    composition: ['Full Organic Pad Supply', 'Organic Bamboo Wipes 20s', 'Cramp Relief Herbal Tea', 'Lavender Essential Oil Roll-On'],
    stock: 62,
    isEcoCertified: true
  },
  {
    id: 'byh-pad-maternity',
    name: 'BYHARIANS Postpartum & Maternity Organic Pads',
    category: 'pads',
    categoryName: 'Pembalut Nifas & Melahirkan',
    subType: 'Maternity Extra Long (410mm)',
    price: 52000,
    originalPrice: 65000,
    rating: 4.9,
    reviewsCount: 167,
    flowLevel: 5,
    flowText: 'Aliran Sangat Deras Nifas (Level 5/5)',
    lengthMm: '410mm Panjang Maksimal Nifas',
    absorbencyMl: '220ml (Daya Serap Nifas Ekstra)',
    badge: 'Khusus Ibu Nifas',
    image: 'assets/images/product_maternity_pads.jpg',
    shortDesc: 'Pembalut nifas lembut selembut awan dari bambu organik tanpa kimia berbahaya untuk kenyamanan ibu pasca melahirkan.',
    description: 'Didesain khusus untuk masa nifas pasca persalinan. Panjang 410mm dengan bantalan bambu organik empuk yang memberikan perlindungan lembut tanpa menggesek luka jahitan persalinan.',
    packOptions: [
      { name: '10-Pcs Maternity Extra Long', count: 10, multiplier: 1 },
      { name: '20-Pcs Maternity Pack Hemat', count: 20, multiplier: 1.9 }
    ],
    composition: ['100% Super-Soft Organic Bamboo Top Layer', 'Extra Long 410mm Contour Design', 'Medical-Grade Hypoallergenic Core'],
    stock: 75,
    isEcoCertified: true
  }
];

const INITIAL_CUSTOMER_PACKAGES = [
  {
    id: 'PKG-1001',
    customerName: 'Siti Rahmawati',
    customerEmail: 'siti.rahmawati@gmail.com',
    phone: '0812-9876-5432',
    packageName: 'Paket Langganan Rutin 24-Pcs Day Pads',
    itemsSummary: '2x Ultra-Thin Day Pads (240mm) + 1x Overnight Heavy (330mm)',
    frequency: 'Setiap 30 Hari',
    nextDeliveryDate: '2026-08-25',
    courier: 'SiCepat BEST Eco-Fleet',
    trackingNumber: 'SIC-ECO-98421049',
    shippingAddress: 'Jl. Wijaya II No. 14, Kebayoran Baru, Jakarta Selatan 12160',
    status: 'active',
    statusText: 'Aktif / Berlangganan',
    lastDispatched: '2026-07-26'
  },
  {
    id: 'PKG-1002',
    customerName: 'Anita Wijaya',
    customerEmail: 'anita.wijaya@yahoo.com',
    phone: '0813-1122-3344',
    packageName: 'BYHARIANS Ultimate Eco Ritual Care Box',
    itemsSummary: '1x Ultimate Self-Care Box (Pads + Wipes + Cramp Tea)',
    frequency: 'Setiap 30 Hari',
    nextDeliveryDate: '2026-08-18',
    courier: 'J&T Electric Express',
    trackingNumber: 'JNT-ECO-88129034',
    shippingAddress: 'Menteng Residence Tower A 12B, Jakarta Pusat 10310',
    status: 'in_transit',
    statusText: 'Dalam Pengiriman',
    lastDispatched: '2026-08-14'
  }
];

const INITIAL_CUSTOMER_GROCERIES = [
  {
    id: 'GROC-801',
    customerName: 'Dian Sastrowardoyo',
    customerEmail: 'dian.sastro@earthmail.com',
    phone: '0811-3456-7890',
    basketName: 'Belanjaan Bulanan Pembalut & Tissue Basah Organik',
    itemsSummary: '3x Ultra-Thin Day Pads (240mm) + 2x Overnight Heavy (330mm) + 2x Bamboo Wet Wipes (20s)',
    monthlyPrice: 205000,
    frequency: 'Setiap 30 Hari',
    nextRefillDate: '2026-08-28',
    courier: 'SiCepat BEST Eco-Fleet',
    shippingAddress: 'Pondok Indah Plaza II No. 8, Jakarta Selatan 12310',
    status: 'active',
    statusText: 'Auto-Refill ON',
    lastRefillDate: '2026-07-28'
  }
];

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
      const savedCart = localStorage.getItem('byharians_cart');
      if (savedCart) this.cart = JSON.parse(savedCart);
      const savedAuth = localStorage.getItem('byharians_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        this.isLoggedIn = parsed.isLoggedIn || false;
        this.isAdmin = parsed.isAdmin || false;
        if (parsed.userAccount) this.userAccount = { ...this.userAccount, ...parsed.userAccount };
      }
      const savedOrders = localStorage.getItem('byharians_orders');
      if (savedOrders) this.orders = JSON.parse(savedOrders);
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }

  save() {
    try {
      localStorage.setItem('byharians_cart', JSON.stringify(this.cart));
      localStorage.setItem('byharians_user', JSON.stringify({ isLoggedIn: this.isLoggedIn, isAdmin: this.isAdmin, userAccount: this.userAccount }));
      localStorage.setItem('byharians_orders', JSON.stringify(this.orders));
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
