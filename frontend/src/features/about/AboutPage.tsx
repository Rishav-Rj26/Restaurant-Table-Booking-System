import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, CreditCard, Utensils, Star, ArrowRight } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import Button from '../../components/Button';

export default function AboutPage() {
  return (
    <div className="pb-24 min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <div className="relative bg-primary pt-16 pb-20 px-6 rounded-b-[2.5rem] overflow-hidden text-center text-white shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <Utensils className="w-12 h-12 mx-auto mb-4 text-white/90" />
          <h1 className="font-serif text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Dine With <br /> Absolute Certainty
          </h1>
          <p className="text-white/80 text-lg mb-8 font-medium">
            TableGuard is the premium booking platform that guarantees your table is waiting when you arrive. No double bookings. No hassle.
          </p>
          <Link to="/">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white w-full rounded-full py-4 text-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2">
              Find a Table <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 mt-10 max-w-lg mx-auto">
        <h2 className="font-serif text-2xl font-bold text-on-surface mb-6 text-center">Why Choose TableGuard?</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4 p-4 bg-surface rounded-2xl shadow-sm border border-outline-variant">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Guaranteed Reservations</h3>
              <p className="text-outline text-sm leading-relaxed mt-1">Our real-time sync technology ensures that once you book, the table is locked for you. Say goodbye to the anxiety of lost reservations.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-surface rounded-2xl shadow-sm border border-outline-variant">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Real-Time Availability</h3>
              <p className="text-outline text-sm leading-relaxed mt-1">See exactly what times are available right now. We pull live data straight from the restaurant's floor plan.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-surface rounded-2xl shadow-sm border border-outline-variant">
            <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Secure Booking Fees</h3>
              <p className="text-outline text-sm leading-relaxed mt-1">Secure premium tables with a small hold fee that deters no-shows, making it easier for serious diners to find a spot.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="mt-12 px-5 max-w-lg mx-auto">
        <div className="bg-secondary-container p-6 rounded-3xl relative overflow-hidden text-center">
          <div className="flex justify-center gap-1 text-secondary mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-on-secondary-container font-serif italic text-lg leading-relaxed relative z-10">
            "TableGuard changed the way we dine out. We used to worry about arriving on time only to be told our table was given away. Not anymore."
          </p>
          <p className="mt-4 font-bold text-secondary text-sm">— Sarah & Mark, Foodies</p>
        </div>
      </div>
      
      <div className="mt-12 text-center pb-8">
        <p className="text-xs text-outline font-medium tracking-wide uppercase">TableGuard © {new Date().getFullYear()}</p>
      </div>

      <BottomNav />
    </div>
  );
}
