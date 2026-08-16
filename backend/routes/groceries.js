const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/groceries
router.get('/', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('customer_groceries').select('*').order('created_at', { ascending: false });
      if (!error && data) return res.json({ success: true, groceries: data });
    }
    return res.json({ success: true, groceries: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/groceries/upsert
router.post('/upsert', async (req, res) => {
  const grocery = req.body;
  try {
    if (supabase) {
      const { data, error } = await supabase.from('customer_groceries').upsert({
        id: grocery.id,
        customer_name: grocery.customerName,
        customer_email: grocery.customerEmail,
        phone: grocery.phone,
        basket_name: grocery.basketName,
        items_summary: grocery.itemsSummary,
        monthly_price: grocery.monthlyPrice,
        frequency: grocery.frequency,
        next_refill_date: grocery.nextRefillDate,
        courier: grocery.courier,
        shipping_address: grocery.shippingAddress,
        status: grocery.status,
        status_text: grocery.statusText,
        last_refill_date: grocery.lastRefillDate || new Date().toISOString().split('T')[0]
      }).select();

      if (error) throw error;
      return res.json({ success: true, grocery: data?.[0] || grocery });
    }
    return res.json({ success: true, grocery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
