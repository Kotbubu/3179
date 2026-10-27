vegaEmbed('#australia-trajectory-chart','ghg_australia_trajectory.vg.json?v=reading-flow-20261025',{renderer:'svg',actions:false}).then(function(result){
 const slider=document.getElementById('australia-trajectory-year');
 slider.addEventListener('input',function(){const year=Number(slider.value);document.getElementById('australia-trajectory-year-value').textContent=year;result.view.signal('focus_year',year).runAsync().catch(console.error);});
 function setDetail(detail){
  document.getElementById('trajectory-full').setAttribute('aria-pressed',String(!detail));
  document.getElementById('trajectory-detail').setAttribute('aria-pressed',String(detail));
  document.getElementById('trajectory-scale-note').textContent=detail?'Focus view: 280–660 Mt; 18–31 tonnes per person.':'Both axes start at zero.';
  result.view.signal('detail_view',detail).runAsync().catch(console.error);
 }
 document.getElementById('trajectory-full').addEventListener('click',function(){setDetail(false);});
 document.getElementById('trajectory-detail').addEventListener('click',function(){setDetail(true);});
 window.addEventListener('resize',function(){result.view.resize().runAsync().catch(console.error);});
}).catch(console.error);
