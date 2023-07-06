let map;
let cogServerUrl;
export async function setupMap(containerId, serverUrl) {
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
  map.addControl(zoomControls, "top-right");

  await new Promise((res) => map.on("load", res));
}

// Add raster layer from GeoJSON
export async function renderRaster(geojsonFilePaths) {
  for (const geojsonFilePath of geojsonFilePaths) {
    const rasterSourceId = `raster-source-${geojsonFilePath}`;
    const rasterLayerId = `raster-layer-${geojsonFilePath}`;

    let metaDataURL = `${cogServerUrl}/cog/statistics?url=${geojsonFilePath}`;
    //let metaDataURL = `http://172.31.6.26:8000/cog/metadata?url=http://localhost:5011${tif_loc}`;
    req.log.info("fetching metadata from titiler");
    let response = await fetch(metaDataURL, {
      method: "GET",
    });
    req.log.info(response), "getResponse data :  ";
    let metadata = await response.json();
    req.log.info(metadata, "get metadata data :  ");
    //-------handle for detail:not found----
    minP = metadata["1"]["min"];
    maxP = metadata["1"]["max"];
    metaDataURL = `${cogServerUrl}/cog/info?url=${geojsonFilePath}`;
    response = await fetch(metaDataURL, {
      method: "GET",
    });
    metadata = await response.json();
    center = {
      lat: (metadata["bounds"][1] + metadata["bounds"][3]) / 2,
      lng: (metadata["bounds"][0] + metadata["bounds"][2]) / 2,
    };

    // Add the raster source
    map.addSource(rasterSourceId, {
      type: "raster",
      tiles: [
        `${cogServerUrl}/cog/tiles/{z}/{x}/{y}.png?url=${geojsonFilePath}`,
      ], // Replace with the path to your raster tiles
      tileSize: 256,
    });

    // Add the raster layer
    map.addLayer({
      id: rasterLayerId,
      type: "raster",
      source: rasterSourceId,
      /*paint: {
        // Apply your desired paint properties here
        //"raster-opacity": 0.7,
        //"raster-hue-rotate": 180,
        // Add more paint properties as needed
      },*/
    });
  }
}

// Add vector layer from GeoJSON
export function renderVector(geojsonFilePaths) {
  geojsonFilePaths.forEach((geojsonFilePath) => {
    fetch(geojsonFilePath)
      .then((response) => response.json())
      .then((parsedGeojson) => {
        // Center the map on the points using Turf.js
        const pointFeatures = parsedGeojson.features.filter(
          (feature) => feature.geometry.type === "MultiPolygon"
        );
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
            "fill-color": ["coalesce", ["get", "fill"]],
            "fill-opacity": ["coalesce", ["get", "fill-opacity"], 0.3],
          },
          filter: ["==", ["geometry-type"], "Polygon"],
        });

        map.addLayer({
          id: `vector-layer-outline-${geojsonFilePath}`,
          type: "line",
          source: geojsonFilePath,
          paint: {
            "line-color": ["coalesce", ["get", "stroke"]],
            "line-width": ["coalesce", ["get", "stroke-width"], 2],
            "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
          },
          filter: ["==", ["geometry-type"], "Polygon"],
        });

        map.addLayer({
          id: `vector-layer-line-${geojsonFilePath}`,
          type: "line",
          source: geojsonFilePath,
          paint: {
            "line-color": ["coalesce", ["get", "stroke"]],
            "line-width": ["coalesce", ["get", "stroke-width"], 2],
            "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
          },
          filter: ["==", ["geometry-type"], "LineString"],
        });
        //Marker
        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat]) // Replace [lng, lat] with the desired marker coordinates
          .addTo(map);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON file:", error);
      });
  });
}
