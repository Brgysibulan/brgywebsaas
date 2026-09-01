import { SUPABASE_CONFIG } from './config.js';

const session = JSON.parse(sessionStorage.getItem('brgywebsaas_session') || 'null');
const params = new URLSearchParams(location.search);

function headers() {
  const h = { apikey: SUPABASE_CONFIG.publishableKey };
  if (session?.access_token) h.Authorization = `Bearer ${session.access_token}`;
  return h;
}

async function resolveBarangayId() {
  if (location.pathname.endsWith('admin.html') || location.pathname.endsWith('design-studio.html')) {
    return session?.profile?.barangay_id || null;
  }

  const directId = params.get('id');
  if (directId) return directId;

  const slug = (params.get('barangay') || '').trim().toLowerCase();
  if (!slug) return null;
  const r = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangays?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id&limit=1`, { headers: headers() });
  if (!r.ok) return null;
  return (await r.json())?.[0]?.id || null;
}

function applySettings(settings) {
  if (!settings) return;
  const root = document.documentElement;
  const primary = settings.primary || '#1f4d3a';
  const accent = settings.accent || '#d9a441';
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', primary);
  root.style.setProperty('--brand-accent', accent);
  root.style.setProperty('--studio-primary', primary);
  root.style.setProperty('--studio-accent', accent);

  root.dataset.tenantTheme = settings.theme || 'default';
  root.dataset.tenantNavbar = settings.navbar || 'classic';
  root.dataset.tenantFooter = settings.footer || 'classic';
  root.dataset.tenantButton = settings.button || 'rounded';

  const radius = settings.button === 'pill' ? '999px' : settings.button === 'square' ? '4px' : '12px';
  root.style.setProperty('--tenant-button-radius', radius);

  let style = document.getElementById('tenant-theme-overrides');
  if (!style) {
    style = document.createElement('style');
    style.id = 'tenant-theme-overrides';
    document.head.appendChild(style);
  }
  style.textContent = `
    .btn,.public-btn,button{border-radius:var(--tenant-button-radius)!important}
    .btn-primary{background-color:var(--brand-primary)!important;border-color:var(--brand-primary)!important}
    .btn-outline-primary{color:var(--brand-primary)!important;border-color:var(--brand-primary)!important}
    .btn-outline-primary:hover{background-color:var(--brand-primary)!important;color:#fff!important}
    .app-nav{border-color:color-mix(in srgb,var(--brand-primary) 22%,#fff)!important}
    [data-tenant-navbar="classic"] .app-nav{background:var(--brand-primary)!important;color:#fff!important}
    [data-tenant-navbar="classic"] .app-nav .brand,[data-tenant-navbar="classic"] .app-nav .nav-link-btn{color:#fff!important}
    [data-tenant-navbar="compact"] .app-nav-inner{min-height:54px!important}
    [data-tenant-navbar="transparent"] .app-nav{background:transparent!important;box-shadow:none!important}
    [data-tenant-navbar="centered"] .app-nav-inner{justify-content:center!important;flex-wrap:wrap!important}
    [data-tenant-footer="dark"] .app-footer,[data-tenant-footer="dark"] .public-footer{background:#111827!important;color:#fff!important}
    [data-tenant-footer="simple"] .app-footer,[data-tenant-footer="simple"] .public-footer{background:transparent!important;border-top:1px solid #e5e7eb!important;color:inherit!important}
    [data-tenant-theme="modern"] .surface-card,[data-tenant-theme="modern"] .card{box-shadow:0 14px 34px rgba(15,23,42,.10)!important}
    [data-tenant-theme="classic"] .surface-card,[data-tenant-theme="classic"] .card{border-radius:6px!important;box-shadow:none!important}
    [data-tenant-theme="minimal"] .surface-card,[data-tenant-theme="minimal"] .card{box-shadow:none!important;border-color:#e5e7eb!important}
  `;

  localStorage.setItem('brgywebsaas_tenant_theme', JSON.stringify(settings));
}

function applyCached() {
  try { applySettings(JSON.parse(localStorage.getItem('brgywebsaas_tenant_theme') || 'null')); } catch {}
}

async function loadTenantTheme() {
  applyCached();
  try {
    const barangayId = await resolveBarangayId();
    if (!barangayId) return;
    const r = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/barangay_design_settings?barangay_id=eq.${encodeURIComponent(barangayId)}&is_published=eq.true&select=settings,is_published&limit=1`, { headers: headers() });
    if (!r.ok) return;
    const row = (await r.json())?.[0];
    if (row?.is_published && row.settings) applySettings(row.settings);
  } catch {}
}

loadTenantTheme();
