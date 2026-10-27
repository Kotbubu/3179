Promise.all([
 vegaEmbed('#australia-waterfall-chart','ghg_australia_waterfall.vg.json?v=manrope-20261025',{renderer:'svg',actions:false}),
 fetch('data/ghg_australia_waterfall_summary.json').then(response=>{if(!response.ok)throw new Error('Australian summaries could not load');return response.json();})
]).then(function([result,rows]){
 const slider=document.getElementById('australia-waterfall-year');
 const signed=value=>(value<0?'−':value>0?'+':'')+Math.abs(value*100).toFixed(0)+'%';
 function update(){
  const year=Number(slider.value),row=rows.find(value=>value.year===year);
  document.getElementById('australia-waterfall-year-value').textContent=year;
  document.getElementById('waterfall-period-year').textContent=year;
  document.getElementById('waterfall-total-change').textContent=signed(row.total_change);
  document.getElementById('waterfall-person-change').textContent=signed(row.person_change);
  document.getElementById('australia-waterfall-finding').textContent=year===1970?'Select a later year to compare with 1970.':row.person_component<0?'Population growth outweighs lower per-person emissions by '+year+'.':'Both components increase Australia’s emissions compared with 1970.';
  result.view.signal('end_year',year).runAsync().catch(console.error);
 }
 slider.addEventListener('input',update);update();
 window.addEventListener('resize',function(){result.view.resize().runAsync().catch(console.error);});
}).catch(console.error);
