import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getDashboardTrends = () => api.get('/dashboard/trends')

// Customers
export const getCustomers = () => api.get('/customers')
export const getCustomer = (id) => api.get(`/customers/${id}`)
export const createCustomer = (data) => api.post('/customers', data)
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data)
export const deleteCustomer = (id) => api.delete(`/customers/${id}`)

// Vehicles
export const getVehicles = () => api.get('/vehicles')
export const getVehicle = (id) => api.get(`/vehicles/${id}`)
export const createVehicle = (data) => api.post('/vehicles', data)
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`)

// Technicians
export const getTechnicians = () => api.get('/technicians')
export const getTechnician = (id) => api.get(`/technicians/${id}`)
export const getAvailableTechnicians = (vehicleType) => api.get(`/technicians/available/${vehicleType}`)
export const createTechnician = (data) => api.post('/technicians', data)
export const updateTechnician = (id, data) => api.put(`/technicians/${id}`, data)

// Service Requests
export const getServiceRequests = (params) => api.get('/service-requests', { params })
export const getServiceRequest = (id) => api.get(`/service-requests/${id}`)
export const createServiceRequest = (data) => api.post('/service-requests', data)
export const updateServiceRequestStatus = (id, data) => api.put(`/service-requests/${id}/status`, data)
export const approveEstimate = (id, data) => api.put(`/service-requests/${id}/approve`, data)

// Inspections
export const getInspections = () => api.get('/inspections')
export const getInspection = (serviceRequestId) => api.get(`/inspections/${serviceRequestId}`)
export const createInspection = (data) => api.post('/inspections', data)
export const updateInspection = (id, data) => api.put(`/inspections/${id}`, data)

// Estimates
export const getEstimates = () => api.get('/estimates')
export const getEstimate = (serviceRequestId) => api.get(`/estimates/${serviceRequestId}`)
export const createEstimate = (data) => api.post('/estimates', data)
export const updateEstimate = (id, data) => api.put(`/estimates/${id}`, data)

// SLAs
export const getSLAs = () => api.get('/slas')
export const getSLAStats = () => api.get('/slas/stats')

// Notifications
export const getNotifications = () => api.get('/notifications')
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`)

// Feedback
export const getFeedback = () => api.get('/feedback')
export const submitFeedback = (data) => api.post('/feedback', data)

export default api
