"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  authService,
  shopService,
  serviceService,
  staffService,
  appointmentService,
  type Shop,
  type Service,
  type Staff,
  type Appointment,
} from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LogOut, Plus, Clock, DollarSign, Users, Calendar, Trash2, Check, X, Loader2 } from "lucide-react"

export default function ShopDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getCurrentUser())
  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showStaffDialog, setShowStaffDialog] = useState(false)
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: "", duration: "" })
  const [staffForm, setStaffForm] = useState({ name: "", specialization: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

 useEffect(() => {
  const loadData = async () => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    if (currentUser.role !== "barber") {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    setLoading(true)
    setError("")

    try {
      // Check has_profile first
      const me = await authService.me()
      if (!me.has_profile) {
        router.push("/shop/setup")
        return
      }

      // Get all shops to find the current user's shop
      const shops = await shopService.getShops()
      const userShop = shops.find(s => s.ownerId === currentUser.id || s.email === currentUser.email)
      
      if (!userShop) {
        console.error("User has profile but no shop found")
        router.push("/shop/setup")
        return
      }

      setShop(userShop)

      // Load services, staff, and appointments concurrently
      const [servicesData, staffData] = await Promise.all([
        serviceService.getServicesByShopId(userShop.id).catch(err => {
          console.warn('Could not load services:', err)
          return []
        }),
        staffService.getStaffByShopId(userShop.id).catch(err => {
          console.warn('Could not load staff:', err)
          return []
        })
      ])

      setServices(servicesData)
      setStaff(staffData)
      
      // Try to load appointments if the endpoint exists
      try {
        const appointmentsData = await appointmentService.getAppointmentsByShopId(userShop.id)
        setAppointments(appointmentsData)
      } catch (err) {
        console.warn('Could not load appointments:', err)
        setAppointments([])
      }
    } catch (err: any) {
      console.error("Error loading data:", err)
      setError(err.message || "Failed to load dashboard data")
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

  const handleAddService = async () => {
    if (!shop || !serviceForm.name || !serviceForm.price || !serviceForm.duration) return

    setActionLoading("service")
    setError("")

    try {
      await serviceService.createService({
        name: serviceForm.name,
        description: serviceForm.description,
        price: Number.parseFloat(serviceForm.price),
        duration: Number.parseInt(serviceForm.duration),
      })

      const servicesData = await serviceService.getServicesByShopId(shop.id)
      setServices(servicesData)
      setServiceForm({ name: "", description: "", price: "", duration: "" })
      setShowServiceDialog(false)
    } catch (err: any) {
      console.error("Error adding service:", err)
      setError(err.message || "Failed to add service")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!shop) return
    
    if (!confirm('Are you sure you want to delete this service?')) return
    
    setActionLoading(`delete-service-${id}`)
    
    try {
      await serviceService.deleteService(id)
      const servicesData = await serviceService.getServicesByShopId(shop.id)
      setServices(servicesData)
    } catch (err: any) {
      console.error("Error deleting service:", err)
      alert(err.message || 'Failed to delete service.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddStaff = async () => {
    if (!shop || !staffForm.name || !staffForm.specialization) return

    setActionLoading("staff")
    setError("")

    try {
      await staffService.createStaff({
        name: staffForm.name,
        specialization: staffForm.specialization,
      })

      const staffData = await staffService.getStaffByShopId(shop.id)
      setStaff(staffData)
      setStaffForm({ name: "", specialization: "" })
      setShowStaffDialog(false)
    } catch (err: any) {
      console.error("Error adding staff:", err)
      setError(err.message || "Failed to add team member")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!shop) return
    
    if (!confirm('Are you sure you want to delete this team member?')) return
    
    setActionLoading(`delete-staff-${id}`)
    
    try {
      await staffService.deleteStaff(id)
      const staffData = await staffService.getStaffByShopId(shop.id)
      setStaff(staffData)
    } catch (err: any) {
      console.error("Error deleting staff:", err)
      alert(err.message || 'Failed to delete team member.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAppointmentAction = async (id: string, status: "approved" | "rejected") => {
    if (!shop) return
    
    setActionLoading(`appointment-${id}`)
    
    try {
      await appointmentService.updateAppointmentStatus(id, status)
      
      // Try to reload appointments
      try {
        const appointmentsData = await appointmentService.getAppointmentsByShopId(shop.id)
        setAppointments(appointmentsData)
      } catch (err) {
        console.warn('Could not reload appointments:', err)
      }
    } catch (err: any) {
      console.error("Error updating appointment:", err)
      setError(err.message || "Failed to update appointment")
    } finally {
      setActionLoading(null)
    }
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending")
  const upcomingAppointments = appointments.filter((a) => a.status === "approved")

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !shop) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">Shop Owner Dashboard</p>
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

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{staff.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingAppointments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Appointment Requests</CardTitle>
              <CardDescription>Review and respond to customer booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{appointment.customerName || appointment.customerEmail}</h4>
                          <Badge variant="secondary">{appointment.serviceName}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </span>
                          {appointment.staffName && <span>Barber: {appointment.staffName}</span>}
                          <span>₦{appointment.price}</span>
                          {appointment.location && (
                            <span>{appointment.location === "shop" ? "At Shop" : "Home Service"}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.customerEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAppointmentAction(appointment.id, "approved")}
                          disabled={actionLoading === `appointment-${appointment.id}`}
                        >
                          {actionLoading === `appointment-${appointment.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                          disabled={actionLoading === `appointment-${appointment.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services & Pricing</CardTitle>
                  <CardDescription>Manage your service offerings</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowServiceDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No services added yet</p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="p-3 border rounded-lg flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <Badge variant="secondary">₦{service.price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{service.description}</p>
                        <p className="text-xs text-muted-foreground">{service.duration} minutes</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteService(service.id)}
                        disabled={actionLoading === `delete-service-${service.id}`}
                      >
                        {actionLoading === `delete-service-${service.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your barbers</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowStaffDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No team members added yet</p>
                ) : (
                  staff.map((member) => (
                    <div key={member.id} className="p-3 border rounded-lg flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{member.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties ? (
                            member.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {member.specialization}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteStaff(member.id)}
                        disabled={actionLoading === `delete-staff-${member.id}`}
                      >
                        {actionLoading === `delete-staff-${member.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Confirmed bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{appointment.customerName || appointment.customerEmail}</h4>
                      <Badge className="bg-green-500">{appointment.status}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </span>
                      <span>{appointment.serviceName}</span>
                      {appointment.staffName && <span>Barber: {appointment.staffName}</span>}
                      <span>₦{appointment.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>Create a new service offering</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="Classic Haircut"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea
                id="serviceDescription"
                placeholder="Describe the service..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicePrice">Price (₦)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  placeholder="1500"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDuration">Duration (min)</Label>
                <Input
                  id="serviceDuration"
                  type="number"
                  placeholder="30"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                />
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleAddService}
              disabled={actionLoading === "service"}
            >
              {actionLoading === "service" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Service"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a barber to your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Name</Label>
              <Input
                id="staffName"
                placeholder="John Doe"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffSpecialization">Specialization</Label>
              <Input
                id="staffSpecialization"
                placeholder="Haircut"
                value={staffForm.specialization}
                onChange={(e) => setStaffForm({ ...staffForm, specialization: e.target.value })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleAddStaff}
              disabled={actionLoading === "staff"}
            >
              {actionLoading === "staff" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Team Member"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}