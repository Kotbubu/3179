vegaEmbed('#sector-streamgraph','ghg_sector_streamgraph.vg.json?v=compact-notes-20261026',{renderer:'svg',actions:false}).then(function(result){
  connectChartLegend('sector-streamgraph',result.view,'legend_sector',false);
  const section=document.querySelector('section[aria-labelledby="streamgraph-heading"]');
  result.view.addSignalListener('legend_sector',function(_,value){section.querySelectorAll('.stream-brief-findings>p').forEach(function(row){row.classList.toggle('annotation-muted',!!value && row.dataset.sector!==value);});});
  window.addEventListener('resize',function(){result.view.resize().runAsync().catch(console.error);});
}).catch(console.error);
vegaEmbed('#australia-butterfly','ghg_australia_butterfly.vg.json?v=compact-notes-20261026',{renderer:'svg',actions:false}).then(function(result){
  window.addEventListener('resize',function(){result.view.resize().runAsync().catch(console.error);});
}).catch(console.error);
