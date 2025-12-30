"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  authService,
  shopService,
  serviceService,
  staffService,
  appointmentService,
  type Shop,
  type Service,
  type Staff,
} from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, MapPin, Phone, Mail, Loader2 } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ShopDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const shopId = params.id as string

  const [user, setUser] = useState(authService.getCurrentUser())
  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser()
      if (!currentUser || currentUser.role !== "customer") {
        router.push("/login")
        return
      }

      setUser(currentUser)
      setLoading(true)
      setError("")

      try {
        const shopData = await shopService.getShopById(shopId)
        if (!shopData) {
          router.push("/dashboard")
          return
        }

        setShop(shopData)

        // Load services and staff concurrently using public endpoints
       const [servicesData, staffData] = await Promise.all([
  serviceService.getServicesByShopId(shopId),
  staffService.getStaffByShopId(shopId),
])


        setServices(servicesData)
        setStaff(staffData)
      } catch (err: any) {
        console.error("Error loading shop data:", err)
        setError(err.message || "Failed to load shop details")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [shopId, router])

  const handleBookService = (service: Service) => {
    setSelectedService(service)
    setSelectedStaff(null)
    setBookingDate("")
    setBookingTime("")
    setShowBookingDialog(true)
    setBookingSuccess(false)
  }

  const handleConfirmBooking = async () => {
    if (!user || !shop || !selectedService || !bookingDate || !bookingTime) {
      return
    }

    setBookingLoading(true)
    setError("")

    try {
      await appointmentService.createAppointment({
        barberId: shop.id,
        serviceId: selectedService.id,
        date: bookingDate,
        time: bookingTime,
        price: selectedService.price,
      })

      setBookingSuccess(true)
      setTimeout(() => {
        setShowBookingDialog(false)
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Booking error:", err)
      setError(err.message || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  const getTodayOperatingHours = () => {
    if (!shop) return null
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const today = days[new Date().getDay()] as keyof typeof shop.hours
    const hours = shop.hours[today]
    
    if (!hours || hours === "closed") return "Closed"
    return hours
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shop details...</p>
        </div>
      </div>
    )
  }

  if (!shop || !user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
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

        {/* Shop Info */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 md:h-80 bg-muted">
            {shop.image ? (
              <Image src={shop.image} alt={shop.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl">{shop.name}</CardTitle>
            <CardDescription className="text-lg">{shop.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>{shop.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>{shop.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>Today: {getTodayOperatingHours()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Services & Pricing</h2>
          {services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        ₦{service.price}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                      <Button onClick={() => handleBookService(service)}>Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No services available at this shop yet.</p>
            </Card>
          )}
        </div>

        {/* Staff */}
        {staff.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Barbers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {staff.map((member) => (
                <Card key={member.id} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-3 overflow-hidden relative">
                      {member.image ? (
                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{member.name}</h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.specialties?.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      )) || (
                        <Badge variant="outline" className="text-xs">
                          {member.specialization}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Booking Submitted!</h3>
              <p className="text-muted-foreground">
                Your appointment request has been sent. The shop will review and confirm shortly.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>Complete your booking details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <Label>Service</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{selectedService?.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedService?.duration} minutes</div>
                      </div>
                      <Badge variant="secondary">₦{selectedService?.price}</Badge>
                    </div>
                  </div>
                </div>

                {staff.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Barber (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {staff.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedStaff(member)}
                          className={`p-3 rounded-md border-2 transition-colors text-left ${
                            selectedStaff?.id === member.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium text-sm">{member.name}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Note: Team member selection is for preference only</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleConfirmBooking}
                  disabled={!bookingDate || !bookingTime || bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}