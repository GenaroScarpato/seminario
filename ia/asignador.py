from sklearn.cluster import KMeans
import numpy as np

# Coordenadas base fijo (base de reparto)
BASE_LAT = -34.58402190
BASE_LON = -58.46702480

def nearest_neighbor(points):
    n = len(points)
    unvisited = list(range(1, n))
    route = [0]  # empezamos en base (índice 0)

    while unvisited:
        last = route[-1]
        next_city = min(unvisited, key=lambda i: float(np.linalg.norm(points[i] - points[last])))
        route.append(next_city)
        unvisited.remove(next_city)

    return route

def total_distance(route, points):
    return sum(np.linalg.norm(points[route[i]] - points[route[i + 1]]) for i in range(len(route) - 1))

def two_opt(route, points):
    best = route
    improved = True
    while improved:
        improved = False
        for i in range(1, len(route) - 2):
            for j in range(i + 1, len(route)):
                if j - i == 1:
                    continue
                new_route = route[:i] + route[i:j][::-1] + route[j:]
                if total_distance(new_route, points) < total_distance(best, points):
                    best = new_route
                    improved = True
        route = best
    return best

def asignar_pedidos_logica(pedidos, vehiculos):
    if not pedidos or not vehiculos:
        return {"asignaciones": {}, "no_asignados": []}

    # Convertir a arrays numpy para KMeans
    try:
        coordenadas = np.array([[float(p['lat']), float(p['lon'])] for p in pedidos])
    except (ValueError, KeyError) as e:
        raise ValueError(f"Error en coordenadas de pedidos: {str(e)}")

    n_clusters = min(len(vehiculos), len(pedidos))
    
    # Si solo hay un vehículo o un pedido
    if n_clusters == 1:
        labels = np.zeros(len(pedidos))
    else:
        try:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(coordenadas)
            labels = kmeans.labels_
        except Exception as e:
            raise ValueError(f"Error en clustering: {str(e)}")

    # Preparar estructuras
    asignaciones = {v['id']: [] for v in vehiculos}
    vehiculos_info = {v['id']: {
        "tipo": v['tipo'],
        "capacidad_restante": float(v['capacidad']),
        "peso_restante": float(v['peso_maximo'])
    } for v in vehiculos}
    
    # Trackear pedidos asignados
    pedidos_asignados = set()
    no_asignados = []

    # Ordenar vehículos por tipo y capacidad
    tipo_prioridad = {"moto": 1, "auto": 2, "camioneta": 3, "camion": 4}
    vehiculos_ordenados = sorted(
        vehiculos, 
        key=lambda v: (tipo_prioridad.get(v['tipo'], 99), -float(v['capacidad']))
    )

    # Asignar pedidos
    for cluster_idx in range(n_clusters):
        cluster_pedidos = [p for j, p in enumerate(pedidos) if labels[j] == cluster_idx]
        
        # Ordenar pedidos por volumen/peso (mayores primero)
        cluster_pedidos.sort(key=lambda p: (-float(p['volumen']), -float(p['peso'])))
        
        for pedido in cluster_pedidos:
            peso_pedido = float(pedido['peso'])
            volumen_pedido = float(pedido['volumen'])
            asignado = False
            
            for v in vehiculos_ordenados:
                info = vehiculos_info[v['id']]
                if (info["capacidad_restante"] >= volumen_pedido and 
                    info["peso_restante"] >= peso_pedido):
                    asignaciones[v['id']].append(pedido['id'])
                    info["capacidad_restante"] -= volumen_pedido
                    info["peso_restante"] -= peso_pedido
                    pedidos_asignados.add(pedido['id'])
                    asignado = True
                    break
            
            if not asignado:
                no_asignados.append(pedido['id'])

    # Optimización de ruta por grupo usando TSP (Nearest Neighbor + 2-opt)
    rutas_optimizadas = {}
    for vehiculo_id, pedidos_ids in asignaciones.items():
        if not pedidos_ids:
            continue

        # Obtener los pedidos originales con coordenadas
        pedidos_del_vehiculo = [p for p in pedidos if p['id'] in pedidos_ids]

        # Crear array con base + pedidos
        puntos_base = np.array([[BASE_LAT, BASE_LON]])
        puntos_pedidos = np.array([[p['lat'], p['lon']] for p in pedidos_del_vehiculo])
        puntos = np.vstack([puntos_base, puntos_pedidos])  # base en posición 0

        if len(puntos) <= 2:
            # No optimizamos si solo hay 1 pedido
            rutas_optimizadas[vehiculo_id] = [pedidos_ids[0]] if pedidos_ids else []
            continue

        # TSP con base fija: empezamos en base (índice 0)
        ruta_nn_idx = nearest_neighbor(puntos)
        ruta_2opt_idx = two_opt(ruta_nn_idx, puntos)

        # Omitimos el 0 (base) y convertimos índices a IDs pedidos
        ruta_ids_ordenada = [pedidos_del_vehiculo[i-1]['id'] for i in ruta_2opt_idx if i != 0]

        rutas_optimizadas[vehiculo_id] = ruta_ids_ordenada

    return {
        "asignaciones": rutas_optimizadas,
        "no_asignados": no_asignados
    }
