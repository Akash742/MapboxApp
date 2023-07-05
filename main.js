import { setupMap, renderVector, renderRaster } from "./script.js";

// Turn component with given id into mapbox 
// Use the given COG server url for rendering the raster layers
setupMap("map", "https://cog-nk.kesowa.com");

// Render all given geojson urls
// Center on first geojson url
renderVector([
  "https://cdn-dev.kesowa.com/vector/00854a1e-568d-42db-84e9-a310df7593c9.geojson",
  "https://cdn-dev.kesowa.com/vector/59af3119-fd68-48d0-966a-9a0008ec2b18.geojson"
])

// Render all given ortho urls
// Center on first raster url
renderRaster([
  "https://cdn-dev.kesowa.com/raster/a0789482-62c7-4ab5-b9a4-9f83694d0a9e.tif",
  "https://cdn-dev.kesowa.com/raster/f6b443a1-7724-4bd6-9be9-4f33fd0fc98c.tif"
])
