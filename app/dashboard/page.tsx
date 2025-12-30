"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, shopService, appointmentService, type Shop, type Appointment } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Mail, LogOut, Calendar, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getCurrentUser())
  const [shops, setShops] = useState<Shop[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState<"shops" | "appointments">("shops")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      if (currentUser.role !== "customer") {
        router.push("/shop/dashboard")
        return
      }

      setUser(currentUser)
      setLoading(true)
      setError("")

      try {
        // Load shops and appointments concurrently
        const [shopsData, appointmentsData] = await Promise.all([
          shopService.getShops(),
          appointmentService.getAppointmentsByCustomerId(),
        ])

        setShops(shopsData)
        setAppointments(appointmentsData)
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
      router.push("/")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-yellow-500"
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">BarberBook</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("shops")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "shops"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Shops
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "appointments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Appointments
            {appointments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {appointments.length}
              </span>
            )}
          </button>
        </div>

        {/* Browse Shops Tab */}
        {activeTab === "shops" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Available Barbershops</h2>
              <p className="text-muted-foreground">Find the perfect barbershop for your next haircut</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    {shop.image ? (
                      <Image src={shop.image} alt={shop.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{shop.name}</CardTitle>
                    <CardDescription>{shop.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{shop.email}</span>
                    </div>
                    <Button className="w-full mt-4" onClick={() => router.push(`/shop/${shop.id}`)}>
                      View Details & Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {shops.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No barbershops available at the moment.</p>
              </Card>
            )}
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">My Appointments</h2>
              <p className="text-muted-foreground">Track all your upcoming and past appointments</p>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You don't have any appointments yet.</p>
                  <Button onClick={() => setActiveTab("shops")}>Browse Shops</Button>
                </Card>
              ) : (
                appointments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold">{appointment.shopName}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {new Date(appointment.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span>
                                <strong>Service:</strong> {appointment.serviceName}
                              </span>
                              {appointment.staffName && (
                                <span>
                                  <strong>Barber:</strong> {appointment.staffName}
                                </span>
                              )}
                              <span>
                                <strong>Price:</strong> ₦{appointment.price}
                              </span>
                              {appointment.location && (
                                <span>
                                  <strong>Location:</strong> {appointment.location === "shop" ? "At Shop" : "Home Service"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}