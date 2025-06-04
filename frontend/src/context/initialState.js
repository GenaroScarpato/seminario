export const initialOrderState = {
  orders: [],
  loading: false,
  error: null,
  createOrder: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},
  geolocateAddress: () => {},
  assignOrderToVehicle: () => {}
};

export const initialVehicleState = {
  vehicles: [],
  loading: false,
  error: null,
  createVehicle: () => {},
  updateVehicle: () => {},
  deleteVehicle: () => {},
  getOptimizedRoutes: () => {},
  updateVehicleStatus: () => {}
};

export const initialDriverState = {
  drivers: [],
  loading: false,
  error: null,
  createDriver: () => {},
  updateDriver: () => {},
  deleteDriver: () => {},
  assignVehicle: () => {},
  getDriverStats: () => {}
};

export const initialMapState = {
  map: null,
  markers: [],
  setMap: () => {},
  addMarker: () => {},
  removeMarker: () => {},
  clearMarkers: () => {}
};

export const initialWebSocketState = {
  socket: null,
  connect: () => {},
  disconnect: () => {},
  send: () => {},
  onMessage: () => {}
};
