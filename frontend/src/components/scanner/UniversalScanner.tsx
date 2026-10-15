import React, { useState, useRef } from 'react';
import { api } from '../../api/client';
import { ScanResult } from '../../types';
import { ResultCard } from '../common/ResultCard';
import jsQR from 'jsqr';
import { 
  Scan, PhoneCall, Mail, MessageSquare, Globe, 
  CreditCard, QrCode, FileSpreadsheet, Loader2, 
  Sparkles, AlertCircle, Upload, Check, RefreshCw
} from 'lucide-react';

interface UniversalScannerProps {
  initialTab?: string;
  onReportClick?: (identifier: string, category: string) => void;
}

export const UniversalScanner: React.FC<UniversalScannerProps> = ({ 
  initialTab = 'auto', 
  onReportClick 
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [inputText, setInputText] = useState('');
  const [callDesc, setCallDesc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailDisplayName, setEmailDisplayName] = useState('');
  const [rawHeaders, setRawHeaders] = useState('');
  const [platform, setPlatform] = useState('sms');
  const [senderId, setSenderId] = useState('');
  const [amount, setAmount] = useState<number | undefined>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset demo test cases for effortless testing
  const presets = [
    {
      label: 'Digital Arrest Threat',
      type: 'phone',
      tab: 'phone',
      target: '+91 9810123456',
      desc: 'Caller claimed to be DCP Mumbai Police. Said MDMA drugs were seized in a parcel sent to Taiwan under my Aadhaar and demanded Skype video call inquiry.',
    },
    {
      label: 'Electricity Power Cut 9:30 PM',
      type: 'message',
      tab: 'message',
      target: 'Dear customer your electricity power will be disconnected tonight at 9.30 pm from electricity office. Immediately call discom officer at 9876543210.',
    },
    {
      label: 'UPI PIN-to-Receive Trap',
      type: 'payment',
      tab: 'payment',
      target: 'rewards-dept@oksbi',
      desc: 'Please accept collect request and enter your 6-digit UPI PIN to receive Rs 2,500 cashback reward directly into your bank.',
    },
    {
      label: 'Lookalike SBI Phishing URL',
      type: 'url',
      tab: 'url',
      target: 'http://sbi-kyc-verify-portal.xyz/login.php',
    },
    {
      label: 'Fake Traffic eChallan APK',
      type: 'message',
      tab: 'message',
      target: 'Traffic Police: Pending e-challan notice DL-01-AB-1234. Download mParivahan_notice.apk to view violations and avoid court summons.',
    },
    {
      label: 'Legitimate Transaction Alert',
      type: 'message',
      tab: 'message',
      target: 'Rs 500.00 debited from A/c XX1234 on 14-Oct-26 at ATM. Avl Bal Rs 24,520. If not done by you, call 1800112211 or SMS BLOCK to 567676.',
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setActiveTab(p.tab);
    setInputText(p.target);
    if (p.desc) {
      if (p.tab === 'phone') setCallDesc(p.desc);
      if (p.tab === 'payment') setCallDesc(p.desc);
    } else {
      setCallDesc('');
    }
    setError(null);
    setScanResult(null);
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) {
      setError('Please provide an input value to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanResult(null);
    setLoadingStep('Initializing heuristic threat engine...');

    try {
      let res: ScanResult;

      if (activeTab === 'phone') {
        setLoadingStep('Evaluating telecom numbering circles and caller ID heuristics...');
        res = await api.scanPhone({
          phone_number: inputText.trim(),
          call_description: callDesc.trim() || undefined,
          save_history: true
        });
      } else if (activeTab === 'email') {
        setLoadingStep('Inspecting display name mismatch, domain typography, and RFC headers...');
        res = await api.scanEmail({
          sender_email: inputText.trim(),
          display_name: emailDisplayName.trim() || undefined,
          subject: emailSubject.trim() || undefined,
          body: callDesc.trim() || undefined,
          raw_headers: rawHeaders.trim() || undefined,
          save_history: true
        });
      } else if (activeTab === 'message') {
        setLoadingStep('Running multilingual scam syntax rules across English, Hindi & Marathi...');
        res = await api.scanMessage({
          message_text: inputText.trim(),
          platform: platform,
          sender_id: senderId.trim() || undefined,
          save_history: true
        });
      } else if (activeTab === 'url') {
        setLoadingStep('Performing safe DNS probe and Anti-SSRF destination inspection...');
        res = await api.scanUrl({
          url: inputText.trim(),
          follow_redirects: true,
          save_history: true
        });
      } else if (activeTab === 'payment') {
        setLoadingStep('Validating VPA syntax, PSP handle, and collect request mechanics...');
        res = await api.scanPayment({
          upi_id: inputText.trim().includes('@') ? inputText.trim() : undefined,
          payment_text: callDesc.trim() || inputText.trim(),
          amount: amount,
          save_history: true
        });
      } else if (activeTab === 'attachment') {
        setLoadingStep('Inspecting attachment metadata, double extensions, and macro payloads...');
        res = await api.scanAttachment({
          filename: inputText.trim(),
          save_history: true
        });
      } else {
        // Universal Auto
        setLoadingStep('Classifying target type and executing tailored heuristic analyzers...');
        res = await api.scanUniversal({
          content: inputText.trim(),
          scan_hint: 'auto',
          context_description: callDesc.trim() || undefined,
          save_history: true
        });
      }

      setScanResult(res);
    } catch (err: any) {
      setError(err.message || 'Inspection failed. Please check network connectivity or backend status.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // QR Code Image Client-Side Decoding via jsQR
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingStep('Decoding QR image safely in client sandbox...');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsLoading(false);
          setError('Could not process canvas context for QR code.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          setInputText(code.data);
          setActiveTab('qr');
          setIsLoading(false);
          // Automatically run scan on decoded destination
          api.scanQr({ decoded_content: code.data, save_history: true })
            .then(res => setScanResult(res))
            .catch(err => setError(err.message));
        } else {
          setIsLoading(false);
          setError('No valid QR code pattern could be decoded from the uploaded image. Please ensure high contrast.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Preset Benchmarks */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2.5">
          <Sparkles size={14} className="text-brand-600" />
          <span>Quick Benchmark Test Cases (1-Click Test)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 text-surface-700 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-200 overflow-x-auto bg-surface-50/60 p-1.5 gap-1">
          {[
            { id: 'auto', label: 'Universal (Auto)', icon: Scan },
            { id: 'phone', label: 'Phone & Caller', icon: PhoneCall },
            { id: 'email', label: 'Email Security', icon: Mail },
            { id: 'message', label: 'SMS / WhatsApp', icon: MessageSquare },
            { id: 'url', label: 'Website & URL', icon: Globe },
            { id: 'payment', label: 'Payment & UPI', icon: CreditCard },
            { id: 'qr', label: 'QR Destination', icon: QrCode },
            { id: 'attachment', label: 'Attachment Meta', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-2xs border border-surface-200/80'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/70'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-brand-600' : 'text-surface-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={handleScan} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-600 mb-1.5">
              {activeTab === 'phone' && 'Telephone Number or Caller ID'}
              {activeTab === 'email' && 'Sender Email Address'}
              {activeTab === 'message' && 'Pasted Message Text (English, Hindi, Hinglish, Marathi)'}
              {activeTab === 'url' && 'Website Link or Suspicious URL'}
              {activeTab === 'payment' && 'UPI Virtual Payment Address (VPA) or Collect Request'}
              {activeTab === 'qr' && 'Decoded QR Destination URL or Content'}
              {activeTab === 'attachment' && 'Suspicious File Name / Attachment Name'}
              {activeTab === 'auto' && 'Paste Any Suspicious Text, Number, URL, Email, or UPI ID'}
            </label>

            {activeTab === 'message' ? (
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: Dear customer your electricity power will be disconnected at 9.30 pm tonight from electricity office call 9876543210..."
                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-300 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-mono"
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeTab === 'phone' ? '+91 9810123456 or 011-23456789' :
                    activeTab === 'email' ? 'support@sbi-updates-portal.xyz' :
                    activeTab === 'url' ? 'https://sbi-netbanking-kyc.xyz/verify' :
                    activeTab === 'payment' ? 'rewards98@oksbi or refund-officer@paytm' :
                    activeTab === 'attachment' ? 'invoice_overdue.pdf.exe' :
                    'Enter phone, URL, email, UPI ID, or paste message...'
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-300 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-mono"
                />
              </div>
            )}
          </div>

          {/* Contextual Secondary Fields */}
          {activeTab === 'phone' && (
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">
                Call Description or Words Spoken by Caller (Optional)
              </label>
              <textarea
                rows={2}
                value={callDesc}
                onChange={(e) => setCallDesc(e.target.value)}
                placeholder="Example: Caller claimed to be CBI officer threatening arrest for contraband parcel, asked to join Skype video call..."
                className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1">
                  Display Name shown in Client (e.g. State Bank of India)
                </label>
                <input
                  type="text"
                  value={emailDisplayName}
                  onChange={(e) => setEmailDisplayName(e.target.value)}
                  placeholder="State Bank of India Support"
                  className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="URGENT: Your Account will be suspended within 24 hours"
                  className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-surface-600 mb-1">
                  Complete Raw Email Headers (Optional — enables SPF, DKIM & DMARC cryptographic validation)
                </label>
                <textarea
                  rows={3}
                  value={rawHeaders}
                  onChange={(e) => setRawHeaders(e.target.value)}
                  placeholder="Paste RFC 5322 headers (Received: ..., Authentication-Results: ...) for cryptographic verification..."
                  className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1">
                  Sender Header / Number (Optional)
                </label>
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  placeholder="e.g. AD-SBINB or +91 9876543210"
                  className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="sms">SMS / Text Message</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram / Social DM</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">
                Payment Request Text or Instructions from Requester
              </label>
              <textarea
                rows={2}
                value={callDesc}
                onChange={(e) => setCallDesc(e.target.value)}
                placeholder="Example: Enter your 6-digit PIN to claim Rs 2000 refund into your account..."
                className="w-full px-3.5 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="p-4 bg-surface-50 rounded-lg border border-dashed border-surface-300 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
              <Upload size={24} className="mx-auto text-surface-400 mb-2" />
              <p className="text-xs font-medium text-surface-700">
                Upload QR Code Screenshot or Image
              </p>
              <p className="text-[11px] text-surface-500 mt-0.5">
                CyberShield safely decodes the destination without opening it in your browser.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 bg-white border border-surface-300 hover:bg-surface-100 text-surface-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                Choose Image File
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Check size={14} className="text-emerald-600" />
              <span>Safe analysis: Never executes payloads, calls numbers, or auto-opens links.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setCallDesc('');
                  setScanResult(null);
                  setError(null);
                }}
                disabled={isLoading || (!inputText && !scanResult)}
                className="px-3 py-2 text-xs font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-40"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-surface-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Analyzing Safely...</span>
                  </>
                ) : (
                  <>
                    <Scan size={15} />
                    <span>Run Security Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 flex items-center gap-3 animate-pulse">
            <RefreshCw size={16} className="text-brand-600 animate-spin" />
            <span className="text-xs font-medium text-surface-700">
              {loadingStep || 'Processing threat parameters...'}
            </span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="m-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Inspection Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Render Scan Results */}
      {scanResult && (
        <ResultCard
          result={scanResult}
          onReportClick={onReportClick}
        />
      )}
    </div>
  );
};
