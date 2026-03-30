export const MISSIONS = [
  {
    id: "M01", code: "OPERATION DATA HARVEST", topic: "Data Sources & Importing",
    duration: 180, aoi: "Niger Delta", mode: "Individual",
    briefing: "The Nigerian Hydrological Services Agency has detected anomalous rainfall patterns across the Niger Delta. Assemble a baseline geospatial dataset before the emergency briefing. Your unit must source, download, and correctly import at least four data types into QGIS.",
    tasks: [
      { id: "t1", label: "Download and import DEM raster for Niger Delta", points: 15 },
      { id: "t2", label: "Import Nigeria state/LGA shapefiles — isolate 3 target states", points: 15 },
      { id: "t3", label: "Load satellite imagery band into QGIS", points: 10 },
      { id: "t4", label: "Import OSM roads and waterways via QuickOSM", points: 15 },
      { id: "t5", label: "Import CSV rainfall table and join to LGA attribute table", points: 20 },
      { id: "t6", label: "Organise layers with professional naming convention", points: 10 },
      { id: "t7", label: "Export .qgz project + screenshot of layer panel", points: 5 },
    ],
    bonus: { label: "Import one additional flood-risk dataset with written justification", points: 10 },
    tip: "GRID3 Nigeria (grid3.gov.ng) and OCHA HDX (data.humdata.org) are your fastest sources for admin boundaries.",
  },
  {
    id: "M02", code: "OPERATION REPROJECT", topic: "Coordinate Systems & Transformation",
    duration: 180, aoi: "Lake Chad Basin", mode: "Individual",
    briefing: "Datasets from four countries have arrived for the Lake Chad Basin Commission — each in a different CRS. A misaligned map already caused one policy error this quarter. Harmonise all layers into a single agreed projection before analysis can proceed.",
    tasks: [
      { id: "t1", label: "Identify CRS of all 4 incoming layers — complete log sheet", points: 20 },
      { id: "t2", label: "Reproject all 4 layers to EPSG:32633 (UTM Zone 33N)", points: 30 },
      { id: "t3", label: "Screenshot showing all reprojected layers aligned", points: 15 },
      { id: "t4", label: "Calculate Borno State area (km²) using reprojected layer", points: 15 },
      { id: "t5", label: "Compare Borno area in WGS84 vs UTM — record difference", points: 10 },
      { id: "t6", label: "Debrief answer: why does projection matter for Nigeria? (100 words)", points: 10 },
    ],
    bonus: { label: "Reproject to Nigeria-specific CRS and compare alignment with UTM result", points: 10 },
    tip: "In QGIS: right-click layer → Properties → Information → CRS. To reproject: Vector → Data Management → Reproject Layer.",
  },
  {
    id: "M03", code: "OPERATION GROUNDTRUTH", topic: "Georeferencing",
    duration: 180, aoi: "Enugu State", mode: "Paired",
    briefing: "A 1978 colonial-era topo map of Enugu State has been located in the National Archives. It contains critical historical forest data predating any satellite record. Georeference this scanned map for integration into the modern GIS environment.",
    tasks: [
      { id: "t1", label: "Load scanned topo map into QGIS Georeferencer tool", points: 10 },
      { id: "t2", label: "Place minimum 8 Ground Control Points (GCPs)", points: 20 },
      { id: "t3", label: "Achieve RMSE below 2 pixels — screenshot of Georeferencer", points: 20 },
      { id: "t4", label: "Export georeferenced raster to EPSG:32632", points: 15 },
      { id: "t5", label: "Overlay georeferenced map with current satellite basemap", points: 15 },
      { id: "t6", label: "Identify and mark 3 features visibly changed since 1978", points: 10 },
    ],
    bonus: { label: "Try second transformation type, compare RMSE — explain which is better", points: 10 },
    tip: "GCPs work best on sharp stable features: road intersections, building corners, bridge abutments. Spread across full map extent.",
  },
  {
    id: "M04", code: "OPERATION BOUNDARY LINE", topic: "Digitizing",
    duration: 180, aoi: "Onitsha, Anambra", mode: "Individual",
    briefing: "Rapid urban expansion in Onitsha has outpaced existing spatial datasets. The Urban Planning Department needs an updated land use layer for the city centre and waterfront zone for their flood risk model.",
    tasks: [
      { id: "t1", label: "Create polygon shapefile with attributes: ID, LandUse_Type, Area_m2, Notes", points: 10 },
      { id: "t2", label: "Digitize minimum 15 polygons (market, open space, roads, water body)", points: 20 },
      { id: "t3", label: "Digitize minimum 10 polylines (roads + waterfront edge)", points: 10 },
      { id: "t4", label: "Digitize minimum 5 point features (jetty, hospital, market gate)", points: 5 },
      { id: "t5", label: "Populate complete attribute table for all polygon features", points: 15 },
      { id: "t6", label: "Calculate area (m²) for all polygons using Field Calculator", points: 10 },
      { id: "t7", label: "Apply colour-coded symbology by LandUse_Type", points: 10 },
      { id: "t8", label: "Export map layout with legend, scale bar, north arrow", points: 10 },
    ],
    bonus: { label: "Digitize waterfront settlement with topology rules — document errors found and fixed", points: 10 },
    tip: "Enable snapping before you start: Project → Snapping Options. Set to All Layers, Vertex and Segment, tolerance 10px.",
  },
  {
    id: "M05", code: "OPERATION FLOODZONE", topic: "Spatial Analysis",
    duration: 180, aoi: "Benue State", mode: "Group",
    briefing: "The 2024 flooding season has again devastated communities along the Benue River corridor. NEMA has commissioned GeoOps Nigeria to produce a flood risk priority map and identify the top 5 LGAs requiring pre-season intervention.",
    tasks: [
      { id: "t1", label: "Slope analysis from DEM — reclassify into 5 risk classes", points: 8 },
      { id: "t2", label: "Euclidean distance from river network — reclassify into 5 classes", points: 8 },
      { id: "t3", label: "Reclassify land use layer by flood vulnerability", points: 8 },
      { id: "t4", label: "Normalise population density by LGA into 5 risk classes", points: 8 },
      { id: "t5", label: "Weighted overlay — combine 4 layers (weights sum to 100%)", points: 25 },
      { id: "t6", label: "Produce composite flood risk raster (1–5 scale)", points: 15 },
      { id: "t7", label: "Identify top 5 highest-risk LGAs with extracted scores", points: 15 },
      { id: "t8", label: "Final risk map with classification, LGA labels, legend", points: 13 },
    ],
    bonus: { label: "Sensitivity analysis: 2 alternative weight sets — does LGA ranking change?", points: 10 },
    tip: "For weighted overlay in QGIS use the Raster Calculator. Align all rasters to same extent and resolution using Warp/Resample first.",
  },
  {
    id: "M06", code: "OPERATION CANOPY WATCH", topic: "Remote Sensing Classification",
    duration: 180, aoi: "Cross River State", mode: "Paired",
    briefing: "Satellite intelligence suggests accelerating deforestation in Cross River State. The Forestry Commission needs a current land cover map to quantify forest loss since 2010. Perform supervised classification and produce a change detection assessment.",
    tasks: [
      { id: "t1", label: "Load and composite Landsat bands for both 2010 and 2023", points: 10 },
      { id: "t2", label: "Create false colour composite NIR-Red-Green for both dates", points: 10 },
      { id: "t3", label: "Run supervised classification — 5 classes, both images", points: 25 },
      { id: "t4", label: "Calculate area (km²) for each class in both years", points: 15 },
      { id: "t5", label: "Produce change detection map — forest loss highlighted", points: 20 },
      { id: "t6", label: "Calculate percentage forest cover change", points: 5 },
      { id: "t7", label: "Complete one-page briefing note (template provided)", points: 10 },
    ],
    bonus: { label: "Calculate NDVI both dates — do NDVI decline zones align with deforestation?", points: 10 },
    tip: "Install Semi-Automatic Classification Plugin (SCP) before class. Define ROIs from training polygons, run classification. Target: >80% overall accuracy.",
  },
  {
    id: "M07", code: "OPERATION FINAL BRIEF", topic: "Map Production",
    duration: 180, aoi: "Analyst's Choice", mode: "Individual",
    briefing: "GeoOps Nigeria has been invited to brief the Federal Ministry of Environment. Each analyst must produce a professional map atlas — three maps, one story — drawing on outputs from any two previous missions.",
    tasks: [
      { id: "t1", label: "Overview/context map: Nigeria + study area inset", points: 10 },
      { id: "t2", label: "Main thematic map from chosen analysis output", points: 10 },
      { id: "t3", label: "Change/comparison map (two time periods or scenarios)", points: 10 },
      { id: "t4", label: "All maps: title, legend, scale bar, north arrow, data credit", points: 15 },
      { id: "t5", label: "Consistent colour scheme across all 3 maps", points: 15 },
      { id: "t6", label: "Export as single PDF (A3 page size, 300dpi minimum)", points: 5 },
      { id: "t7", label: "200-word map narrative — policymaker-focused language", points: 20 },
      { id: "t8", label: "2-minute verbal presentation to table group (peer score)", points: 10 },
    ],
    bonus: { label: "Use QGIS Atlas to auto-generate maps across LGAs or states", points: 10 },
    tip: "Less is more. Ask yourself: what is the ONE thing I want the reader to see? Everything else is supporting context.",
  },
];

export const RANKS = [
  { label: "ALPHA ANALYST", min: 580, color: "#F4A620", icon: "🥇" },
  { label: "BETA ANALYST",  min: 480, color: "#94A3B8", icon: "🥈" },
  { label: "GAMMA ANALYST", min: 370, color: "#CD7F32", icon: "🥉" },
  { label: "FIELD ANALYST", min: 0,   color: "#4ADE80", icon: "🔰" },
];

export function getRank(total) {
  return RANKS.find(r => total >= r.min) || RANKS[RANKS.length - 1];
}

export function fmt(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
