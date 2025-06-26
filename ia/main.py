from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
from asignador import asignar_pedidos_logica

app = FastAPI()

# Configurar CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS ---
class Pedido(BaseModel):
    id: int
    direccion: str
    lat: str  # Recibimos como string desde el front
    lng: str  # Mantenemos lng en lugar de lon
    volumen: str  # Recibimos como string
    peso: str     # Recibimos como string
    estado: Optional[str] = None
    scheduled_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Vehiculo(BaseModel):
    id: int
    patente: str
    marca: str
    modelo: str
    anio: int
    tipo: str
    capacidad: int  # Asumimos que es numérico aunque en JSON viene sin decimales
    estado: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Propiedad calculada para peso máximo según tipo de vehículo
    @property
    def peso_maximo(self):
        pesos = {
            "moto": 50,
            "auto": 300,
            "camioneta": 800,
            "camion": 2000
        }
        return pesos.get(self.tipo, 300)  # Default 300 si no coincide

class AsignacionResponse(BaseModel):
    asignaciones: Dict[int, List[int]]  # vehiculo_id -> lista de pedidos_id
    no_asignados: List[int]  # IDs de pedidos no asignados

class AsignacionRequest(BaseModel):
    pedidos: List[Pedido]
    vehiculos: List[Vehiculo]

# --- ENDPOINTS ---
@app.post("/asignar-pedidos", response_model=AsignacionResponse)
def asignar_pedidos(data: AsignacionRequest):
    # Convertimos los datos al formato esperado por la lógica
    pedidos_convertidos = []
    for p in data.pedidos:
        pedidos_convertidos.append({
            "id": p.id,
            "lat": float(p.lat),
            "lon": float(p.lng),  # Convertimos lng a lon para la lógica
            "peso": float(p.peso),
            "volumen": float(p.volumen)
        })
    
    vehiculos_convertidos = []
    for v in data.vehiculos:
        vehiculos_convertidos.append({
            "id": v.id,
            "tipo": v.tipo,
            "capacidad": float(v.capacidad),
            "peso_maximo": float(v.peso_maximo)  # Usamos la propiedad calculada
        })
    
    # Llamamos a la lógica de asignación
    resultado = asignar_pedidos_logica(pedidos_convertidos, vehiculos_convertidos)
    return AsignacionResponse(
        asignaciones=resultado["asignaciones"],
        no_asignados=resultado["no_asignados"]
    )

@app.get("/health-check")
def health_check():
    return {"status": "ok"}