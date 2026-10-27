(function(){
 const embed=window.vegaEmbed;
 const ready=document.fonts?Promise.all([400,600,700].map(weight=>document.fonts.load(weight+' 12px Manrope'))).catch(function(){return [];}):Promise.resolve();
 window.vegaEmbed=function(){const args=arguments;return ready.then(function(){return embed.apply(window,args);});};
}());
