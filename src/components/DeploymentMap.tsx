import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Users, Activity, CheckCircle2, MapPin, X, ArrowRight, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Thermometer, Share2, Check, Stethoscope, FileText, HeartPulse, ChevronDown, ChevronUp, Search, Pill, FlaskConical, AlertCircle, Heart, Calendar, Wind, Scale, Eye } from 'lucide-react';

const panelVariants: any = {
  initial: { opacity: 0, x: 30, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    x: 0, 
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 25, stiffness: 200 } 
  },
  exit: { opacity: 0, x: 30, filter: 'blur(10px)' }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

// Component to handle map center changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 6, { 
    animate: true,
    duration: 1.5
  });
  return null;
}

// Weather Widget Component
function WeatherWidget({ lat, lng }: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: data.current_weather.temperature,
          code: data.current_weather.weathercode,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={20} className="text-amber-500" />;
    if (code >= 1 && code <= 3) return <Cloud size={20} className="text-slate-400" />;
    if (code >= 51 && code <= 67) return <CloudRain size={20} className="text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow size={20} className="text-blue-200" />;
    if (code >= 95) return <CloudLightning size={20} className="text-purple-500" />;
    return <Cloud size={20} className="text-slate-400" />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "Cerah";
    if (code >= 1 && code <= 3) return "Berawan";
    if (code >= 51 && code <= 67) return "Hujan";
    if (code >= 71 && code <= 77) return "Salju";
    if (code >= 95) return "Badai";
    return "Berawan";
  };

  if (loading) return (
    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
      <div className="text-right animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-14 ml-auto"></div>
      </div>
    </div>
  );

  if (!weather) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
          {getWeatherIcon(weather.code)}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{getWeatherText(weather.code)}</p>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kondisi Cuaca Saat Ini</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-med-blue flex items-center justify-end">
          <Thermometer size={16} className="mr-1 opacity-50" />
          {weather.temp}°C
        </p>
      </div>
    </motion.div>
  );
}

