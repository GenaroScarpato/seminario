// services/routing.js
function nearestNeighborRuta(puntos, origen) {
  const ruta = [origen];
  const restantes = [...puntos];
  while (restantes.length) {
    const last = ruta[ruta.length - 1];
    let idx = 0;
    let minDist = Infinity;
    for (let i = 0; i < restantes.length; i++) {
      const dist = Math.hypot(last.lat - restantes[i].lat, last.lng - restantes[i].lng);
      if (dist < minDist) {
        minDist = dist;
        idx = i;
      }
    }
    ruta.push(restantes[idx]);
    restantes.splice(idx, 1);
  }
  return ruta;
}
