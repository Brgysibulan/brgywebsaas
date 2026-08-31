const THEMES = {
  ocean: { label: 'Ocean Blue', primary: '#0f6ea8', secondary: '#0f766e', accent: '#0284c7', bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#dbe4ee', radius: '14px', nav: '#ffffff', navText: '#0f172a' },
  emerald: { label: 'Emerald', primary: '#047857', secondary: '#0f766e', accent: '#059669', bg: '#f0fdf4', surface: '#ffffff', text: '#10231b', muted: '#5f7469', border: '#d8e8df', radius: '14px', nav: '#ffffff', navText: '#10231b' },
  royal: { label: 'Royal', primary: '#4f46e5', secondary: '#6d28d9', accent: '#6366f1', bg: '#f5f3ff', surface: '#ffffff', text: '#17152d', muted: '#6b6682', border: '#e2def4', radius: '14px', nav: '#ffffff', navText: '#17152d' },
  slate: { label: 'Slate', primary: '#334155', secondary: '#475569', accent: '#64748b', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e2e8f0', radius: '12px', nav: '#0f172a', navText: '#f8fafc' }
};

const KEY = 'brgywebsaas_theme';
const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
const current = { name: saved?.name || 'ocean', mode: saved?.mode || 'light', density: saved?.density || 'comfortable', nav: saved?.nav || 'top', radius: saved?.radius || 'medium' };

function applyTheme() {
  const t = THEMES[current.name] || THEMES.ocean;
  const root = document.documentElement;
  Object.entries({ '--brand-primary': t.primary, '--brand-secondary': t.secondary, '--brand-accent': t.accent, '--page-bg': t.bg, '--surface': t.surface, '--text': t.text, '--muted': t.muted, '--border': t.border, '--nav-bg': t.nav, '--nav-text': t.navText }).forEach(([k,v]) => root.style.setProperty(k, v));
  root.dataset.themeMode = current.mode;
  root.dataset.density = current.density;
  root.dataset.navStyle = current.nav;
  root.dataset.radius = current.radius;
  localStorage.setItem(KEY, JSON.stringify(current));
}

function panel() {
  if (document.querySelector('#theme-panel')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<button id="theme-open" class="theme-trigger" type="button" aria-label="Customize appearance">🎨</button>
  <aside id="theme-panel" class="theme-panel" aria-label="Appearance settings" hidden>
    <div class="theme-head"><strong>Customize Appearance</strong><button id="theme-close" type="button" aria-label="Close">×</button></div>
    <label>Color theme<select id="theme-name">${Object.entries(THEMES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
    <label>Mode<select id="theme-mode"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>
    <label>Navigation<select id="theme-nav"><option value="top">Top navigation</option><option value="sidebar">Sidebar-ready</option><option value="compact">Compact</option></select></label>
    <label>Density<select id="theme-density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
    <label>Corner style<select id="theme-radius"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
    <div class="theme-actions"><button id="theme-reset" type="button" class="theme-secondary">Reset</button><button id="theme-save" type="button">Apply</button></div>
    <p class="theme-note">Appearance is saved on this device. Site-wide branding can be connected to Supabase later.</p>
  </aside>`;
  document.body.append(wrap);

  const open = document.querySelector('#theme-open');
  const p = document.querySelector('#theme-panel');
  const close = document.querySelector('#theme-close');
  const name = document.querySelector('#theme-name');
  const mode = document.querySelector('#theme-mode');
  const nav = document.querySelector('#theme-nav');
  const density = document.querySelector('#theme-density');
  const radius = document.querySelector('#theme-radius');
  const sync = () => { name.value=current.name; mode.value=current.mode; nav.value=current.nav; density.value=current.density; radius.value=current.radius; };
  sync();
  open.addEventListener('click', () => { p.hidden=false; });
  close.addEventListener('click', () => { p.hidden=true; });
  document.querySelector('#theme-save').addEventListener('click', () => { current.name=name.value; current.mode=mode.value; current.nav=nav.value; current.density=density.value; current.radius=radius.value; applyTheme(); p.hidden=true; });
  document.querySelector('#theme-reset').addEventListener('click', () => { Object.assign(current,{name:'ocean',mode:'light',density:'comfortable',nav:'top',radius:'medium'}); applyTheme(); sync(); });
}

applyTheme();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', panel, { once:true }); else panel();