// Custom Icons for Active vs Planned (Beautiful vector location pin)
const createCustomIcon = (color: string) => {
  const svgHtml = `
    <div class="map-pin-wrapper" style="filter: drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.3)); display: flex; align-items: center; justify-content: center; width: 36px; height: 42px;">
      <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer pin glow border -->
        <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 15.6 40.7 17.15 41.78C17.66 42.13 18.34 42.13 18.85 41.78C20.4 40.7 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" />
        <!-- Inner circular dot representing the clinic center -->
        <circle cx="18" cy="18" r="5" fill="#FFFFFF" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-icon-pin',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38]
  });
};

// Custom Cluster Icon
const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div class="custom-marker-cluster-inner"><span>${cluster.getChildCount()}</span></div>`,
    className: 'custom-marker-cluster',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

function getGroupedPatients(patients: any[]) {
  if (!patients) return [];
  const groups: { [key: string]: any } = {};
  
  patients.forEach((p) => {
    const key = p.rm_number || p.name;
    if (!groups[key]) {
      groups[key] = {
        id: key,
        rm_number: p.rm_number,
        name: p.name,
        age: p.age,
        gender: p.gender,
        is_pregnant: p.is_pregnant,
        visits: []
      };
    }
    groups[key].visits.push(p);
  });
  
  return Object.values(groups);
}

function getUsgImages(imgField: any): string[] {
  if (!imgField) return [];
  if (Array.isArray(imgField)) return imgField;
  if (typeof imgField === 'string') {
    try {
      const parsed = JSON.parse(imgField);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      if (imgField.startsWith('data:') || imgField.length > 100) {
        return [imgField];
      }
    }
  }
  return [];
}

function PatientList({ patients }: { patients: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<{ [patientId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const grouped = useMemo(() => {
    return getGroupedPatients(patients);
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return grouped;
    const query = searchQuery.toLowerCase();
    return grouped.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.rm_number?.toLowerCase().includes(query)
    );
  }, [grouped, searchQuery]);

  // Render vitals blocks with high-contrast, clean layout
  const renderVitals = (vitals: any) => {
    if (!vitals) return null;
    const items = [
      { label: 'Suhu Tubuh', value: vitals.temperature, unit: ' °C', color: 'text-amber-700 bg-amber-50/70 border-amber-100', icon: <Thermometer size={14} /> },
      { label: 'Tekanan Darah (Tensi)', value: vitals.blood_pressure, unit: ' mmHg', color: 'text-blue-700 bg-blue-50/70 border-blue-100', icon: <Activity size={14} /> },
      { label: 'Detak Jantung (Nadi)', value: vitals.heart_rate, unit: ' bpm', color: 'text-rose-700 bg-rose-50/70 border-rose-100', icon: <Heart size={14} /> },
      { label: 'Frekuensi Napas', value: vitals.respiratory_rate, unit: ' x/mnt', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-100', icon: <Wind size={14} /> },
      { label: 'Saturasi Oksigen (SpO2)', value: vitals.oxygen_saturation, unit: ' %', color: 'text-indigo-700 bg-indigo-50/70 border-indigo-100', icon: <Activity size={14} /> },
      { label: 'Berat / Tinggi Badan', value: (vitals.weight || vitals.height) ? `${vitals.weight || '-'} kg / ${vitals.height || '-'} cm` : null, unit: '', color: 'text-purple-700 bg-purple-50/70 border-purple-100', icon: <Scale size={14} /> },
    ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

    if (items.length === 0) return null;

    return (
      <div className="mt-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center">
          <HeartPulse size={12} className="mr-1.5 text-rose-500" /> Tanda-Tanda Vital (Vitals)
        </span>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:bg-white shadow-sm hover:shadow-md ${item.color}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">{item.label}</span>
              <div className="flex items-center space-x-1.5 mt-1.5">
                {item.icon}
                <span className="font-extrabold text-sm text-slate-900 leading-none">{item.value}{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // SOAP details
  const renderSOAP = (soap: any) => {
    if (!soap) return null;
    const sections = [
      { key: 'S', title: 'Subjektif (S)', subtitle: 'Keluhan & Gejala Pasien', value: soap.subjective, color: 'text-teal-600 bg-teal-50 border-teal-100 shadow-teal-100/10' },
      { key: 'O', title: 'Objektif (O)', subtitle: 'Pemeriksaan Fisik / Fisikwi', value: soap.objective, color: 'text-sky-600 bg-sky-50 border-sky-100 shadow-sky-100/10' },
      { key: 'A', title: 'Asesmen (A)', subtitle: 'Peta Penyakit & Diagnosis', value: soap.assessment, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-100/10', diagnosis: soap.diagnosis },
      { key: 'P', title: 'Rencana / Plan (P)', subtitle: 'Asuhan Medis & Terapi', value: soap.plan, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/10' }
    ].filter(s => s.value);

    return (
      <div className="mt-3.5 space-y-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center">
          <FileText size={12} className="mr-1.5 text-indigo-500" /> Dokumentasi Rekam Medis (SOAP)
        </span>
        
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200/60 p-3 hover:shadow-sm transition-all">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] bg-slate-100 text-slate-700 select-none">
                {sec.key}
              </span>
              <div className="flex items-center justify-between flex-grow">
                <div>
                  <h6 className="text-[11px] font-black text-slate-800 leading-none">{sec.title}</h6>
                  <p className="text-[8px] text-slate-400 font-semibold leading-none mt-0.5">{sec.subtitle}</p>
                </div>
                {sec.key === 'A' && sec.diagnosis && (
                  <span className="bg-amber-100/80 border border-amber-200 text-amber-800 text-[9px] font-black px-1.5 rounded uppercase leading-none py-0.5">ICD-10: {sec.diagnosis}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-700 mt-2 font-medium bg-slate-50/50 p-2 border border-slate-100 rounded-lg max-h-32 overflow-y-auto w-full leading-relaxed whitespace-pre-wrap">
              {sec.value}
            </p>
          </div>
        ))}

        {/* Prescription, Referrals etc if fields are filled */}
        {(soap.medication || soap.lab_orders || soap.radiology_orders || soap.followup_recommendations) && (
          <div className="border border-indigo-100 bg-slate-50/50 p-3 rounded-xl mt-3 space-y-2">
            <span className="text-[10px] font-black text-indigo-700 tracking-wider flex items-center mb-1">
              <Pill size={12} className="mr-1 text-indigo-500" /> Rencana Lanjutan
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {soap.medication && (
                <div className="text-xs flex items-start space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p className="text-slate-700 font-semibold text-[11px]"><strong className="text-slate-400 font-semibold">Resep:</strong> {soap.medication}</p>
                </div>
              )}
              {soap.followup_recommendations && (
                <div className="text-xs flex items-start space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-slate-700 font-semibold text-[11px]"><strong className="text-slate-400 font-semibold">Kontrol:</strong> {soap.followup_recommendations}</p>
                </div>
              )}
              {soap.lab_orders && (
                <div className="text-xs flex items-start space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <p className="text-slate-700 font-semibold text-[11px]"><strong className="text-slate-400 font-semibold">Rencana Lab:</strong> {soap.lab_orders}</p>
                </div>
              )}
              {soap.radiology_orders && (
                <div className="text-xs flex items-start space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <p className="text-slate-700 font-semibold text-[11px]"><strong className="text-slate-400 font-semibold">Rencana Rad:</strong> {soap.radiology_orders}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOAP USG Image & Notes */}
        {(soap.usg_image || soap.usg_image_notes) && (
          <div className="border border-indigo-100 bg-slate-50/50 p-3 rounded-xl mt-3 space-y-2">
            <span className="text-[10px] font-black text-indigo-700 tracking-wider flex items-center mb-1">
              <Eye size={12} className="mr-1.5 text-indigo-500" /> Hasil Pemeriksaan USG (Kunjungan)
            </span>
            {soap.usg_image && (
              <div className="flex flex-col gap-2 mt-1 justify-center bg-black/95 p-2 rounded-xl">
                {getUsgImages(soap.usg_image).map((img, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <img 
                      src={img} 
                      alt={`USG Soap Record ${i+1}`} 
                      className="max-h-60 rounded-lg object-contain border border-slate-750"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
            {soap.usg_image_notes && (
              <div className="text-[11px] text-slate-700 bg-white p-2 border border-slate-150 rounded-lg">
                <strong className="text-slate-400 text-[9px] font-black uppercase block tracking-wider mb-1">Catatan Diagnostik USG:</strong>
                <p className="italic font-medium leading-relaxed">{soap.usg_image_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderANC = (anc: any, ancRecords: any[]) => {
    if (!anc) return null;
    
    const usgImages = getUsgImages(anc.usg_image);

    const infoItems = [
      { label: 'Gestational Age', value: anc.gestational_age ? `${anc.gestational_age} Minggu` : null, color: 'text-rose-700 bg-rose-50/60 border-rose-150' },
      { label: 'HPL / Taksiran Lahir', value: anc.estimated_delivery_date, color: 'text-indigo-700 bg-indigo-50/60 border-indigo-150' },
      { label: 'HPHT', value: anc.hpht, color: 'text-slate-700 bg-slate-50/60 border-slate-150' },
      { label: 'TFU (Tinggi Fundus)', value: anc.tfu ? `${anc.tfu} cm` : null, color: 'text-emerald-700 bg-emerald-50/60 border-emerald-150' },
      { label: 'DJJ (Denyut Jantung)', value: anc.djj ? `${anc.djj} bpm` : null, color: 'text-blue-700 bg-blue-50/60 border-blue-150' },
      { label: 'Poedji Rochjati Score', value: anc.poedji_rochjati_score, color: 'text-amber-700 bg-amber-50/60 border-amber-150' },
    ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

    const biometryItems = [
      { code: 'BPD', name: 'Biparietal Diameter', value: anc.usg_bpd, unit: 'mm' },
      { code: 'HC', name: 'Head Circumference', value: anc.usg_hc, unit: 'mm' },
      { code: 'AC', name: 'Abdominal Circumference', value: anc.usg_ac, unit: 'mm' },
      { code: 'FL', name: 'Femur Length', value: anc.usg_fl, unit: 'mm' },
      { code: 'TBJ', name: 'Taksiran Berat Janin', value: anc.usg_tbj, unit: 'gram' },
      { code: 'AFI', name: 'Amniotic Fluid Index', value: anc.usg_afi, unit: 'cm' },
    ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

    const otherObservations = [
      { label: 'Letak Plasenta', value: anc.usg_placenta },
      { label: 'Presentasi Janin', value: anc.usg_presentation },
    ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

    return (
      <div className="mt-3.5 space-y-3.5 border-t border-slate-200/65 pt-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center">
          <HeartPulse size={12} className="mr-1.5 text-rose-500" /> Pemantauan Kehamilan & USG Terpadu
        </span>

        {infoItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {infoItems.map((item, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-between hover:bg-white shadow-sm transition-all ${item.color}`}>
                <span className="text-[8.5px] font-bold uppercase tracking-wider opacity-85 leading-none">{item.label}</span>
                <span className="font-extrabold text-xs text-slate-900 mt-1.5 leading-none">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {anc.fetal_development && (
          <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-3">
            <h6 className="text-[9.5px] uppercase font-black text-rose-600 mb-1 flex items-center tracking-widest leading-none">
              <Activity size={12} className="mr-1.5 text-rose-500" /> Deskripsi Perkembangan Janin
            </h6>
            <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
              {anc.fetal_development}
            </p>
          </div>
        )}

        {biometryItems.length > 0 && (
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[9.5px] font-extrabold text-indigo-900 uppercase tracking-wider block mb-2 font-sans">
              Parameter Biometri USG Janin
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-sans">
              {biometryItems.map((bio, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-2 rounded-lg text-center flex flex-col justify-center">
                  <span className="text-[10px] font-black text-indigo-600">{bio.code}</span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-0.5">{bio.name}</span>
                  <span className="font-extrabold text-slate-800 text-xs mt-1.5">{bio.value} <span className="text-[8px] font-normal text-slate-400">{bio.unit}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {otherObservations.length > 0 && (
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 grid grid-cols-2 gap-2">
            {otherObservations.map((obs, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase">{obs.label}</span>
                <span className="font-black text-slate-800 text-xs mt-1">{obs.value}</span>
              </div>
            ))}
          </div>
        )}

        {usgImages.length > 0 && (
          <div className="border border-indigo-100 bg-slate-900/95 p-3 rounded-xl mt-2 flex flex-col items-center">
            <span className="text-[9.5px] font-bold text-indigo-300 tracking-wider flex items-center mb-2 mr-auto">
              <Eye size={12} className="mr-1.5 text-indigo-400" /> Hasil Citra Diagnostik USG Obstetri
            </span>
            <div className="w-full flex flex-col gap-2 justify-center">
              {usgImages.map((img, i) => (
                <div key={i} className="flex flex-col items-center bg-black/40 rounded-lg p-1">
                  <img 
                    src={img} 
                    alt={`Citra USG ${i+1}`} 
                    className="max-h-64 object-contain rounded border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[8px] text-slate-400 font-mono mt-1">Citra Diagnostik USG #{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(anc.leopold_1 || anc.leopold_2 || anc.leopold_3 || anc.leopold_4) && (
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider block mb-2 font-sans">
              Hasil Palpasi Pemeriksaan Leopold
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              {anc.leopold_1 && (
                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Leopold I</span>
                  <p className="text-slate-705 font-semibold text-[10px] leading-normal">{anc.leopold_1}</p>
                </div>
              )}
              {anc.leopold_2 && (
                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Leopold II</span>
                  <p className="text-slate-705 font-semibold text-[10px] leading-normal">{anc.leopold_2}</p>
                </div>
              )}
              {anc.leopold_3 && (
                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Leopold III</span>
                  <p className="text-slate-705 font-semibold text-[10px] leading-normal">{anc.leopold_3}</p>
                </div>
              )}
              {anc.leopold_4 && (
                <div className="bg-white border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Leopold IV</span>
                  <p className="text-slate-705 font-semibold text-[10px] leading-normal">{anc.leopold_4}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (grouped.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-5 bg-slate-50 rounded-2xl border border-slate-100 italic font-medium">
        Belum ada data pasien terpadu
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Patient Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={14} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama pasien atau No RM..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-med-blue focus:bg-white transition-all font-medium text-slate-800"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Patient Cards List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200/60">
            <span className="text-xs text-slate-460 text-slate-400 font-medium italic">Nama atau No RM tidak ditemukan</span>
          </div>
        ) : (
          filteredPatients.map(p => {
            const isExpanded = expandedId === p.id;
            const visits = p.visits;
            
            // Current visit selection state
            const currentVisitId = selectedVisitId[p.id] !== undefined ? selectedVisitId[p.id] : visits[0]?.id;
            const currentVisit = visits.find((v: any) => v.id === currentVisitId) || visits[0];

            const lastVitals = currentVisit?.vitals?.[0];
            const lastSoap = currentVisit?.soaps?.[0];
            const lastAnc = currentVisit?.anc || p.anc;
            const lastAncRecords = currentVisit?.anc_records || p.anc_records;

            return (
              <motion.div 
                key={p.id} 
                layout="position"
                className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${
                  isExpanded ? 'border-med-blue ring-1 ring-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Click Area */}
                <div 
                  className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                    isExpanded ? 'bg-gradient-to-r from-blue-50/20 to-indigo-50/10' : 'bg-slate-50/40 hover:bg-slate-50'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : p.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-med-blue flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0 leading-none">
                      {p.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{p.name}</span>
                        {p.is_pregnant === 1 && (
                          <span className="bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider leading-none font-sans font-extrabold">Hamil</span>
                        )}
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-lg border leading-none font-sans ${
                          p.gender === 'Laki-laki' 
                            ? 'bg-blue-50 border-blue-100 text-blue-600' 
                            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {p.gender === 'Laki-laki' ? 'L-L' : 'P-R'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1">
                        <span>No RM: {p.rm_number}</span>
                        <span>•</span>
                        <span>{p.age} thn</span>
                        <span>•</span>
                        <span className="bg-slate-100 px-1 rounded text-slate-500">{visits.length} Kunjungan</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-1 rounded-lg transition-colors text-slate-405 ${
                    isExpanded ? 'bg-blue-50 text-med-blue' : 'hover:bg-slate-100/50'
                  }`}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                
                {/* Expanded Details Pane */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="px-3 pb-3 pt-2.5 border-t border-slate-100 space-y-3"
                    >
                      {/* Visits History Timeline Pill Selector */}
                      {visits.length > 1 && (
                        <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 flex items-center space-x-1 overflow-x-auto select-none">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 px-1.5">Riwayat Kunjungan:</span>
                          {visits.map((v: any, index: number) => {
                            const isSelected = v.id === currentVisitId;
                            return (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVisitId(prev => ({ ...prev, [p.id]: v.id }))}
                                className={`px-2 py-0.5 text-[9px] font-extrabold rounded-lg transition-all shrink-0 ${
                                  isSelected 
                                    ? 'bg-med-blue text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50 bg-white border border-slate-200/40'
                                }`}
                              >
                                Kunjungan #{visits.length - index} ({v.status})
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-3.5 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100">
                        {/* Visit Info Status Bar */}
                        <div className="flex justify-between items-center text-[10px] border-b border-dashed border-slate-200 pb-2">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
                            <Calendar size={12} className="mr-1.5 text-slate-400" /> Rincian Rekam Medis Kunjungan
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg border font-black uppercase text-[8px] tracking-wider flex items-center gap-1 ${
                            currentVisit?.status === 'Selesai' 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-amber-50 border-amber-250 text-amber-800'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${currentVisit?.status === 'Selesai' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {currentVisit?.status}
                          </span>
                        </div>

                        {/* Complaint Block */}
                        <div>
                          <h6 className="text-[10px] uppercase font-black text-slate-400 mb-1 flex items-center tracking-widest leading-none">
                            <AlertCircle size={12} className="mr-1.5 text-rose-500" /> Keluhan Utama Pasien
                          </h6>
                          <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg text-xs text-slate-700 font-medium leading-relaxed">
                            {currentVisit?.complaint || <span className="text-slate-400 italic font-normal">Tidak ada keluhan utama terdaftar</span>}
                          </div>
                        </div>
                        
                        {/* Vitals */}
                        {renderVitals(lastVitals)}

                        {/* SOAP Records */}
                        {lastSoap ? (
                          renderSOAP(lastSoap)
                        ) : (
                          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-400 text-xs">
                            Kunjungan ini belum memiliki rekam SOAP Dokter
                          </div>
                        )}

                        {/* ANC / Pregnancy Records */}
                        {lastAnc && renderANC(lastAnc, lastAncRecords)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ClinicDetailModal({ 
  location, 
  onClose 
}: { 
  location: Location; 
  onClose: () => void; 
}) {
  const clinic = location.raw || {};
  const patients = clinic.patients || [];
  const [activeTab, setActiveTab] = useState<'medical' | 'financial'>('medical');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Group patients helper
  const groupedPatients = useMemo(() => {
    return getGroupedPatients(patients);
  }, [patients]);

  const filteredGroupedPatients = useMemo(() => {
    if (!searchTerm.trim()) return groupedPatients;
    const query = searchTerm.toLowerCase();
    return groupedPatients.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.rm_number?.toLowerCase().includes(query)
    );
  }, [groupedPatients, searchTerm]);

  // Group patients by status for stats
  const paidPatients = patients.filter((p: any) => p.status === 'Selesai' || p.status === 'Lunas');
  const waitingPatients = patients.filter((p: any) => p.status === 'Menunggu');

  // Calculates rincian/detailed billing for a single patient
  const getPatientBillingDetail = (p: any) => {
    if (p.status !== 'Selesai' && p.status !== 'Lunas') {
      return {
        base: 0,
        vitals: 0,
        soap: 0,
        total: 0
      };
    }
    const billing = {
      base: 150000,
      vitals: (p.vitals && p.vitals.length > 0) ? 50000 : 0,
      soap: (p.soaps && p.soaps.length > 0) ? 100000 : 0,
      total: 0
    };
    billing.total = billing.base + billing.vitals + billing.soap;
    return billing;
  };

  const totalCalculated = paidPatients.reduce((sum: number, p: any) => {
    return sum + getPatientBillingDetail(p).total;
  }, 0);

  const finalRevenue = clinic.revenue > 0 ? clinic.revenue : totalCalculated;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl relative w-full max-w-4xl max-h-[92vh] overflow-hidden border border-slate-200/50 flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${location.status === 'active' ? 'bg-med-green' : 'bg-amber-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Detail Monitoring Terpadu
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-800 leading-none">{location.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{location.description}</p>
            {location.sponsorName && (
              <div className="flex items-center space-x-2 mt-2 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 w-fit">
                {location.sponsorLogo && (
                  <img src={location.sponsorLogo} alt={location.sponsorName} className="w-auto h-auto max-h-8 max-w-[100px] rounded object-contain bg-white px-1.5 py-0.5 border border-amber-200 shrink-0" />
                )}
                <div>
                  <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest leading-none">Sponsor</p>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">{location.sponsorName}</p>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 transition-colors rounded-full text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-grow bg-slate-100/30">
          {/* Quick Stats Grid - Highly Compact & Responsive */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <div className="bg-blue-50/50 p-2.5 sm:p-3.5 rounded-xl border border-blue-100 flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <Users size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 truncate">Total Pasien</p>
                <p className="text-sm font-extrabold text-slate-800 leading-none">{groupedPatients.length}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 sm:p-3.5 rounded-xl border border-slate-200 flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0 bg-slate-150 bg-slate-100 animate-none">
                <Info size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 truncate">Kunjungan</p>
                <p className="text-sm font-extrabold text-slate-800 leading-none">{patients.length}</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-2.5 sm:p-3.5 rounded-xl border border-emerald-100 flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 truncate">Selesai</p>
                <p className="text-sm font-extrabold text-slate-800 leading-none">{paidPatients.length}</p>
              </div>
            </div>

            <div className="bg-amber-50/50 p-2.5 sm:p-3.5 rounded-xl border border-amber-100 flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                <Activity size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 truncate">Menunggu</p>
                <p className="text-sm font-extrabold text-amber-700 leading-none">{waitingPatients.length}</p>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-2.5 sm:p-3.5 rounded-xl border border-indigo-100 flex items-center space-x-2.5 col-span-2 md:col-span-1">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                <span className="font-bold text-sm">Rp</span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 truncate">Pendapatan</p>
                <p className="text-sm font-extrabold text-slate-800 leading-none truncate">Rp {finalRevenue.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Tab Segment Selector */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('medical');
                setSearchTerm('');
              }}
              className={`flex-1 py-1.5 sm:py-2.5 rounded-lg text-center font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'medical'
                  ? 'bg-white text-med-blue shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={14} />
              <span>Rekam Medis Pasien</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('financial');
                setSearchTerm('');
              }}
              className={`flex-1 py-1.5 sm:py-2.5 rounded-lg text-center font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'financial'
                  ? 'bg-white text-med-blue shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Pill size={14} />
              <span>Rincian Transaksi Kasir</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'financial' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center">
                      <span>Rincian Pendapatan Kasir (Status Selesai)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Penetapan tarif real-time berdasarkan rekam tindakan klinik</p>
                  </div>
                  
                  {/* Search Input for Transactions */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari transaksi..."
                      className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-med-blue focus:bg-white transition-all font-medium text-slate-800"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {paidPatients.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">Belum ada transaksi pembayaran lunas.</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {paidPatients
                        .filter((p: any) => 
                          !searchTerm.trim() || 
                          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.rm_number?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((p: any) => {
                          const billing = getPatientBillingDetail(p);
                          return (
                            <div key={p.id} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs space-y-2">
                              <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1.5">
                                <div>
                                  <span className="font-bold text-slate-805 text-slate-800">{p.name}</span>
                                  <span className="text-[10px] text-slate-404 text-slate-400 ml-2">RM: {p.rm_number}</span>
                                </div>
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider shrink-0 font-bold border-none bg-none">Selesai</span>
                              </div>
                              <div className="space-y-1 text-slate-500 text-[11px]">
                                <div className="flex justify-between">
                                  <span>Biaya Konsultasi Pokok</span>
                                  <span>Rp {billing.base.toLocaleString('id-ID')}</span>
                                </div>
                                {billing.vitals > 0 && (
                                  <div className="flex justify-between">
                                    <span>Pemeriksaan Tanda Vital</span>
                                    <span>+ Rp {billing.vitals.toLocaleString('id-ID')}</span>
                                  </div>
                                )}
                                {billing.soap > 0 && (
                                  <div className="flex justify-between">
                                    <span>Tindakan / SOAP Dokter</span>
                                    <span>+ Rp {billing.soap.toLocaleString('id-ID')}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between font-bold text-slate-700 border-t border-slate-200 pt-1.5 text-xs">
                                <span>Total Pembayaran</span>
                                <span className="text-indigo-600">Rp {billing.total.toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl">
                      <span>Total Akumulasi Pendapatan</span>
                      <span className="text-base sm:text-lg font-display text-indigo-700 font-extrabold">Rp {finalRevenue.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Complete Patient Medical Records Box with Grouped History */}
            {activeTab === 'medical' && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Dashboard Rekam Medis Pasien Terpadu</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Riwayat rekam medis, status vitalitas, dan catatan SOAP per pasien</p>
                  </div>
                  
                  {/* Search Input bar */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari pasien atau No RM..."
                      className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-med-blue focus:bg-white transition-all font-medium text-slate-800"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredGroupedPatients.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">Belum ada pasien terdaftar di database.</p>
                ) : (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {filteredGroupedPatients.map((p: any) => {
                    return (
                      <div key={p.id} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
                        {/* Patient Header */}
                        <div className="flex justify-between items-start pb-2.5 border-b border-slate-200/60">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-slate-805 text-slate-800 text-sm">{p.name}</h5>
                              {p.is_pregnant === 1 && (
                                <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-bold">Hamil</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                              RM: {p.rm_number} • {p.age} Tahun • {p.gender}
                            </p>
                          </div>
                          <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                            {p.visits.length} Kunjungan
                          </span>
                        </div>

                        {/* Visits History Timeline */}
                        <div className="space-y-4 pt-1">
                          {p.visits.map((v: any, index: number) => {
                            const lastVitals = v.vitals?.[0];
                            const lastSoap = v.soaps?.[0];
                            const lastAnc = v.anc || p.anc;

                            return (
                              <div key={v.id} className="relative pl-4 border-l border-slate-200 space-y-2 last:pb-1">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-350 border-2 border-white shadow-sm bg-slate-400"></div>
                                
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-indigo-600 text-[11px]">
                                    Kunjungan #{p.visits.length - index}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                    (v.status === 'Selesai' || v.status === 'Lunas') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {v.status}
                                  </span>
                                </div>

                                <div className="text-xs space-y-2 pl-1">
                                  <div>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Keluhan Utama:</span>
                                    <p className="bg-white p-2 rounded-lg text-slate-705 border border-slate-200/60 font-medium text-xs text-slate-700">
                                      {v.complaint || '-'}
                                    </p>
                                  </div>

                                  {lastVitals && (
                                    <div>
                                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Kondisi Fisik & Vitalitas:</span>
                                      <div className="grid grid-cols-3 gap-1.5">
                                        <div className="bg-rose-50/20 p-1.5 rounded-lg border border-rose-100 text-center bg-white">
                                          <span className="text-[8px] text-slate-400 block leading-none">Suhu</span>
                                          <span className="font-bold text-slate-700 text-[10px]">{lastVitals.temperature || '-'}°C</span>
                                        </div>
                                        <div className="bg-blue-50/20 p-1.5 rounded-lg border border-blue-100 text-center bg-white">
                                          <span className="text-[8px] text-slate-400 block leading-none">Tensi</span>
                                          <span className="font-bold text-slate-700 text-[10px]">{lastVitals.blood_pressure || '-'}</span>
                                        </div>
                                        <div className="bg-emerald-50/20 p-1.5 rounded-lg border border-emerald-100 text-center bg-white">
                                          <span className="text-[8px] text-slate-400 block leading-none">Detak</span>
                                          <span className="font-bold text-slate-700 text-[10px]">{lastVitals.heart_rate || '-'} bpm</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {lastSoap && (
                                    <div className="pt-0.5">
                                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Hasil Rekam Medis (SOAP):</span>
                                      <div className="bg-white p-2.5 rounded-lg border border-slate-250/60 border-slate-200/60 space-y-1 text-[10px] leading-relaxed text-slate-600">
                                        <p><strong className="text-slate-500">S:</strong> {lastSoap.subjective || '-'}</p>
                                        <p><strong className="text-slate-500">O:</strong> {lastSoap.objective || '-'}</p>
                                        <p><strong className="text-slate-500">A:</strong> {lastSoap.assessment || '-'} {lastSoap.diagnosis && <span className="text-indigo-600 font-semibold">[ID: {lastSoap.diagnosis}]</span>}</p>
                                        <p><strong className="text-slate-500">P:</strong> {lastSoap.plan || '-'}</p>
                                        {lastSoap.created_at && (
                                          <p className="text-[8px] text-slate-400 pt-1 border-t border-dashed border-slate-100 mt-1">
                                            Waktu rilis: {lastSoap.created_at}
                                          </p>
                                        )}
                                      </div>

                                      {/* SOAP USG Image & Notes on Detailed Modal */}
                                      {(lastSoap.usg_image || lastSoap.usg_image_notes) && (
                                        <div className="bg-white p-2 rounded-lg border border-slate-200 mt-1.5 space-y-1.5 bg-slate-50/40">
                                          <span className="text-[8px] uppercase font-bold text-indigo-500 block leading-none">Pemeriksaan USG SOAP Kunjungan:</span>
                                          {lastSoap.usg_image && (
                                            <div className="flex flex-col gap-1 justify-center bg-black/95 p-1 rounded-lg">
                                              {getUsgImages(lastSoap.usg_image).map((img, i) => (
                                                <img 
                                                  key={i} 
                                                  src={img} 
                                                  alt="USG SOAP" 
                                                  className="max-h-40 rounded object-contain border border-slate-700/50"
                                                  referrerPolicy="no-referrer"
                                                />
                                              ))}
                                            </div>
                                          )}
                                          {lastSoap.usg_image_notes && (
                                            <p className="text-[9px] text-slate-605 text-slate-600 font-medium italic leading-relaxed"><strong>Catatan USG:</strong> {lastSoap.usg_image_notes}</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* ANC / Pregnancy USG Tracker in Timeline */}
                                  {lastAnc && (
                                    <div className="pt-2 border-t border-dashed border-rose-100 mt-2 bg-rose-50/20 p-2.5 rounded-xl border border-rose-100">
                                      <span className="text-[9px] uppercase font-black text-rose-500 block mb-1.5 leading-none tracking-wider">Pemantauan Kehamilan & USG (ANC):</span>
                                      
                                      <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-white p-2 rounded-lg border border-slate-200/60 font-sans">
                                        {lastAnc.gestational_age && (
                                          <div>
                                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] leading-none">Gestational Age:</span>
                                            <span className="font-extrabold text-rose-600">{lastAnc.gestational_age} Mgg</span>
                                          </div>
                                        )}
                                        {lastAnc.estimated_delivery_date && (
                                          <div>
                                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] leading-none">HPL / Taksiran Lahir:</span>
                                            <span className="font-extrabold text-indigo-600">{lastAnc.estimated_delivery_date}</span>
                                          </div>
                                        )}
                                        {lastAnc.djj && (
                                          <div>
                                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] leading-none font-sans">DJJ / Detak Janin:</span>
                                            <span className="font-extrabold text-blue-600">{lastAnc.djj} bpm</span>
                                          </div>
                                        )}
                                        {lastAnc.usg_tbj && (
                                          <div>
                                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] leading-none">Taksiran Berat (TBJ):</span>
                                            <span className="font-extrabold text-emerald-600">{lastAnc.usg_tbj} gr</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Biometry list */}
                                      {(lastAnc.usg_bpd || lastAnc.usg_hc || lastAnc.usg_ac || lastAnc.usg_fl) && (
                                        <div className="grid grid-cols-4 gap-1 text-center font-sans mt-1.5 text-[8.5px]">
                                          {lastAnc.usg_bpd && <div className="bg-white border border-slate-200 p-1 rounded font-bold text-slate-700">BPD: {lastAnc.usg_bpd}</div>}
                                          {lastAnc.usg_hc && <div className="bg-white border border-slate-205 border-slate-200 p-1 rounded font-bold text-slate-700">HC: {lastAnc.usg_hc}</div>}
                                          {lastAnc.usg_ac && <div className="bg-white border border-slate-205 border-slate-200 p-1 rounded font-bold text-slate-700">AC: {lastAnc.usg_ac}</div>}
                                          {lastAnc.usg_fl && <div className="bg-white border border-slate-205 border-slate-200 p-1 rounded font-bold text-slate-700">FL: {lastAnc.usg_fl}</div>}
                                        </div>
                                      )}

                                      {/* Others */}
                                      {(lastAnc.usg_placenta || lastAnc.usg_presentation) && (
                                        <div className="grid grid-cols-2 gap-1 mt-1 text-[8.5px] font-sans">
                                          {lastAnc.usg_placenta && <div className="bg-white border border-slate-200 p-1 px-1.5 rounded text-slate-600 truncate"><span className="text-slate-400 font-semibold text-[8px]">POSISI:</span> {lastAnc.usg_placenta}</div>}
                                          {lastAnc.usg_presentation && <div className="bg-white border border-slate-200 p-1 px-1.5 rounded text-slate-600 truncate"><span className="text-slate-400 font-semibold text-[8px]">PRES:</span> {lastAnc.usg_presentation}</div>}
                                        </div>
                                      )}

                                      {lastAnc.fetal_development && (
                                        <p className="text-[10px] font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200/50 mt-1.5">
                                          <strong className="text-rose-500 font-bold uppercase text-[8px] block tracking-wide">Janin:</strong> {lastAnc.fetal_development}
                                        </p>
                                      )}

                                      {/* USG Image inside Timeline */}
                                      {getUsgImages(lastAnc.usg_image).length > 0 && (
                                        <div className="flex flex-col gap-1 justify-center bg-black p-1.5 rounded-lg mt-1.5 w-full items-center">
                                          {getUsgImages(lastAnc.usg_image).map((img, i) => (
                                            <img 
                                              key={i} 
                                              src={img} 
                                              alt="Obstetric USG" 
                                              className="max-h-40 rounded object-contain"
                                              referrerPolicy="no-referrer"
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-700 transition-colors"
          >
            Tutup Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const activeIcon = createCustomIcon('#10b981'); // med-green
const plannedIcon = createCustomIcon('#f59e0b'); // amber-500

interface Location {
  id: string;
  name: string;
  position: [number, number];
  status: 'active' | 'planned';
  description: string;
  stats?: {
    patientsServed: string;
    servicesRate: string;
    communityImpact: string;
  };
  services?: string[];
  sponsorName?: string;
  sponsorLogo?: string;
  raw?: any;
}

// Locations data is now fetched from the public SIM API

export function DeploymentMap() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedHub, setSelectedHub] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy loading detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    
    setLoading(true);

    const loadData = async () => {
      const res = await fetch('https://sim.nurhealthconnection.com/api/public/map-data');
      if (!res.ok) throw new Error('Fetch HTTP error ' + res.status);
      const data = await res.json();
      return data;
    };

    loadData()
      .then((response: any) => {
        // API response: { success: true, data: [...] }
        const locationsArray = response?.data || (Array.isArray(response) ? response : response?.locations);
        
        if (locationsArray && Array.isArray(locationsArray)) {
          const mappedLocations: Location[] = locationsArray.map((clinic: any) => {
            // Count actual patients with status "Selesai" or "Lunas" and calculate their detailed fee
            let calculatedRevenue = 0;
            if (clinic.patients && clinic.patients.length > 0) {
              clinic.patients.forEach((p: any) => {
                if (p.status === 'Selesai' || p.status === 'Lunas') {
                  let patientFee = 150000; // Base Consult Tariffs
                  if (p.vitals && p.vitals.length > 0) {
                    patientFee += 50000; // Vitals check
                  }
                  if (p.soaps && p.soaps.length > 0) {
                    patientFee += 100000; // SOAP diagnostics and rekam medis
                  }
                  calculatedRevenue += patientFee;
                }
              });
            }

            // Use calculatedRevenue if clinic's revenue in API is 0, so it reflects actual patient transactions!
            const apiRevenue = Number(clinic.revenue) || 0;
            const finalRevenue = apiRevenue > 0 ? apiRevenue : calculatedRevenue;
            
            const patientCount = Number(clinic.patientCount) || clinic.patients?.length || 0;

            return {
              id: String(clinic.id),
              name: clinic.name || 'Klinik Nur Health',
              position: [
                Number(clinic.latitude || 0), 
                Number(clinic.longitude || 0)
              ],
              status: clinic.status === 'Active' ? 'active' : 'planned',
              description: clinic.address || '',
              stats: {
                patientsServed: String(patientCount),
                servicesRate: `Rp ${finalRevenue.toLocaleString('id-ID')}`,
                communityImpact: 'High'
              },
              services: [],
              sponsorName: clinic.sponsor_name || '',
              sponsorLogo: clinic.sponsor_logo || '',
              raw: {
                ...clinic,
                revenue: finalRevenue,
              }
            };
          });
          setLocations(mappedLocations);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Map data fetch error:', err);
        setLocations([]);
        setLoading(false);
      });
  }, [isInView]);

  const handleShare = async (hub: Location) => {
    const shareData = {
      title: hub.name,
      text: `${hub.name}: ${hub.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\nLihat di: ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Keyboard accessibility for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedHub(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus detail panel when selected
  useEffect(() => {
    if (selectedHub && panelRef.current) {
      panelRef.current.focus();
    }
  }, [selectedHub]);

  // Memoize markers for performance optimization (virtualization/clustering assistance)
  const markerElements = useMemo(() => {
    return locations.map((location) => (
      <Marker 
        key={location.id} 
        position={location.position} 
        icon={location.status === 'active' ? activeIcon : plannedIcon}
        alt={`Pilih ${location.name}`}
        title={location.name}
        eventHandlers={{
          click: () => setSelectedHub(location),
        }}
      >
        <Popup>
          <div className="p-2 min-w-[200px]" role="complementary" aria-label={`Ringkasan ${location.name}`}>
            <div className="flex items-center mb-2">
              <span className={`w-2 h-2 rounded-full mr-2 ${location.status === 'active' ? 'bg-med-green' : 'bg-amber-500'}`}></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {location.status === 'active' ? 'Aktif' : 'Terencana'}
              </span>
            </div>
            <strong className="block text-sm font-display text-slate-800 mb-1 leading-tight">{location.name}</strong>
            <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 leading-snug">
              {location.description}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHub(location);
              }}
              className="w-full bg-med-blue text-white px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-tight flex items-center justify-center group hover:bg-blue-700 transition-colors"
            >
              Buka Detail
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Popup>
      </Marker>
    ));
  }, [locations]);

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
      <div className="flex-grow w-full h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 z-0 relative bg-slate-50">
        {isInView ? (
          <MapContainer 
            center={[-2.5, 118.0]} 
            zoom={4} 
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedHub && <ChangeView center={selectedHub.position} />}
            {!loading && markerElements}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-med-blue"></div>
          </div>
        )}
        
        {/* Persistent Legend */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Status Hub</p>
          <div className="space-y-1.5">
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-med-green mr-2 shadow-sm"></span>
              <span className="text-[11px] font-bold text-slate-700">Operasional</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm"></span>
              <span className="text-[11px] font-bold text-slate-700">Terencana</span>
            </div>
          </div>
        </div>
        
        {/* Floating Indicator */}
        {!selectedHub && (
          <div className="absolute top-4 left-4 z-[400] bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-sm pointer-events-none">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
              <MapPin size={14} className="mr-2 text-med-blue" />
              Pilih titik hub di peta
            </p>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedHub ? (
          <motion.div 
            key={selectedHub.id}
            ref={panelRef}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="region"
            aria-labelledby={`hub-title-${selectedHub.id}`}
            tabIndex={-1}
            className="w-full lg:w-96 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col focus:outline-none"
          >
            <div className={`p-6 ${selectedHub.status === 'active' ? 'bg-med-green/10' : 'bg-amber-500/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={`badge-${selectedHub.id}`}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedHub.status === 'active' ? 'bg-med-green text-white' : 'bg-amber-500 text-white'}`}
                >
                  {selectedHub.status === 'active' ? 'Operasional' : 'Terencana'}
                </motion.span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleShare(selectedHub)}
                    aria-label="Bagikan Hub"
                    className="text-slate-400 hover:text-med-blue transition-colors p-1.5 rounded-full hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-med-blue relative"
                  >
                    {copied ? <Check size={18} className="text-med-green" /> : <Share2 size={18} />}
                    <AnimatePresence>
                      {copied && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                        >
                          Tersalin!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button 
                    onClick={() => setSelectedHub(null)}
                    aria-label="Tutup Detail"
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-med-blue"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <motion.h4 
                id={`hub-title-${selectedHub.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-display font-bold text-slate-900 leading-tight"
              >
                {selectedHub.name}
              </motion.h4>
            </div>

            <div className="p-6 flex-grow space-y-6 overflow-y-auto max-h-[450px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{selectedHub.description}"
                </p>
              </motion.div>

              {/* Sponsor Badge */}
              {selectedHub.sponsorName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-2xl border border-amber-100"
                >
                  {selectedHub.sponsorLogo && (
                    <img 
                      src={selectedHub.sponsorLogo} 
                      alt={selectedHub.sponsorName}
                      className="w-auto h-auto max-h-12 max-w-[140px] rounded-lg object-contain bg-white px-2 py-1 border border-amber-200 shadow-sm shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-0.5">Didukung Oleh</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{selectedHub.sponsorName}</p>
                  </div>
                </motion.div>
              )}

              {/* Weather Widget */}
              <WeatherWidget lat={selectedHub.position[0]} lng={selectedHub.position[1]} />

              {selectedHub.stats && (
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={itemVariants} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                    <div className="text-med-blue mb-1">
                      <Users size={16} />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{selectedHub.stats.patientsServed}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Pasien Terlayani</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                    <div className="text-med-green mb-1">
                      <Activity size={16} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedHub.stats.servicesRate}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Pendapatan</p>
                  </motion.div>
                </motion.div>
              )}

              {selectedHub.raw?.patients && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                    <Info size={14} className="mr-2" />
                    Database Medis Pasien Terpadu
                  </h5>
                  <PatientList patients={selectedHub.raw.patients} />
                </motion.div>
              )}
            </div>

            <motion.div 
              className="p-6 border-t border-slate-100 mt-auto bg-slate-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button 
                onClick={() => setShowDetailModal(true)}
                className="w-full bg-med-blue text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Detail Monitoring Data
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full lg:w-96 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6"
            >
              <Info className="text-slate-300" size={32} />
            </motion.div>
            <h4 className="text-lg font-display font-bold text-slate-400 mb-2">Informasi Hub</h4>
            <p className="text-sm text-slate-400">
              Klik pada penanda di peta untuk melihat detail spesifik layanan dan dampak di wilayah tersebut.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && selectedHub && (
          <ClinicDetailModal 
            location={selectedHub} 
            onClose={() => setShowDetailModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
