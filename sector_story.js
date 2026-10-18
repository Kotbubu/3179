// Global composition introduces national differences and sector growth.
vegaEmbed('#global-sectors-chart', 'ghg_the_global_mix.vg.json', {renderer:'svg', actions:false}).catch(console.error);
vegaEmbed('#sector-growth-chart', 'ghg_sources_of_growth.vg.json', {renderer:'svg', actions:false}).catch(console.error);
