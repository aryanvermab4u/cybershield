import React, { useState } from 'react';
import { 
  ShieldAlert, PhoneCall, ExternalLink, AlertTriangle, 
  Clock, CheckCircle, Shield, Lock, CreditCard, Smartphone, HelpCircle
} from 'lucide-react';

export const SafetyCentrePage: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<string>('golden-hour');

  const emergencyContacts = [
    { bank: 'State Bank of India (SBI)', tollFree: '1800 1234 / 1800 2100', sms: 'SMS BLOCK <last 4 digits> to 567676' },
    { bank: 'HDFC Bank', tollFree: '1800 1600 / 1800 2600', sms: 'Netbanking Instant Hotlisting' },
    { bank: 'ICICI Bank', tollFree: '1800 1080', sms: 'SMS BLOCK <last 4 digits> to 9215676766' },
    { bank: 'Axis Bank', tollFree: '1860 419 5555 / 1860 500 5555', sms: 'SMS BLOCK <Card No> to 5676782' },
    { bank: 'Punjab National Bank (PNB)', tollFree: '1800 180 2222 / 1800 103 2222', sms: 'SMS HOTLIST to 5607040' },
  ];

  const guides = [
    {
      id: 'golden-hour',
      title: 'The Golden Hour: Immediate Actions After Financial Loss',
      badge: 'Emergency Response',
      summary: 'What to do in the first 2 hours after unauthorized money debit to maximize recovery chances.',
      steps: [
        'Call the National Cybercrime Helpline 1930 immediately. Keep your bank account number, transaction UTR/reference number, and debit timestamp ready.',
        'Contact your bank immediately to freeze the compromised account, block internet banking, and revoke debit cards.',
        'File an official formal complaint on the Government of India portal: https://cybercrime.gov.in/ within 24 hours.',
        'Preserve all digital evidence: take uncropped screenshots of SMS messages, WhatsApp chats, transaction details, and caller numbers.',
        'NEVER pay supposed "online recovery agents" or "ethical hackers" on social media. They are secondary recovery scammers exploiting vulnerable victims.'
      ]
    },
    {
      id: 'digital-arrest',
      title: 'Digital Arrest & Law Enforcement Impersonation',
      badge: 'Extortion Defense',
      summary: 'Recognizing and responding to fabricated arrest threats from fake police, CBI, or customs officers.',
      steps: [
        'Understand the absolute legal reality: Indian police forces (Mumbai, Delhi, etc.), CBI, ED, and courts NEVER conduct arrests, trials, or depositions over Skype or WhatsApp video calls.',
        'Law enforcement NEVER requests citizens to deposit "surety funds" or "verification money" into RBI or government accounts via personal UPI or RTGS.',
        'If a caller claims contraband drugs were seized in a Taiwan or overseas FedEx parcel sent under your Aadhaar, hang up immediately.',
        'Report the impersonator phone number to the 1930 helpline and Chakshu portal on Sanchar Saathi.'
      ]
    },
    {
      id: 'upi-safety',
      title: 'UPI Payment & QR Code Fraud Prevention',
      badge: 'Payment Security',
      summary: 'Crucial rules regarding UPI collect requests and QR codes.',
      steps: [
        'Remember the Golden Rule of UPI: Entering your UPI PIN is EXCLUSIVELY required to SEND money. You NEVER enter a PIN to receive money, cashback, or rewards.',
        'Scanning a QR code sends money. Never scan a QR code sent by a buyer on OLX, Facebook Marketplace, or WhatsApp.',
        'Do not approve unexpected "Collect Requests" in Google Pay, PhonePe, or Paytm disguised as refund approvals.',
        'Verify the beneficiary legal account name displayed on the confirmation screen before approving any outgoing transfer.'
      ]
    },
    {
      id: 'task-scams',
      title: 'Part-Time Work-From-Home & Telegram Task Scams',
      badge: 'Job Fraud',
      summary: 'How scammers lure victims with small initial payouts before stealing life savings.',
      steps: [
        'Initial Bait: Victims are offered Rs 50–150 per YouTube video liked or Google Maps review submitted.',
        'Small Payout: Scammers genuinely pay Rs 300–800 to establish false trust.',
        'Prepaid Merchant Tasks: The scam escalates into private Telegram groups where victims are instructed to deposit Rs 5,000, Rs 50,000, or lakhs to unlock "VIP commissions".',
        'Frozen Withdrawal: When victims attempt to withdraw, scammers demand 30% "tax" or "penalty" deposits, leaving victims drained.',
        'Rule: Legitimate companies never charge candidates money or require prepaid tasks to earn salary.'
      ]
    },
    {
      id: 'deepfakes',
      title: 'AI Voice Cloning & Deepfake Video Impersonation',
      badge: 'Emerging AI Threat',
      summary: 'Detecting synthetic voice clones of family members claiming emergency bail or hospital bills.',
      steps: [
        'Emergency Distress Calls: Scammers clone a child, parent, or friend’s voice using a 3-second social media sample, claiming an immediate accident or arrest.',
        'Establish a Family Safe Word: Agree upon a secret codeword known only to close family members to verify true distress calls.',
        'Hang Up & Call Back: Never send funds to an unknown UPI ID provided during a panic call. Hang up and dial your family member directly on their known phone number.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Cyber Safety Centre & Incident Response Guide
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Practical defense manuals, official government reporting resources, and bank emergency hotline directories.
            </p>
          </div>
        </div>

        {/* Emergency Response Pill */}
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
              <PhoneCall size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-950">
                National Cybercrime Helpline: 1930
              </div>
              <p className="text-xs text-rose-800 mt-0.5 max-w-xl">
                Dedicated national financial fraud helpline operated by the Ministry of Home Affairs (I4C). Call immediately to trigger the Citizen Financial Cyber Fraud Reporting System.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:1930"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Call 1930
            </a>
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-surface-100 text-rose-950 border border-rose-300 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Guide Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Guide Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-500 block px-1 mb-2">
            Incident Playbooks
          </span>

          {guides.map((g) => {
            const isActive = activeGuide === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGuide(g.id)}
                className={`w-full p-3.5 rounded-xl text-left transition-all border ${
                  isActive
                    ? 'bg-white border-brand-500 shadow-sm'
                    : 'bg-white/60 hover:bg-white border-surface-200 text-surface-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-surface-100 text-surface-600'
                  }`}>
                    {g.badge}
                  </span>
                </div>
                <h4 className={`text-xs font-bold ${isActive ? 'text-brand-900' : 'text-surface-900'}`}>
                  {g.title}
                </h4>
                <p className="text-[11px] text-surface-500 mt-1 line-clamp-2">
                  {g.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Playbook */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-surface-200 shadow-sm space-y-5">
          {(() => {
            const current = guides.find(g => g.id === activeGuide) || guides[0];
            return (
              <>
                <div className="pb-3 border-b border-surface-100">
                  <span className="text-xs font-bold uppercase text-brand-600 tracking-wider">
                    {current.badge}
                  </span>
                  <h3 className="text-lg font-bold text-surface-900 mt-1">
                    {current.title}
                  </h3>
                  <p className="text-xs text-surface-600 mt-1">
                    {current.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700">
                    Step-by-Step Response Protocol:
                  </h4>
                  <div className="space-y-2.5">
                    {current.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-surface-50 border border-surface-200 flex items-start gap-3 text-xs text-surface-800 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Emergency Bank Hotlisting Directory */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700">
              Emergency Bank Account & Card Freezing Numbers
            </h3>
            <p className="text-[11px] text-surface-500">
              Keep these official bank helpline numbers saved to hotlist compromised debit cards immediately.
            </p>
          </div>
          <CreditCard size={18} className="text-surface-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {emergencyContacts.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 space-y-1">
              <strong className="block font-bold text-surface-900">
                {c.bank}
              </strong>
              <div className="text-surface-600">
                Toll Free: <strong className="font-mono text-brand-700">{c.tollFree}</strong>
              </div>
              <div className="text-[11px] text-surface-500 font-mono">
                {c.sms}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
