const axios = require('axios');

const puntos = [
  { nombre: 'Obelisco', lat: -34.6037, lon: -58.3816 },
  { nombre: 'Corrientes y Callao', lat: -34.6056, lon: -58.3938 },
  { nombre: 'Libertador y Sarmiento', lat: -34.5705, lon: -58.4117 },
  { nombre: 'Cabildo y Juramento', lat: -34.5614, lon: -58.4562 },
];



async function getTrafficData() {
  const results = await Promise.all(
    puntos.map(async ({ nombre, lat, lon }) => {
      const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&key=${process.env.API_KEY}`;

      try {
        const { data } = await axios.get(url);

        const seg = data.flowSegmentData;
        const congestion = 1 - (seg.currentSpeed / seg.freeFlowSpeed);

        return {
          nombre,
          lat,
          lon,
          currentSpeed: seg.currentSpeed,
          freeFlowSpeed: seg.freeFlowSpeed,
          congestion: Number(congestion.toFixed(2)),
        };
      } catch (e) {
        console.error(`Error en punto ${nombre}:`, e.message);
        return {
          nombre,
          lat,
          lon,
          error: true,
          message: 'No se pudo obtener el tráfico',
        };
      }
    })
  );

  return results;
}

module.exports = {
  getTrafficData,
};
