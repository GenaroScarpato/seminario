// services/clustering.js
const kmeans = require("ml-kmeans");

function agruparPedidos(pedidos, cantidadVehiculos) {
  const coordenadas = pedidos.map(p => [p.lat, p.lng]);
  const { clusters } = kmeans(coordenadas, cantidadVehiculos);
  return clusters; // [ [pedido1, pedido3], [pedido2, pedido5], ... ]
}
