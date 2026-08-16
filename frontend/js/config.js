/**
 * BYHARIANS ECO-COMMERCE CONFIGURATION MODULE
 */
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CONFIG = {
  SUPABASE_URL: 'https://pqelwrcierxjrpwcbbxe.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_U3RH0VO3rDZpGPVVJj0-0w_Idtot050',
  API_BASE_URL: isLocalDev ? 'http://localhost:8080/api' : '/api'
};

let supabaseClient = null;

try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client initialized successfully in frontend');
  }
} catch (err) {
  console.warn('⚠️ Supabase init warning in frontend:', err);
}
