/** Labels used for seeded demo data + “Create project” form */
export const SECTOR_OPTIONS = [
  'FinTech & Banking',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail & CX',
  'Technology / SaaS',
  'Logistics',
  'Sustainability & ESG',
];

export function sectorVisual(sector) {
  const label = sector && String(sector).trim() ? sector.trim() : 'General';
  const map = {
    'FinTech & Banking': { icon: '🏦', accent: 'var(--accent-glow)', border: 'var(--accent)' },
    Healthcare: { icon: '🏥', accent: 'var(--green-bg)', border: 'var(--green)' },
    Education: { icon: '🎓', accent: 'var(--blue-bg)', border: 'var(--blue)' },
    Manufacturing: { icon: '🏭', accent: 'var(--yellow-bg)', border: 'var(--yellow)' },
    'Retail & CX': { icon: '🛒', accent: '#ffbe3c22', border: 'var(--yellow)' },
    'Technology / SaaS': { icon: '⚙️', accent: '#38bdf822', border: 'var(--blue)' },
    Logistics: { icon: '🚚', accent: '#ffffff12', border: 'var(--text2)' },
    'Sustainability & ESG': { icon: '🌿', accent: 'var(--green-bg)', border: 'var(--green)' },
  };
  return map[label] || { icon: '🏢', accent: 'var(--bg3)', border: 'var(--border2)' };
}
