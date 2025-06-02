// utils/geocoding.js
const axios = require("axios");

async function geocodeAddress(address) {
  const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  const location = response.data.results[0]?.geometry.location;
  return location; // { lat, lng }
}
