vegaEmbed('#emissions-sankey-chart','ghg_emissions_sankey.vg.json?v=manrope-20261025',{renderer:'svg',actions:false}).then(function(result){
 const button=document.getElementById('trace-australia');
 button.addEventListener('click',function(){result.view.signal('focus_node',result.view.signal('focus_node')==='1:AUS'?'':'1:AUS').runAsync().catch(console.error);});
 result.view.addSignalListener('focus_node',function(_,value){button.setAttribute('aria-pressed',String(value==='1:AUS'));button.textContent=value==='1:AUS'?'Show all connections':'Trace Australia';});
}).catch(console.error);
