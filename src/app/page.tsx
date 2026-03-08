'use client';

import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car, ShieldCheck, Search, ArrowRight, Users, CheckCircle2, Lock, Zap,
  Globe, FileText, Star, ChevronRight, Wrench, MapPin, Award, TrendingUp,
  Camera, DollarSign, Eye, Sparkles, BadgeCheck, Heart, Calendar
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-100">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Vehicle<span className="text-indigo-600">Verify</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">How It Works</Link>
            <Link href="#workshops" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Workshops</Link>
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Sign In</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'contributor' ? '/contributor/dashboard' : user.role === 'workshop' ? '/workshop/dashboard' : '/subscriber/dashboard'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition-all text-sm shadow-lg shadow-indigo-600/20">
                Dashboard
              </Link>
            ) : (
              <Link href="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition-all text-sm shadow-lg shadow-indigo-600/20">
                Get Started <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — Text-First, CSS-Driven */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden bg-white">
        {/* Subtle animated gradient mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/50 via-violet-100/30 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100/30 via-indigo-50/20 to-transparent rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-8 border border-indigo-100">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" /></span>
                50,000+ verified reports
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6 text-slate-900">
                Don&apos;t buy a car{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">without its history.</span>
              </h1>

              <p className="text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
                Search any vehicle by VIN or plate number. Get admin-verified accident records, damage photos, and full severity reports.
              </p>

              {/* Search Bar CTA */}
              <Link href="/subscriber/search" className="group flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all max-w-md">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-sm font-medium flex-1 text-left">Enter VIN or plate number...</span>
                <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold group-hover:from-indigo-500 group-hover:to-violet-500 transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap">
                  Search →
                </span>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-100">
                {[
                  { value: '50K+', label: 'Reports Filed' },
                  { value: '12K+', label: 'Active Users' },
                  { value: '99.9%', label: 'Accuracy' },
                ].map((stat, i) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — CSS UI Preview Cards */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
                  <Image src="/landing/hero.png" alt="Vehicle Verification" width={600} height={450} className="w-full h-auto block rounded-2xl" priority />
                </div>

                {/* Floating badge — top right */}
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-slate-100 flex items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                  <div><p className="text-[11px] font-bold text-slate-900">Admin Approved</p><p className="text-[9px] text-slate-500">2 reports verified</p></div>
                </motion.div>

                {/* Floating badge — bottom left */}
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
                  className="absolute -bottom-3 -left-4 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-slate-100 flex items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-indigo-600" /></div>
                  <div><p className="text-[11px] font-bold text-slate-900">99.9% Accurate</p><p className="text-[9px] text-slate-500">Verified data</p></div>
                </motion.div>

                {/* Decorative gradient ring behind card */}
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100/40 via-violet-100/20 to-cyan-100/30 rounded-3xl -z-10 blur-sm" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-6 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {['Insurance Companies', 'Car Dealerships', 'Private Buyers', 'Auto Workshops', 'Fleet Managers'].map(label => (
            <span key={label} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
          ))}
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/20 to-white -z-10" />
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
              <Zap className="w-3.5 h-3.5" />Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Everything you need for{' '}<br className="hidden md:block" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">vehicle transparency</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Our platform combines crowdsourced data with rigorous moderation to deliver the most trustworthy accident histories available.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Admin-Verified Reports', desc: 'Every single report goes through rigorous admin moderation before publication, ensuring maximum accuracy, reliability, and trust.', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50' },
              { icon: Search, title: 'Instant VIN Search', desc: 'Search by VIN or license plate and get full accident history with photos, severity ratings, damage descriptions, and repair documentation.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
              { icon: DollarSign, title: 'Earn Rewards', desc: 'Contributors earn real cash payouts for every approved accident report. Help build India\'s largest verified vehicle accident database.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
              { icon: Camera, title: 'Photo Evidence', desc: 'Every report includes multiple high-resolution photographs of damage, providing visual proof alongside written accident descriptions.', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
              { icon: Lock, title: 'Encrypted & Secure', desc: 'All data is encrypted end-to-end. Your searches are private and confidential. We never share personal information with third parties.', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50' },
              { icon: Globe, title: 'Pan-India Coverage', desc: 'Growing nationwide with contributors across every state and union territory. The most comprehensive vehicle accident database in India.', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50' },
            ].map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} [&>*]:stroke-current`} style={{ color: feature.color.includes('indigo') ? '#4f46e5' : feature.color.includes('emerald') ? '#059669' : feature.color.includes('amber') ? '#d97706' : feature.color.includes('violet') ? '#7c3aed' : feature.color.includes('cyan') ? '#0891b2' : '#e11d48' }} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-6 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              How it <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Three simple steps to verify any vehicle's accident history</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter VIN or Plate', desc: 'Input the vehicle identification number or license plate to instantly begin your comprehensive search.', icon: Search },
              { step: '02', title: 'Review Full History', desc: 'Browse verified reports including photos, severity details, repair info, and damage descriptions from verified contributors.', icon: Eye },
              { step: '03', title: 'Decide Confidently', desc: 'Make informed buying, selling, or insurance decisions backed by real verified data — no guesswork, just facts.', icon: CheckCircle2 },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-extrabold shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Feature Showcase */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-violet-100/50 to-indigo-100/30 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6 border border-emerald-100">
              <Search className="w-3.5 h-3.5" />Powerful Search
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              Find any vehicle's{' '}<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">complete history</span>
            </h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Our powerful search engine lets you look up any vehicle using its VIN or license plate number. Get instant access to verified accident reports, photos, and damage assessments.
            </p>
            <div className="space-y-4">
              {[
                'Instant VIN and license plate lookup',
                'Detailed damage photos and severity ratings',
                'Full timeline of all reported incidents',
                'Save and bookmark reports for later',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-slate-600 font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/subscriber/search" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20">
              Try Vehicle Search <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-slate-200/50 p-6 shadow-2xl shadow-emerald-600/5">
              <Image src="/landing/search.png" alt="Vehicle Search Feature" width={700} height={500} className="rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workshop Section */}
      <section id="workshops" className="py-28 px-6 bg-gradient-to-br from-orange-50 via-amber-50/50 to-white relative overflow-hidden">
        <div className="absolute left-0 top-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-100/60 to-orange-100/30 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-slate-200/50 p-6 shadow-2xl shadow-amber-600/5">
              <Image src="/landing/workshop.png" alt="Auto Workshop" width={700} height={500} className="rounded-2xl" />
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-6 border border-amber-100">
              <Wrench className="w-3.5 h-3.5" />For Workshops
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              List your <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">workshop</span> and get discovered
            </h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Auto workshop owners can register their business on our platform. List your shop with details, location, photos, and services — and reach thousands of vehicle owners searching for nearby repair shops.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: MapPin, title: 'Location-Based', desc: 'Found by state & district' },
                { icon: Camera, title: 'Photo Gallery', desc: 'Showcase your workshop' },
                { icon: Users, title: 'Reach Customers', desc: 'Get discovered by owners' },
                { icon: Star, title: 'Build Reputation', desc: 'Grow your business online' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-amber-600" /></div>
                  <div><p className="font-semibold text-slate-900 text-sm">{item.title}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/20">
              Register Workshop <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* User Roles Strip */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-violet-50/20 to-white -z-10" />
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Built for <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">everyone</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Whether you&apos;re buying, contributing, or repairing — we&apos;ve got you covered.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'Subscriber', icon: Search, desc: 'Search vehicles by VIN or plate, access verified accident histories, save reports for later, and find nearby workshops.', color: 'from-indigo-500 to-violet-500', bg: 'from-indigo-50 to-violet-50', features: ['Unlimited searches', 'Save & bookmark reports', 'Find workshops'] },
              { role: 'Contributor', icon: Award, desc: 'Submit accident reports with photos and earn real rewards for every verified submission that passes admin moderation.', color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', features: ['Earn real payouts', 'Track your reports', 'Build your reputation'] },
              { role: 'Workshop Owner', icon: Wrench, desc: 'Register your workshop with location, services, and photos. Get discovered by vehicle owners searching for repair services.', color: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', features: ['List your business', 'Upload shop photos', 'Reach new customers'] },
            ].map((item, i) => (
              <motion.div key={item.role} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className={`bg-gradient-to-br ${item.bg} p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{item.role}</h3>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Loved by <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">thousands</span>
            </h2>
            <p className="text-slate-500 text-lg">What our users are saying about Vehicle Verify</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rajesh K.', role: 'Car Buyer', quote: 'Saved me from buying a car with hidden accident damage. The detailed report with photos was incredibly helpful.', stars: 5 },
              { name: 'Priya S.', role: 'Contributor', quote: 'I\'ve earned over ₹15,000 submitting accident reports. The payout system is fast and the process is simple.', stars: 5 },
              { name: 'Arjun M.', role: 'Workshop Owner', quote: 'Listing my workshop brought in 30% more customers. Vehicle owners find us easily through the platform.', stars: 5 },
            ].map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 h-full hover:shadow-lg transition-all">
                  <div className="flex gap-1 mb-4">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                  <p className="text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                    <div><p className="font-bold text-slate-900 text-sm">{t.name}</p><p className="text-xs text-slate-500">{t.role}</p></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 rounded-[2rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-indigo-600/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
                <Sparkles className="w-8 h-8 text-indigo-200 mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-white tracking-tight">
                  Ready to verify a vehicle?
                </h2>
                <p className="text-indigo-200 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
                  Join thousands of smart buyers who check vehicle histories before making a purchase. Start your search for free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/subscriber/search" className="px-10 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-0.5">
                    Search Vehicles
                  </Link>
                  <Link href="/register" className="px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-base hover:bg-white/20 transition-all border border-white/20">
                    Create Free Account
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Vehicle<span className="text-indigo-600">Verify</span></span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-6">
                India's most trusted platform for vehicle accident history verification. Powered by contributors, trusted by thousands of buyers.
              </p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                  <a key={social} href="#" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-indigo-50 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors text-xs font-bold">{social[0]}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-900">Product</h4>
              <ul className="space-y-3 text-slate-500 text-sm">
                <li><Link href="/subscriber/search" className="hover:text-indigo-600 transition-colors">Search Vehicles</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600 transition-colors">For Contributors</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600 transition-colors">For Workshops</Link></li>
                <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-900">Legal</h4>
              <ul className="space-y-3 text-slate-500 text-sm">
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© 2024 VehicleVerify. All rights reserved.</p>
            <p className="text-sm text-slate-400">Made with <Heart className="w-3 h-3 inline text-rose-400 fill-rose-400" /> in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
