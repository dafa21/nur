/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { 
  Stethoscope, 
  Zap, 
  Brain, 
  Cloud, 
  Satellite, 
  HeartPulse, 
  Pill, 
  Users, 
  Phone, 
  Instagram, 
  Globe, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Sun,
  HandHeart,
  Menu,
  X
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { DeploymentMap } from "./components/DeploymentMap";
import { WhatsAppWidget } from "./components/WhatsAppWidget";
import { AIAssistantWidget } from "./components/AIAssistantWidget";

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12">
    {subtitle && <p className="text-med-blue font-semibold tracking-wider text-sm uppercase mb-2">{subtitle}</p>}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-display font-bold text-slate-900"
    >
      {children}
    </motion.h2>
  </div>
);

const ServiceCard = ({ icon: Icon, title, items }: { icon: any, title: string, items: string[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full"
  >
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-med-blue mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-display font-bold mb-4 text-slate-800">{title}</h3>
    <ul className="space-y-3 flex-grow">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start text-sm text-slate-600">
          <span className="text-med-green mt-1 mr-2">•</span>
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

const ServiceCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full animate-pulse">
    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-6"></div>
    <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-6"></div>
    <div className="space-y-4 flex-grow">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div className="w-2 h-2 bg-slate-200 rounded-full mr-3"></div>
          <div className="h-3 bg-slate-100 rounded-md w-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    // Simulate loading performance for services
    const timer = setTimeout(() => {
      setIsLoadingServices(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-med-blue">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-med-blue z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-bottom border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img src="/nurr.png" alt="Nur Health Logo" className="h-16 md:h-20 w-auto object-contain drop-shadow-sm" />
              <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                NUR <span className="text-med-blue">Health</span>
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {["Innovation", "Problem", "Services", "Impact", "Contact"].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-med-blue font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              <button className="bg-med-blue text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                Contact Us
              </button>
            </div>

            {/* Mobile Nav Toggle */}
            <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-bottom border-slate-100 px-4 py-6"
          >
            {["Innovation", "Problem", "Services", "Impact", "Contact"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="block py-3 text-slate-600 font-medium border-bottom border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="w-full mt-4 bg-med-blue text-white py-3 rounded-xl font-bold">
              Contact Us
            </button>
          </motion.div>
        )}
      </nav>

      <main className="pt-20">
        {/* Section: Hero */}
        <section id="innovation" className="relative h-[90vh] overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1920" 
              className="w-full h-full object-cover" 
              alt="Modular Medical Hub" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-med-blue px-4 py-2 rounded-full mb-6 font-semibold text-sm">
                <Zap size={16} />
                <span>Modular Medical Innovation</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight text-slate-900 mb-6">
                Menyatukan Digital Nomad & <span className="text-med-blue">Masyarakat Lokal</span> Melalui Inovasi Medis Modular.
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light">
                Gagasan inovatif oleh LAZNAS Dewan Dakwah yang menggabungkan AI, energi terbarukan, 
                dan nilai spiritual untuk menjangkau masyarakat di pelosok nusantara.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-med-blue text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center group">
                  Pelajari Inovasi
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                  Hubungi Kami
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section: Problem */}
        <section id="problem" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <SectionTitle subtitle="Latar Belakang">The Problem</SectionTitle>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="bg-red-50 p-3 rounded-xl text-red-600 mr-4">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Ketimpangan Akses Kesehatan</h4>
                      <p className="text-slate-600">80% masyarakat lokal enggan tinggal di daerah terpencil karena kurangnya fasilitas kesehatan yang memadai.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-50 p-3 rounded-xl text-red-600 mr-4">
                      <ArrowRight size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Waktu Perjalanan Ekstrem</h4>
                      <p className="text-slate-600">Penduduk setempat harus menempuh perjalanan 3-5 jam hanya untuk mencapai rumah sakit terdekat.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-50 p-3 rounded-xl text-red-600 mr-4">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Krisis Pembangunan</h4>
                      <p className="text-slate-600">Pembangunan rumah sakit konvensional mahal, lambat, dan seringkali tidak ramah lingkungan untuk daerah terpencil.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-[500px]">
                <motion.div 
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  viewport={{ once: true }}
                  className="rounded-3xl overflow-hidden shadow-2xl relative bg-slate-200 h-full"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Salut_village_110716-15892_sntong.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Rumah di pedalaman yang sulit diakses" referrerPolicy="no-referrer" />
                </motion.div>
                <motion.div 
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="rounded-3xl overflow-hidden shadow-2xl relative bg-slate-200 h-full mt-12"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/58/Jalan_masuk_ke_Purnamasari-Kikim_Barat.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Kondisi jalur pedesaan yang sulit diakses" referrerPolicy="no-referrer" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Solution */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 z-0">
             <div className="absolute inset-0 bg-gradient-to-l from-med-blue to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <p className="text-med-green font-semibold tracking-wider text-sm uppercase mb-2">Inovasi Kami</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold">The Game Changer</h2>
              <p className="text-slate-400 mt-4 max-w-2xl mx-auto">AI & Solar-Powered Innovation for a healthier future.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Modular Design",
                  desc: "Dapat diterapkan hanya dalam 48 jam di mana saja di dunia dengan proses instalasi yang efisien.",
                  color: "blue"
                },
                {
                  icon: Brain,
                  title: "AI-Powered",
                  desc: "Diagnosis mandiri berakurasi tinggi dengan sensor cerdas yang terhubung dengan database cloud.",
                  color: "green"
                },
                {
                  icon: Sun,
                  title: "100% Green Energy",
                  desc: "Ditenagai panel surya dan konektivitas satelit, ideal untuk daerah yang minim infrastruktur.",
                  color: "yellow"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 text-white`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Service Pillars */}
        <section id="services" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <SectionTitle subtitle="Layanan Utama">Service Pillars</SectionTitle>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px]">
              {isLoadingServices ? (
                <>
                  <ServiceCardSkeleton />
                  <ServiceCardSkeleton />
                  <ServiceCardSkeleton />
                  <ServiceCardSkeleton />
                </>
              ) : (
                <>
                  <ServiceCard 
                    icon={Satellite}
                    title="Layanan Medis Jarak Jauh"
                    items={[
                      "Tele-konsultasi dokter spesialis",
                      "Pemeriksaan vital sign AI",
                      "Tele-auskultasi digital",
                      "Skrining kesehatan dasar instan"
                    ]}
                  />
                  <ServiceCard 
                    icon={Pill}
                    title="Smart Dispensary"
                    items={[
                      "Farmasi terpadu modern",
                      "Pemberian resep digital",
                      "Penyediaan obat esensial",
                      "Nur Box aftercare package"
                    ]}
                  />
                  <ServiceCard 
                    icon={HandHeart}
                    title="Spiritual Wellness"
                    items={[
                      "Health Literacy oleh Dai",
                      "Konseling Psikospiritual",
                      "The Healing Touch (Ustadz)",
                      "Program Anti-Stunting terpadu"
                    ]}
                  />
                  <ServiceCard 
                    icon={Cloud}
                    title="Smart Referral"
                    items={[
                      "Rekam medis berbasis cloud",
                      "Sistem rujukan darurat cepat",
                      "Koordinasi sistem ambulans",
                      "Data kesehatan terenkripsi"
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Section: Specs & Pricing */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-12 md:p-20 text-white">
                  <span className="text-med-green font-bold text-sm tracking-widest uppercase mb-4 block">Future Proof Package</span>
                  <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Technical Specs & Pricing</h2>
                  <div className="space-y-6 mb-12">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-2xl font-bold font-display">Paket "LITE"</h4>
                        <span className="bg-med-green text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">Best for Starters</span>
                      </div>
                      <p className="text-3xl font-bold text-med-green mb-2">Rp330 - 450 Juta</p>
                      <p className="text-slate-400 text-sm italic">Fokus pada dampak awal dengan diagnostik penting.</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Modular Medical Hub (LITE)",
                      "AI Diagnostic Suite",
                      "Solar Panel Infrastructure",
                      "Satellite Communication Link",
                      "Tele-med Area & Exam Zone"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-slate-300">
                        <ShieldCheck className="text-med-green mr-3" size={20} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative min-h-[400px]">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt="Interior Hub Technology" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Business Model & Impact */}
        <section id="impact" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              <div className="order-2 md:order-1">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-med-blue/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=1000" 
                    className="relative rounded-[2.5rem] shadow-2xl w-full" 
                    alt="Positive Social Impact" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-med-green/20 text-med-green rounded-lg flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Community Happy</p>
                        <p className="text-sm font-bold text-slate-900">10k+ Services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <SectionTitle subtitle="Keberlanjutan">Business Model & Impact</SectionTitle>
                <div className="space-y-10">
                  <div>
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-3 flex items-center">
                      <ArrowRight className="text-med-blue mr-2" size={20} />
                      Skema Revenue
                    </h4>
                    <p className="text-slate-600 leading-relaxed font-light">
                      Menggunakan model berlangganan yang transparan dan kemitraan strategis dengan perusahaan asuransi untuk memastikan kelangsungan operasional jangka panjang.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-3 flex items-center">
                      <ArrowRight className="text-med-blue mr-2" size={20} />
                      Social Impact
                    </h4>
                    <p className="text-slate-600 leading-relaxed font-light">
                      Seluruh keuntungan operasional dialokasikan kembali untuk mendanai layanan kesehatan gratis bagi komunitas lokal di daerah terpencil.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm italic text-slate-700 relative">
                    <span className="absolute -top-4 -left-2 text-6xl text-blue-100 font-serif leading-none italic select-none">“</span>
                    "Layanan NUR Health Connection bukan hanya tentang Curing (Teknologi), tapi juga Healing (Spiritual)."
                  </div>
                </div>
              </div>
            </div>

            {/* Deployment Map */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <p className="text-med-green font-semibold tracking-wider text-sm uppercase mb-2">Sebaran Wilayah</p>
                <h3 className="text-3xl font-display font-bold text-slate-900">Jejaring NUR Health Hub</h3>
                <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Membentang dari Sumatera hingga Papua, membawa akses layanan kesehatan dan spiritualitas di setiap titik 3T (Terdepan, Terluar, Tertinggal).</p>
              </div>
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
              >
                <DeploymentMap />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section: CTA / Final */}
        <section id="contact" className="py-24 bg-med-blue text-white overflow-hidden relative">
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-med-blue/90 z-10" />
             <img src="https://images.unsplash.com/photo-1506701908217-ef654282364e?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover blur-sm" alt="Hopeful Sunrise in Indonesia" referrerPolicy="no-referrer" />
           </div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
              >
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Ready to Connect for Healthier Future?</h2>
                <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-light">
                  Mari kita bersama-sama membangun masa depan kesehatan tanpa batas. Inovasi untuk umat, dari LAZNAS Dewan Dakwah.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                   <a href="tel:+6281319865231" className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={24} />
                      </div>
                      <p className="font-bold">+62-813-1986-5231</p>
                      <p className="text-xs text-blue-200 uppercase mt-1">WhatsApp</p>
                   </a>
                   <a href="https://instagram.com/nurhealthconnection" className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Instagram size={24} />
                      </div>
                      <p className="font-bold">@nurhealthconnection</p>
                      <p className="text-xs text-blue-200 uppercase mt-1">Instagram</p>
                   </a>
                   <a href="https://laznasdewandakwah.or.id" className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe size={24} />
                      </div>
                      <p className="font-bold">laznasdewandakwah.or.id</p>
                      <p className="text-xs text-blue-200 uppercase mt-1">Website</p>
                   </a>
                </div>
              </motion.div>
           </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-6 md:mb-0">
                <img src="/nurr.png" alt="NUR Health Logo" className="h-14 md:h-16 w-auto object-contain drop-shadow-md" />
                <span className="font-display font-bold text-white text-xl lg:text-2xl tracking-wide">NUR Health Connection</span>
              </div>
              <div className="flex space-x-8 mb-6 md:mb-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">FAQs</a>
              </div>
              <p>© 2026 NUR Health Connection. Modular Medical Innovation by LAZNAS Dewan Dakwah.</p>
           </div>
        </div>
      </footer>
      <WhatsAppWidget />
      <AIAssistantWidget />
    </div>
  );
}
