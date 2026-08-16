const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/packages
router.get('/', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('customer_packages').select('*').order('created_at', { ascending: false });
      if (!error && data) return res.json({ success: true, packages: data });
    }
    return res.json({ success: true, packages: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages/upsert
router.post('/upsert', async (req, res) => {
  const pkg = req.body;
  try {
    if (supabase) {
      const { data, error } = await supabase.from('customer_packages').upsert({
        id: pkg.id,
        customer_name: pkg.customerName,
        customer_email: pkg.customerEmail,
        phone: pkg.phone,
        package_name: pkg.packageName,
        items_summary: pkg.itemsSummary,
        frequency: pkg.frequency,
        next_delivery_date: pkg.nextDeliveryDate,
        courier: pkg.courier,
        tracking_number: pkg.trackingNumber,
        shipping_address: pkg.shippingAddress,
        status: pkg.status,
        status_text: pkg.statusText,
        last_dispatched: pkg.lastDispatched || new Date().toISOString().split('T')[0]
      }).select();

      if (error) throw error;
      return res.json({ success: true, package: data?.[0] || pkg });
    }
    return res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
