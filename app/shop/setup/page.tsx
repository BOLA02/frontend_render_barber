"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, shopService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function ShopSetupPage() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getCurrentUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  })

  const [hours, setHours] = useState({
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "18:00", closed: false },
    sunday: { open: "00:00", close: "00:00", closed: true },
  })

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      if (currentUser.role !== "barber") {
        router.push("/dashboard")
        return
      }

      // Check if barber already has a shop
      try {
        const shops = await shopService.getShops()
        const userShop = shops.find(s => s.ownerId === currentUser.id || s.email === currentUser.email)
        
        if (userShop) {
          router.push("/shop/dashboard")
          return
        }
      } catch (err) {
        console.error("Error checking existing shop:", err)
      }

      setUser(currentUser)
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    try {
      if (!user) throw new Error("Not authenticated")

      // Convert hours to API format (string format like "09:00-18:00" or "closed")
      const operatingHours: Record<string, string> = {}
      Object.entries(hours).forEach(([day, times]) => {
        if (times.closed) {
          operatingHours[day] = "closed"
        } else {
          operatingHours[day] = `${times.open}-${times.close}`
        }
      })

      await shopService.createShop({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        hours: operatingHours as any,
      })

      // Give the backend time to process
      await new Promise(resolve => setTimeout(resolve, 200))

      router.push("/shop/dashboard")
    } catch (err: any) {
      console.error("Error creating shop:", err)
      
      // Check if it's an authentication error
      if (err.message.includes("Not authenticated") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.")
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(err.message || "Failed to create shop. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleDayClosed = (day: string) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day as keyof typeof hours],
        closed: !hours[day as keyof typeof hours].closed,
      },
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Setup Your Barbershop</CardTitle>
            <CardDescription>Tell us about your business to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Shop Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Classic Cuts Barbershop"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your barbershop..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="shop@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Operating Hours</Label>
                <div className="space-y-2">
                  {Object.entries(hours).map(([day, times]) => (
                    <div key={day} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                      <div className="w-28">
                        <span className="font-medium capitalize">{day}</span>
                      </div>
                      {!times.closed ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={times.open}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...times, open: e.target.value },
                              })
                            }
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={times.close}
                            onChange={(e) =>
                              setHours({
                                ...hours,
                                [day]: { ...times, close: e.target.value },
                              })
                            }
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 text-muted-foreground">Closed</div>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => toggleDayClosed(day)}>
                        {times.closed ? "Open" : "Close"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Shop...
                  </>
                ) : (
                  "Create Shop"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}