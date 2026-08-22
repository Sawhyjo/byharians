const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/packages (Support status and email filtering)
router.get('/', async (req, res) => {
  const { status, email } = req.query;
  try {
    if (supabase) {
      let query = supabase.from('customer_packages').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') {
        query = query.eq('status', status.trim());
      }
      if (email) {
        query = query.ilike('customer_email', email.trim());
      }
      const { data, error } = await query;
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
        courier: pkg.courier || 'SiCepat BEST Eco-Fleet',
        tracking_number: pkg.trackingNumber || `SIC-ECO-${Math.floor(10000 + Math.random() * 90000)}`,
        shipping_address: pkg.shippingAddress,
        status: pkg.status || 'active',
        status_text: pkg.statusText || 'Aktif / Berlangganan',
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

// POST /api/packages/dispatch
router.post('/dispatch', async (req, res) => {
  const { id, trackingNumber } = req.body;
  if (!id) return res.status(400).json({ error: 'ID paket wajib diisi' });

  const today = new Date().toISOString().split('T')[0];
  const newTracking = trackingNumber || `SIC-ECO-DISPATCH-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    if (supabase) {
      const { data, error } = await supabase.from('customer_packages').update({
        last_dispatched: today,
        tracking_number: newTracking,
        status: 'dispatched',
        status_text: 'Telah Dikirim Hari Ini'
      }).eq('id', id).select();

      if (error) throw error;
      return res.json({ success: true, message: `Paket ${id} berhasil didispatch`, package: data?.[0] });
    }
    return res.json({ success: true, message: `Paket ${id} disimulasikan dispatch` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages/delete
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID paket wajib diisi' });

  try {
    if (supabase) {
      const { error } = await supabase.from('customer_packages').delete().eq('id', id);
      if (error) throw error;
    }
    return res.json({ success: true, message: `Jadwal paket ${id} berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
