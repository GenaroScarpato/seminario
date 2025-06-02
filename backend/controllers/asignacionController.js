const Pedido = require('../models/Pedido');
const Vehiculo = require('../models/Vehiculo');
const Ruta = require('../models/Ruta');
const agruparPedidos = require('../services/clustering');
const ordenarRuta = require('../services/routing');

exports.asignarRutas = async (req, res) => {
  try {
    // 1. Buscar pedidos pendientes
    const pedidos = await Pedido.getPedidosPendientes(); // suponiendo que tenés este método

    if (pedidos.length === 0) return res.status(400).json({ msg: 'No hay pedidos pendientes' });

    // 2. Buscar vehículos disponibles
    const vehiculos = await Vehiculo.getVehiculosDisponibles(); // otro método simple

    if (vehiculos.length === 0) return res.status(400).json({ msg: 'No hay vehículos disponibles' });

    // 3. Agrupar pedidos (K-Means)
    const clusters = agruparPedidos(pedidos, vehiculos.length);

    // 4. Para cada grupo, asignar vehículo y generar ruta
    for (let i = 0; i < clusters.length; i++) {
      const vehiculo = vehiculos[i];
      const pedidosGrupo = clusters[i];

      // 5. Ordenar puntos usando nearest neighbor
      const rutaOrdenada = ordenarRuta(pedidosGrupo, vehiculo.posicion);

      // 6. Guardar ruta en DB (modelo Ruta con método saveRuta)
      await Ruta.guardarRuta(vehiculo.id, rutaOrdenada);
    }

    res.json({ msg: 'Rutas asignadas correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al asignar rutas' });
  }
};
