"use client"

export type UserRole = "customer" | "barber"

/* =======================
   Interfaces
======================= */

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: UserRole
  shopId?: string
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  hours?: any
  image?: string
}

export interface Service {
  id: string
  shopId: string
  name: string
  description: string
  price: number
  duration: number
}

export interface Staff {
  id: string
  shopId: string
  name: string
  specialties: string[]
  specialization?: string
  image?: string
}

export interface Appointment {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  shopId: string
  shopName: string
  serviceId: string
  serviceName: string
  staffId?: string
  staffName?: string
  date: string
  time: string
  status: "pending" | "approved" | "rejected" | "completed"
  price: number
  location: "shop" | "home"
}

/* =======================
   API Helper
======================= */

const API_BASE_URL = "https://barbing-salon-api.onrender.com"
// const API_BASE_URL = "http://localhost:5000"

async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Only access localStorage in the browser
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    : null
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.msg || data.error || "Request failed")
  }

  return data
}

/* =======================
   Local Storage
======================= */

const STORAGE_KEYS = {
  CURRENT_USER: "barber_app_current_user",
  AUTH_TOKEN: "barber_app_auth_token",
}

/* =======================
   Auth Service
======================= */

export const authService = {
  signUp: async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole
  ) => {
    const response = await apiCall("/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, password, role }),
    })

    // Store token
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token)

    const user: User = {
      id: response.user_id.toString(),
      email,
      name,
      phone,
      role: response.role,
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    return user
  },

  signIn: async (email: string, password: string) => {
    const response = await apiCall("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store token
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token)

    const user: User = {
      id: response.user_id.toString(),
      email,
      name: "",
      phone: "",
      role: response.role,
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    return user
  },

  me: async (): Promise<{ id: number; role: UserRole; has_profile: boolean }> => {
    const response = await apiCall('/me', {
      method: 'GET',
    })
    return response
  },

  signOut: async () => {
    await apiCall("/logout", { method: "POST" })
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  getCurrentUser: (): User | null => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return null
    
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  },
}

/* =======================
   Shop Service
======================= */

export const shopService = {
  createShop: async (shop: {
    name: string
    description: string
    address: string
    phone: string
    email: string
    hours: Record<string, string>
  }) => {
    return apiCall("/barber/setup", {
      method: "POST",
      body: JSON.stringify({
        shop_name: shop.name,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        email: shop.email,
        operating_hours: shop.hours,
      }),
    })
  },

  getShops: async (): Promise<Shop[]> => {
    const response = await apiCall("/barbers")

    return response.map((b: any) => ({
      id: b.id.toString(),
      ownerId: b.id.toString(),
      name: b.shop_name,
      description: b.description,
      address: b.address,
      phone: b.phone,
      email: b.email,
    }))
  },

  getShopById: async (shopId: string): Promise<Shop> => {
    const response = await apiCall(`/barbers/${shopId}`)

    return {
      id: response.id.toString(),
      ownerId: response.id.toString(),
      name: response.shop_name,
      description: response.description,
      address: response.address,
      phone: response.phone,
      email: response.email,
      hours: response.operating_hours,
    }
  },
}

/* =======================
   Services
======================= */

export const serviceService = {
  createService: async (service: {
    name: string
    price: number
    duration: number
    description: string
  }) => {
    return apiCall("/barber/services", {
      method: "POST",
      body: JSON.stringify(service),
    })
  },

  getServicesByShopId: async (shopId: string): Promise<Service[]> => {
    const response = await apiCall(`/barbers/${shopId}/services`)

    return response.map((s: any) => ({
      id: s.id.toString(),
      shopId: shopId,
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
    }))
  },

  deleteService: async (serviceId: string) => {
    return apiCall(`/barber/services/${serviceId}`, {
      method: "DELETE",
    })
  },
}

/* =======================
   Staff
======================= */

export const staffService = {
  createStaff: async (staff: { name: string; specialization: string }) => {
    return apiCall("/barber/team", {
      method: "POST",
      body: JSON.stringify({
        name: staff.name,
        specialty: staff.specialization,
      }),
    })
  },

  getStaffByShopId: async (shopId: string): Promise<Staff[]> => {
    const response = await apiCall(`/barbers/${shopId}/team`)

    return response.map((m: any) => ({
      id: m.id.toString(),
      shopId: shopId,
      name: m.name,
      specialties: [m.specialty],
    }))
  },

  deleteStaff: async (staffId: string) => {
    return apiCall(`/barber/team/${staffId}`, {
      method: "DELETE",
    })
  },
}

/* =======================
   Appointments
======================= */

export const appointmentService = {
  createAppointment: async (appointment: {
    barberId: string
    serviceId: string
    date: string
    time: string
    price: number
  }) => {
    return apiCall("/book", {
      method: "POST",
      body: JSON.stringify({
        barber_id: Number(appointment.barberId),
        service_id: Number(appointment.serviceId),
        date: appointment.date,
        time: appointment.time,
        price: appointment.price,
      }),
    })
  },

  getAppointmentsByCustomerId: async (): Promise<Appointment[]> => {
    const response = await apiCall("/customer/bookings")

    return response.map((b: any) => ({
      id: b.id.toString(),
      shopName: b.barber,
      serviceName: b.service,
      date: b.date,
      time: b.time,
      status: b.status,
      price: b.price,
      location: "shop",
    }))
  },

  getAppointmentsByShopId: async (shopId: string): Promise<Appointment[]> => {
    const response = await apiCall(`/barber/bookings`)

    return response.map((b: any) => ({
      id: b.id.toString(),
      customerId: b.customer_id?.toString() || "",
      customerName: b.customer_name || "",
      customerEmail: b.customer_email || "",
      shopId: shopId,
      shopName: "",
      serviceId: b.service_id?.toString() || "",
      serviceName: b.service || "",
      staffId: b.staff_id?.toString(),
      staffName: b.staff_name,
      date: b.date,
      time: b.time,
      status: b.status,
      price: b.price,
      location: "shop",
    }))
  },

  updateAppointmentStatus: async (appointmentId: string, status: "approved" | "rejected") => {
    return apiCall(`/barber/bookings/${appointmentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },
}