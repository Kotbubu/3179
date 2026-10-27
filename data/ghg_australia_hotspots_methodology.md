# Australia emissions hotspots — 2025

Source: EDGAR 2026, EDGAR_2026_GHG_GWP_100_AR5_GHG_2025_TOTALS_emi.nc.
Variable emissions, units Tonnes CO2 equivalent per 0.1-degree grid cell per year.
Natural Earth 1:50m admin-0 country boundaries (nvkelso/natural-earth-vector).

The source cell centres inside mainland Australia, Tasmania and nearby islands
(112–154 E, 44–10 S) are selected using the Natural Earth land boundary.
Only finite nonnegative observations are included. Source coordinates are
reprojected from EPSG:4326 to Australian Albers equal-area EPSG:3577.
Cells are assigned by centre to a fixed 50 km or 100 km square grid anchored
at EPSG:3577 origin; source annual tonnes are summed, then divided by 1000
for kt CO2eq. Grid geometry is clipped to the land boundary for display.
Both resolutions conserve exactly the same selected source total.
Coastal displayed tiles are partial squares. No interpolation, smoothing,
population normalisation or flux summation is performed.

Missing source samples are grey; observed zero belongs to the lowest class.
The top tenth uses ceil(0.1 * number of sampled land bins), sorted by emissions.
This coastal centre-based subset is not an official Australian national total.
Offshore cells and distant territories are excluded. Boundary choice and
source resolution affect the coastal attribution. Excludes LULUCF.

Colour thresholds stay fixed when grid size changes, but each larger square
covers four times the area, so its total is expected to rise. The two maps
show totals, not emission density. Interpret them within each resolution.
