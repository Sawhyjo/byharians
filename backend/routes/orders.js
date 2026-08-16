const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// POST /api/orders (Create new order)
router.post('/', async (req, res) => {
  const orderData = req.body;
  try {
    if (supabase) {
      const { data, error } = await supabase.from('orders').insert({
        id: orderData.id,
        user_id: orderData.userId || null,
        customer_name: orderData.customer?.name,
        customer_email: orderData.customer?.email,
        customer_phone: orderData.customer?.phone,
        items: orderData.items,
        total: orderData.total,
        currency: 'IDR',
        status: orderData.status || 'processing',
        timeline: orderData.timeline,
        shipping_address: orderData.customer?.city
      }).select();

      if (error) console.warn('Supabase Order Insert Warning:', error.message);
      return res.json({ success: true, order: data?.[0] || orderData });
    }

    return res.json({ success: true, order: orderData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id (Lookup order)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').or(`id.eq.${id},tracking_number.eq.${id}`);
      if (data && data.length > 0) {
        return res.json({ success: true, order: data[0] });
      }
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
