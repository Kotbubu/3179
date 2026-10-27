// Country source detail and continental comparison share the original EDGAR data.
Promise.all([
  vegaEmbed('#global-sectors-chart','ghg_the_global_mix.vg.json?v=country-continent-20261026',{renderer:'svg',actions:false}),
  fetch('data/ghg_country_source_summary_2025.json').then(function(response){if(!response.ok)throw new Error('Country source summary could not load');return response.json();})
]).then(function(results){
  const view=results[0].view;
  const summaries=results[1];
  const control=document.createElement('select');
  control.id='global-mix-country';
  control.setAttribute('aria-label','Explore a country’s emissions sources');
  summaries.forEach(function(row){const option=document.createElement('option');option.value=row.code;option.textContent=row.name;control.appendChild(option);});
  document.getElementById('global-mix-controls').replaceChildren(control);
  function updateCountry(){
    const row=summaries.find(function(item){return item.code===control.value;});
    document.getElementById('global-sectors-heading').textContent=row.code==='World'?'What drives the world’s emissions?':'What drives emissions in '+row.name+'?';
    document.getElementById('global-mix-leading-share').textContent=(row.largest_share*100).toFixed(1)+'%';
    const description=document.getElementById('global-mix-leading-description');
    description.replaceChildren();
    const name=document.createElement('strong');name.textContent=row.largest_name;
    description.append(name,document.createTextNode(' accounts for this share'),document.createElement('br'),document.createTextNode(row.code==='World'?'of global emissions.':'of '+row.name+'’s emissions.'));
    const note=document.getElementById('global-mix-adjustment-note');
    note.hidden=!row.negative_sources.length;
    note.textContent=row.negative_sources.map(function(source){return source.name+': '+source.emissions_mt.toFixed(2)+' Mt adjustment.';}).join(' ')+(row.negative_sources.length?' Rectangles show positive sources; shares use the net total.':'');
    document.getElementById('global-sectors-chart').setAttribute('aria-label','2025 emissions sources for '+row.name);
    view.signal('selected_country',row.code).signal('selected_country_name',row.name).signal('largest_source_id',row.largest_source_id).signal('focus_category','All sectors').runAsync().catch(console.error);
  }
  connectChartLegend('global-sectors-chart',view,'focus_category',true);
  control.addEventListener('change',updateCountry);
  updateCountry();
}).catch(console.error);
