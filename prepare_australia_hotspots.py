import sys, json, math
from pathlib import Path
# Dependencies: numpy, h5py, pyproj, shapely.
# Run: python prepare_australia_hotspots.py PATH_TO_2025_TOTALS_emi.nc
import numpy as np
import h5py
from pyproj import Transformer
from shapely.geometry import shape, mapping, box
from shapely.ops import transform
from shapely import contains_xy

ROOT = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit('Usage: python prepare_australia_hotspots.py PATH_TO_2025_TOTALS_emi.nc')
SOURCE = Path(sys.argv[1])
raw = json.loads((ROOT/'data/ghg_australia_hotspots_source_boundary.geojson').read_text(encoding='utf-8'))
country = next(f for f in raw['features'] if f['properties']['ADM0_A3']=='AUS')
# Limit this local map to mainland Australia, Tasmania and nearby islands.
land = shape(country['geometry']).intersection(box(112,-44,154,-10))
project = Transformer.from_crs('EPSG:4326','EPSG:3577',always_xy=True).transform
projected = transform(project, land)
f = h5py.File(SOURCE)
lat,lon = f['lat'][:],f['lon'][:]
iy = np.where((lat>=-44)&(lat<=-10))[0]
ix = np.where((lon>=112)&(lon<=154))[0]
lo,la = np.meshgrid(lon[ix],lat[iy])
values = f['emissions'][iy.min():iy.max()+1,ix.min():ix.max()+1].astype(float)
inside = contains_xy(land,lo,la)
valid = inside & np.isfinite(values) & (values>=0)
x,y = project(lo[valid],la[valid]); weights=values[valid]
total=float(weights.sum())
features=[]; stats={}
for km in (50,100):
    size=km*1000
    totals={}
    for gx,gy,w in zip(np.floor(x/size).astype(int),np.floor(y/size).astype(int),weights):
        key=(int(gx),int(gy)); totals[key]=totals.get(key,0)+float(w)
    minx,miny,maxx,maxy=projected.bounds
    selected=[]
    for gx in range(math.floor(minx/size),math.ceil(maxx/size)):
        for gy in range(math.floor(miny/size),math.ceil(maxy/size)):
            tile=box(gx*size,gy*size,(gx+1)*size,(gy+1)*size)
            clipped=tile.intersection(projected)
            if clipped.is_empty or clipped.area<1: continue
            tonnes=totals.get((gx,gy))
            # No centre sample is distinct from measured zero emissions.
            props={'grid_km':km,'bin_id':f'{km}_{gx}_{gy}',
                'emissions_kt':round(tonnes/1000,6) if tonnes is not None else None,
                'share':tonnes/total if tonnes is not None else None}
            features.append({'type':'Feature','properties':props,'geometry':mapping(clipped)})
            if tonnes is not None: selected.append(tonnes)
    selected.sort(reverse=True)
    top=max(1,math.ceil(len(selected)*.1))
    stats[str(km)]={'sampled_bins':len(selected),'top_bin_count':top,
        'top_tenth_share':sum(selected[:top])/total,'total_mt':total/1e6,
        'max_kt':selected[0]/1000}

def write(name,obj):
    (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
write('data/ghg_australia_hotspots_bins.geojson',{'type':'FeatureCollection','features':features})
write('data/ghg_australia_hotspots_boundary.geojson',{'type':'FeatureCollection','features':[{'type':'Feature','properties':{},'geometry':mapping(projected)}]})
write('data/ghg_australia_hotspots_summary.json',stats)
places=[]
for name,lon,lat in [('Perth',115.86,-31.95),('Adelaide',138.60,-34.93),('Melbourne',144.96,-37.81),('Sydney',151.21,-33.87),('Brisbane',153.03,-27.47),('Darwin',130.84,-12.46)]:
    px,py=project(lon,lat)
    places.append({'type':'Feature','properties':{'name':name},'geometry':{'type':'Point','coordinates':[px,py]}})
write('data/ghg_australia_hotspots_places.geojson',{'type':'FeatureCollection','features':places})

spec={
 '$schema':'https://vega.github.io/schema/vega-lite/v5.json',
 'description':'Australian 2025 GHG emissions aggregated to equal-area Albers square bins.',
 'width':570,'height':505,'background':None,'padding':8,
 'params':[{'name':'Grid_km','value':50}],
 'projection':{'type':'identity','reflectY':True},
 'layer':[
  {'data':{'url':'data/ghg_australia_hotspots_bins.geojson','format':{'type':'json','property':'features'}},
   'transform':[{'filter':'datum.properties.grid_km == Grid_km'}],
   'mark':{'type':'geoshape','stroke':'#f7f6ef','strokeWidth':.35},
   'encoding':{
    'color':{'condition':{'test':'isValid(datum.properties.emissions_kt)',
        'field':'properties.emissions_kt','type':'quantitative',
        'scale':{'type':'threshold','domain':[1,10,50,250,1000],
                 'range':['#eee9c9','#ced7a8','#a6bf87','#69a68c','#2e8279','#15514d']},
        'legend':None},
      'value':'#dddcd4'},
    'tooltip':[{'field':'properties.grid_km','type':'quantitative','title':'Grid width (km)'},
        {'field':'properties.emissions_kt','type':'quantitative','title':'Annual emissions (kt CO₂eq)','format':',.2f'},
        {'field':'properties.share','type':'quantitative','title':'Share of mapped emissions','format':'.2%'}]}},
  {'data':{'url':'data/ghg_australia_hotspots_boundary.geojson','format':{'type':'json','property':'features'}},
   'mark':{'type':'geoshape','fill':None,'stroke':'#6f8070','strokeWidth':.65,'tooltip':None}},
  {'data':{'url':'data/ghg_australia_hotspots_places.geojson','format':{'type':'json','property':'features'}},
   'mark':{'type':'geoshape','fill':'#253d35','stroke':'#f7f6ef','strokeWidth':1,'tooltip':None}},
 ],
 'config':{'font':'Segoe UI','view':{'stroke':None},'legend':{'titleFontSize':11,'labelFontSize':10,'labelColor':'#526358','titleColor':'#253d35','symbolStrokeWidth':0}}
}
spec['layer']=spec['layer'][:2]
city_values=[{'city':p['properties']['name'],'x':p['geometry']['coordinates'][0],
              'y':p['geometry']['coordinates'][1]} for p in places]
city_encoding={'longitude':{'field':'x','type':'quantitative'},'latitude':{'field':'y','type':'quantitative'}}
spec['layer'].append({'data':{'values':city_values},
 'mark':{'type':'circle','size':16,'color':'#253d35','opacity':1,'stroke':'#f7f6ef','strokeWidth':1,'tooltip':None},'encoding':city_encoding})
for halo in (True,False):
    mark={'type':'text','align':'right','dx':-6,'dy':-7,'fontSize':10,'fontWeight':600,'color':'#253d35','tooltip':None}
    if halo: mark.update({'stroke':'#f7f6ef','strokeWidth':3})
    spec['layer'].append({'data':{'values':city_values},'mark':mark,
                         'encoding':{**city_encoding,'text':{'field':'city'}}})
write('ghg_australia_hotspots.vg.json',spec)
method='''# Australia emissions hotspots — 2025

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
'''
(ROOT/'data/ghg_australia_hotspots_methodology.md').write_text(method,encoding='utf-8')
print(json.dumps(stats,indent=2))
print('Features:',len(features),'source cells:',int(valid.sum()))
