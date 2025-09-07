// script.js for index.html: load materials, filter, search
async function fetchMaterials(){
  const res = await fetch('/api/materials');
  return await res.json();
}

function makeCard(m){
  const div = document.createElement('div');
  div.className = 'card material';
  div.innerHTML = `
    <div>
      <strong>${escapeHtml(m.title)}</strong>
      <div class="meta">${m.category} • ${m.subject} • ${new Date(m.uploadedAt).toLocaleDateString()}</div>
      <div class="meta">${m.description || ''}</div>
    </div>
    <div class="actions">
      <a class="btn" href="/uploads/${m.filename}" target="_blank" rel="noopener">View / Download</a>
      <a class="btn ghost" href="/uploads/${m.filename}" download>Download</a>
    </div>
  `;
  return div;
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

(async ()=>{
  const grid = document.getElementById('materialsGrid');
  const materials = await fetchMaterials();
  let current = materials;

  function render(list){
    grid.innerHTML = '';
    if(list.length === 0){
      grid.innerHTML = '<div class="card"><em>No materials yet.</em></div>';
      return;
    }
    list.forEach(m => grid.appendChild(makeCard(m)));
  }

  render(materials);

  // filters
  const filter = document.getElementById('filterCategory');
  const search = document.getElementById('searchBox');

  function applyFilters(){
    const q = search.value.trim().toLowerCase();
    const cat = filter.value;
    let out = materials.filter(m=>{
      if(cat && m.category !== cat) return false;
      if(q){
        return (m.title && m.title.toLowerCase().includes(q)) ||
               (m.subject && m.subject.toLowerCase().includes(q)) ||
               (m.description && m.description.toLowerCase().includes(q));
      }
      return true;
    });
    render(out);
  }
  filter.addEventListener('change', applyFilters);
  search.addEventListener('input', debounce(applyFilters, 220));

  function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } }
})();
