import React, { useState } from 'react';
import { PageId } from '../components/layout/Sidebar';
import { 
  Shield, ArrowRight, PhoneCall, Mail, MessageSquare, 
  Globe, CreditCard, Lock, CheckCircle2, AlertTriangle, 
  ExternalLink, Search, Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (targetPage?: PageId) => void;
  onQuickAnalyze: (input: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onQuickAnalyze }) => {
  const [quickInput, setQuickInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAnalyze(quickInput.trim());
  };

  const scamCategories = [
    {
      title: 'Digital Arrest & Law Enforcement',
      desc: 'Extortion schemes impersonating Mumbai Police, CBI, ED, or customs claiming courier contraband and demanding video call trials.',
      icon: AlertTriangle,
      tag: 'Urgent Threat'
    },
    {
      title: 'Fake Bank KYC & Account Blocks',
      desc: 'Phishing portals and calls claiming your SBI, HDFC, or ICICI account is blocked pending urgent PAN/Aadhaar APK verification.',
      icon: Mail,
      tag: 'Credential Theft'
    },
    {
      title: 'Electricity Bill Disconnection',
      desc: 'Urgent notices warning power will be disconnected at 9:30 PM tonight, directing victims to call an unauthorized private officer number.',
      icon: MessageSquare,
      tag: 'Panic Urgency'
    },
    {
      title: 'UPI Collect & PIN-to-Receive Fraud',
      desc: 'Lures claiming you must enter your UPI PIN to claim cashback, or fraudulent collect requests inverted to deduct your funds.',
      icon: CreditCard,
      tag: 'Financial Deception'
    },
    {
      title: 'Work-from-Home & Telegram Tasks',
      desc: 'Unrealistic offers to earn Rs 5,000 daily by liking YouTube videos, escalating to prepaid merchant deposit Ponzi traps.',
      icon: Sparkles,
      tag: 'Deposit Extortion'
    },
    {
      title: 'Lookalike Phishing Domains',
      desc: 'Typo-squatted domains, Punycode tricks, and shorteners imitating legitimate institutions with Anti-SSRF safe scanning.',
      icon: Globe,
      tag: 'Spoofing'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-brand-100">
      {/* Top Navbar */}
      <header className="border-b border-surface-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
              <Shield size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-surface-900">
                CyberShield
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-surface-500 ml-2 px-2 py-0.5 rounded bg-surface-100">
                Fraud Intelligence Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:1930"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg"
            >
              <PhoneCall size={13} className="text-rose-600" />
              <span>Helpline: <strong>1930</strong></span>
            </a>

            <button
              onClick={() => onEnterApp('overview')}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>Launch Application</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Prominent Safe Analyzer */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-white to-surface-50 border-b border-surface-200">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
            <Lock size={13} className="text-brand-600" />
            <span>Explainable Threat Intelligence Engine • Safe Multi-Vector Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-surface-900 max-w-3xl mx-auto leading-tight">
            Check suspicious messages, calls, links, and payment requests.
          </h1>

          <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
            CyberShield investigates cyber fraud indicators across India, explains why something is deceptive or legitimate, reveals origin metadata, and provides actionable protection.
          </p>

          {/* Prominent Quick Scan Form */}
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto mt-6 p-2 bg-white rounded-xl border border-surface-300 shadow-md flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
              <Search size={18} className="text-surface-400 shrink-0" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Paste telephone number, message text, UPI ID, or URL..."
                className="w-full text-xs sm:text-sm text-surface-900 placeholder:text-surface-400 bg-transparent focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              <span>Analyze Safely</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick choices */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-surface-500 pt-2">
            <span className="font-medium text-surface-600">Quick scanner choices:</span>
            <button onClick={() => onEnterApp('phone')} className="px-2.5 py-1 rounded-md bg-white border border-surface-200 hover:border-brand-400 hover:text-brand-700 transition-colors">
              Phone & Caller
            </button>
            <button onClick={() => onEnterApp('email')} className="px-2.5 py-1 rounded-md bg-white border border-surface-200 hover:border-brand-400 hover:text-brand-700 transition-colors">
              Email & Headers
            </button>
            <button onClick={() => onEnterApp('message')} className="px-2.5 py-1 rounded-md bg-white border border-surface-200 hover:border-brand-400 hover:text-brand-700 transition-colors">
              SMS & WhatsApp
            </button>
            <button onClick={() => onEnterApp('url')} className="px-2.5 py-1 rounded-md bg-white border border-surface-200 hover:border-brand-400 hover:text-brand-700 transition-colors">
              Website & URL
            </button>
            <button onClick={() => onEnterApp('payment')} className="px-2.5 py-1 rounded-md bg-white border border-surface-200 hover:border-brand-400 hover:text-brand-700 transition-colors">
              Payment & UPI
            </button>
          </div>
        </div>
      </section>

      {/* How Scanning Works in Three Steps */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto border-b border-surface-200">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
            Methodology
          </h2>
          <h3 className="text-2xl font-bold text-surface-900">
            How CyberShield Analyzes Evidence in 3 Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-surface-900">
              Provide Evidence Safely
            </h4>
            <p className="text-xs text-surface-600 leading-relaxed">
              Paste message text, email headers, phone numbers, or upload QR code screenshots. CyberShield never automatically opens links or executes payloads.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-surface-900">
              Multi-Vector Heuristics
            </h4>
            <p className="text-xs text-surface-600 leading-relaxed">
              Analyzes telecom circles, SPF/DKIM/DMARC headers, SSRF-safe URL routing, VPA syntax, and multilingual fraud linguistic syntax across English, Hindi, and Marathi.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-surface-900">
              Explainable Score & Next Steps
            </h4>
            <p className="text-xs text-surface-600 leading-relaxed">
              Generates a transparent 0–100 risk score with plain-language reasons, legitimate explanations, origin intelligence, and an emergency response checklist.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Scam Categories */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-b border-surface-200">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
            Threat Taxonomy
          </h2>
          <h3 className="text-2xl font-bold text-surface-900">
            Supported Cyber Fraud Detection Categories
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scamCategories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs hover:border-brand-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-surface-100 text-surface-800">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-100 text-surface-600">
                    {c.tag}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-surface-900">
                  {c.title}
                </h4>
                <p className="text-xs text-surface-600 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy & Limitations Section */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-xl bg-white border border-surface-200 space-y-4">
          <div className="flex items-center gap-2.5 text-surface-900 font-bold text-sm">
            <Lock size={18} className="text-brand-600" />
            <span>Privacy by Design & Transparent Limitations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-surface-600 leading-relaxed">
            <div className="space-y-1.5">
              <strong className="text-surface-900 block font-semibold">
                Data Retention & Safety
              </strong>
              <p>
                CyberShield minimizes data retention. By default, raw messages and sensitive credentials are not permanently logged. All community reports automatically redact Indian Aadhaar numbers, PAN cards, credit cards, and mobile numbers.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-surface-900 block font-semibold">
                Risk Assessment, Not Guarantees
              </strong>
              <p>
                Risk scores are heuristic assessments based on observable technical evidence, not absolute guarantees of safety or guilt. A low risk score cannot guarantee complete safety; always independently verify unsolicited communications.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Resources Banner */}
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Immediate Financial Fraud Response
            </span>
            <h4 className="text-lg font-bold text-rose-950 mt-0.5">
              Victim of an unauthorized bank transfer?
            </h4>
            <p className="text-xs text-rose-800 mt-1 max-w-xl">
              Report within the golden hour to freeze funds before withdrawal. Call <strong>1930</strong> immediately and lodge a complaint on India's official National Cybercrime Portal.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Dial 1930
            </a>
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white hover:bg-surface-100 text-rose-950 border border-rose-300 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-surface-200 bg-white text-xs text-surface-500 text-center space-y-2">
        <p>
          CyberShield — College Minor Project on Cybersecurity and Online Fraud Prevention.
        </p>
        <div className="flex justify-center gap-4 text-surface-600">
          <button onClick={() => onEnterApp('safety')} className="hover:underline">Safety Centre</button>
          <button onClick={() => onEnterApp('hotspots')} className="hover:underline">Scam Hotspot Map</button>
          <button onClick={() => onEnterApp('reports')} className="hover:underline">Community Reports</button>
          <button onClick={() => onEnterApp('settings')} className="hover:underline">Privacy Notice</button>
        </div>
      </footer>
    </div>
  );
};
