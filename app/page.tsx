import { Button } from "@/components/ui/button"
import { Scissors, Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">Book Your Perfect Haircut</h1>
            <p className="text-xl text-slate-300 text-pretty">
              Connect with top barbershops in your area. Browse services, check availability, and book appointments
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
              >
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Scissors className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Top Barbershops</h3>
              <p className="text-muted-foreground">Access to the best barbershops and stylists in your area</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Easy Booking</h3>
              <p className="text-muted-foreground">Book appointments in seconds with real-time availability</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Choose Your Barber</h3>
              <p className="text-muted-foreground">Select from experienced professionals with different specialties</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Confirmation</h3>
              <p className="text-muted-foreground">Get notified immediately when your appointment is confirmed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Are You a Barbershop Owner?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Join our platform to manage your bookings, showcase your services, and grow your business
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link href="/signup">Create Shop Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
