let map;
let cogServerUrl
export function setupMap(containerId, serverUrl){

  mapboxgl.accessToken =
    "pk.eyJ1IjoibmVlbGR1dHRhMTkiLCJhIjoiY2tweG9mN3F4MThrNTJ4cDk0enVjcTN4dCJ9.uxa_h0rjqumTxFMI1QELKQ"; // Replace with your Mapbox access token
  
  cogServerUrl = serverUrl;
  
  map = new mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/mapbox/streets-v11", // Replace with your preferred map style
    center: [-74.5, 40], // Replace with your desired initial center coordinates
    zoom: 9, // Replace with your desired initial zoom level
  });

  // Add zoom controls
  const zoomControls = new mapboxgl.NavigationControl();
  map.addControl(zoomControls, 'top-right');
}

// Add raster layer from GeoJSON
export function renderRaster(geojsonFilePaths) {
  geojsonFilePaths.forEach((geojsonFilePath) => {
    fetch(geojsonFilePath)
      .then((response) => response.json())
      .then(parsedGeojson => {
        const rasterSourceId = `raster-source-${geojsonFilePath}`;
        const rasterLayerId = `raster-layer-${geojsonFilePath}`;

        // Add the raster source
        map.addSource(rasterSourceId, {
          type: "raster",
          tiles: [`${COG_URL}` +
          `/cog/tiles` +
          `/{z}/{x}/{y}.png?url=${TITILER_STATIC}` +
          path], // Replace with the path to your raster tiles
          tileSize: 256,
        });

        // Add the raster layer
        map.addLayer({
          id: rasterLayerId,
          type: "raster",
          source: rasterSourceId,
          paint: {
            // Apply your desired paint properties here
            "raster-opacity": 0.7,
            "raster-hue-rotate": 180,
            // Add more paint properties as needed
          },
        });
      })
      .catch((error) => {
        console.error("Error loading GeoJSON file:", error);
      });
  });
}


// Add vector layer from GeoJSON
export function renderVector(geojsonFilePaths) {
  geojsonFilePaths.forEach(geojsonFilePath => {
    fetch(geojsonFilePath)
      .then(response => response.json())
      .then(parsedGeojson => {

        // Center the map on the points using Turf.js
        const pointFeatures = parsedGeojson.features.filter(feature => feature.geometry.type === "MultiPolygon");
        const center = turf.centerOfMass(turf.featureCollection(pointFeatures));
        const [lng, lat] = center.geometry.coordinates;

        map.setCenter([lng, lat]);
        map.setZoom(12); // Adjust the zoom level as needed

        map.addSource(geojsonFilePath, {
          type: "geojson",
          data: parsedGeojson,
        });

        map.addLayer({
          id: `vector-layer-${geojsonFilePath}`,
          type: "fill",
          source: geojsonFilePath,
          paint: {
            'fill-color': ['coalesce', ['get', 'fill']],
            'fill-opacity': ['coalesce', ['get', 'fill-opacity'], 0.3]
          },
          filter: ['==', ['geometry-type'], 'Polygon']
        });

        map.addLayer({
          id: `vector-layer-outline-${geojsonFilePath}`,
          type: "line",
          source: geojsonFilePath,
          paint: {
            'line-color': ['coalesce', ['get', 'stroke']],
            'line-width': ['coalesce', ['get', 'stroke-width'], 2],
            'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
          },
          filter: ['==', ['geometry-type'], 'Polygon']
        });

        map.addLayer({
          id: `vector-layer-line-${geojsonFilePath}`,
          type: "line",
          source: geojsonFilePath,
          paint: {
            'line-color': ['coalesce', ['get', 'stroke']],
            'line-width': ['coalesce', ['get', 'stroke-width'], 2],
            'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
          },
          filter: ['==', ['geometry-type'], 'LineString']
        });
        //Marker
        const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat]) // Replace [lng, lat] with the desired marker coordinates
        .addTo(map)
      })
      .catch(error => {
        console.error("Error loading GeoJSON file:", error);
      });
    });
    
}

