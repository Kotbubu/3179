// Display all years on a fixed global rank scale.
var vg_3 = 'ghg_shifting_positions.vg.json';
vegaEmbed('#bump3', vg_3, {renderer: 'svg', actions: false})
  .then(function(result) {
    window.addEventListener('resize', function() {
      result.view.resize().runAsync().catch(console.error);
    });
  }).catch(console.error);
