from sklearn.cluster import KMeans
import numpy as np

# Coordenadas base fijo (base de reparto)
BASE_LAT = -34.58402190
BASE_LON = -58.46702480

def nearest_neighbor(points):
    n = len(points)  
    unvisited = list(range(1, n))  # Lista de puntos no visitados, excluyendo el punto inicial (0)
    route = [0]  # Empezamos la ruta desde el punto base (índice 0)

    while unvisited:
        last = route[-1]  # Último punto visitado en la ruta actual
        # Buscamos el punto no visitado más cercano al último visitado
        next_city = min(unvisited, key=lambda i: float(np.linalg.norm(points[i] - points[last])))
        route.append(next_city)  # Lo agregamos a la ruta
        unvisited.remove(next_city)  # Lo quitamos de los no visitados

    return route  # Devolvemos la ruta construida (lista de índices de puntos en orden)


def total_distance(route, points):
    # Calcula la distancia total sumando la distancia euclidiana entre puntos consecutivos en la ruta
    return sum(np.linalg.norm(points[route[i]] - points[route[i + 1]]) for i in range(len(route) - 1))


def two_opt(route, points):
    best = route  # Guardamos la mejor ruta encontrada hasta ahora
    improved = True  # Variable para controlar si hubo mejora en la última iteración

    while improved:
        improved = False  # Reiniciamos la bandera de mejora
        for i in range(1, len(route) - 2):  # Iteramos sobre pares de segmentos en la ruta
            for j in range(i + 1, len(route)):
                if j - i == 1:
                    continue  # Saltamos segmentos consecutivos (no tiene sentido invertir segmentos adyacentes)
                # Creamos una nueva ruta invirtiendo el orden de los puntos entre i y j
                new_route = route[:i] + route[i:j][::-1] + route[j:]
                # Comparamos la distancia total de la nueva ruta con la mejor actual
                if total_distance(new_route, points) < total_distance(best, points):
                    best = new_route  # Si mejoró, actualizamos la mejor ruta
                    improved = True  # Marcamos que hubo mejora para seguir iterando
        route = best  # Actualizamos la ruta actual a la mejor encontrada

    return best  # Devolvemos la mejor ruta optimizada


def asignar_pedidos_logica(pedidos, vehiculos):
    # Si no hay pedidos o vehículos, devolvemos respuesta vacía
    if not pedidos or not vehiculos:
        return {"asignaciones": {}, "no_asignados": []}

    # Intentamos convertir las coordenadas latitud y longitud de los pedidos a un array numpy
    # Esto es necesario para usar el algoritmo K-Means de clustering
    try:
        coordenadas = np.array([[float(p['lat']), float(p['lon'])] for p in pedidos])
    except (ValueError, KeyError) as e:
        # Si hay error en las coordenadas, lanzamos una excepción con el detalle
        raise ValueError(f"Error en coordenadas de pedidos: {str(e)}")

    # Definimos la cantidad de clusters (grupos) como el mínimo entre cantidad de vehículos y pedidos
    n_clusters = min(len(vehiculos), len(pedidos))
    
    # Si solo hay un cluster (un vehículo o un pedido), asignamos etiquetas 0 a todos
    if n_clusters == 1:
        labels = np.zeros(len(pedidos))  # Todos quedan en el mismo grupo
    else:
        # Si hay más clusters, creamos y entrenamos el modelo K-Means con las coordenadas
        try:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(coordenadas)
            # Obtenemos las etiquetas que indican a qué cluster pertenece cada pedido
            labels = kmeans.labels_
        except Exception as e:
            # Si hay error en el clustering, lanzamos una excepción con el detalle
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
