mapboxgl.accessToken =
  "pk.eyJ1IjoibmVlbGR1dHRhMTkiLCJhIjoiY2tweG9mN3F4MThrNTJ4cDk0enVjcTN4dCJ9.uxa_h0rjqumTxFMI1QELKQ"; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11", // Replace with your preferred map style
  center: [-74.5, 40], // Replace with your desired initial center coordinates
  zoom: 9, // Replace with your desired initial zoom level
});

//Add pane control
map.on("load", () => {
  const pane = document.getElementById("pane");
  const layerRadios = pane.querySelectorAll('input[type="radio"]');
  
  layerRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedLayer = radio.value;
      map.setLayoutProperty("layer", "visibility", "none");
      map.setLayoutProperty(selectedLayer, "visibility", "visible");
    });
  });
})

// Add raster layer
/*map.on("load", () => {
  map.addSource("raster-source", {
    type: "raster",
    tiles: ["PATH_TO_RASTER_TILES/{z}/{x}/{y}.png"], // Replace with the path to your raster tiles
    tileSize: 256,
  });

  map.addLayer({
    id: "raster-layer",
    type: "raster",
    source: "raster-source",
    paint: {},
  });
});*/

// Add vector layer from GeoJSON
map.on("load", () => {
  const geojsonFilePath = "./assets/WaterBody_&_Road/AA-II_Street.geojson"; // Replace with the path to your GeoJSON file
  
  fetch(geojsonFilePath)
    .then(response => response.json())
    .then(parsedGeojson => {
      // Center the map on the points using Turf.js
      const pointFeatures = parsedGeojson.features.filter(feature => feature.geometry.type === "MultiPolygon");
      const center = turf.centerOfMass(turf.featureCollection(pointFeatures));
      const [lng, lat] = center.geometry.coordinates;

      map.setCenter([lng, lat]);
      map.setZoom(12); // Adjust the zoom level as needed

      map.addSource("vector-source", {
        type: "geojson",
        data: parsedGeojson,
      });

      map.addLayer({
        id: 'map-data-fill',
        type: 'fill',
        source: 'vector-source',
        paint: {
          'fill-color': ['coalesce', ['get', 'fill']],
          'fill-opacity': ['coalesce', ['get', 'fill-opacity'], 0.3]
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });

      map.addLayer({
        id: 'map-data-fill-outline',
        type: 'line',
        source: 'vector-source',
        paint: {
          'line-color': ['coalesce', ['get', 'stroke']],
          'line-width': ['coalesce', ['get', 'stroke-width'], 2],
          'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });

      map.addLayer({
        id: 'map-data-line',
        type: 'line',
        source: 'vector-source',
        paint: {
          'line-color': ['coalesce', ['get', 'stroke']],
          'line-width': ['coalesce', ['get', 'stroke-width'], 2],
          'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
        },
        filter: ['==', ['geometry-type'], 'LineString']
      });
    })
    .catch(error => {
      console.error("Error loading GeoJSON file:", error);
    });

//Marker
const marker = new mapboxgl.Marker()
.setLngLat([88.393462299414097, 22.593231705561085, -196447.000000000029104]) // Replace [lng, lat] with the desired marker coordinates
.addTo(map);
});


// Add zoom controls
const zoomControls = new mapboxgl.NavigationControl();
map.addControl(zoomControls, 'top-right');
