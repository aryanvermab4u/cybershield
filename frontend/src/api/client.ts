import { ScanResult, OverviewStats, HotspotArea, CommunityReport } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Scanners
  scanUniversal: (data: { content: string; scan_hint?: string; context_description?: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/universal`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanPhone: (data: { phone_number: string; call_description?: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/phone`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanEmail: (data: { sender_email: string; display_name?: string; subject?: string; body?: string; reply_to?: string; raw_headers?: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/email`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanMessage: (data: { message_text: string; platform?: string; sender_id?: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/message`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanUrl: (data: { url: string; follow_redirects?: boolean; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/url`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanPayment: (data: { upi_id?: string; payment_text?: string; amount?: number; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanQr: (data: { decoded_content: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/qr`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanAttachment: (data: { filename: string; filesize_bytes?: number; mime_type?: string; save_history?: boolean }) =>
    fetchJson<ScanResult>(`${API_BASE}/scan/attachment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics & Stats
  getOverviewStats: () => fetchJson<OverviewStats>(`${API_BASE}/stats/overview`),

  // Hotspots
  getHotspots: (state?: string, minReports: number = 5) => {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    params.set('min_reports', minReports.toString());
    return fetchJson<HotspotArea[]>(`${API_BASE}/hotspots?${params.toString()}`);
  },

  // Community Reports
  getCommunityReports: (status?: string, scamType?: string, state?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (scamType) params.set('scam_type', scamType);
    if (state) params.set('state', state);
    return fetchJson<CommunityReport[]>(`${API_BASE}/reports?${params.toString()}`);
  },

  createCommunityReport: (data: {
    identifier: string;
    scam_type: string;
    incident_date: string;
    location_state: string;
    location_district: string;
    description: string;
    loss_amount?: number;
    evidence_notes?: string;
  }) =>
    fetchJson<CommunityReport>(`${API_BASE}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReportStatus: (reportId: number, status: string, moderation_notes?: string) =>
    fetchJson<CommunityReport>(`${API_BASE}/reports/${reportId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, moderation_notes }),
    }),

  // History
  getHistory: (scanType?: string, riskLevel?: string, search?: string) => {
    const params = new URLSearchParams();
    if (scanType) params.set('scan_type', scanType);
    if (riskLevel) params.set('risk_level', riskLevel);
    if (search) params.set('search', search);
    return fetchJson<ScanResult[]>(`${API_BASE}/history?${params.toString()}`);
  },

  deleteHistoryItem: (id: number) =>
    fetchJson<{ status: string; message: string }>(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
    }),

  clearAllHistory: () =>
    fetchJson<{ status: string; message: string }>(`${API_BASE}/history`, {
      method: 'DELETE',
    }),

  getExportCsvUrl: () => `${API_BASE}/history/export`,

  // System Health
  checkHealth: () => fetchJson<{ status: string; platform: string; version: string }>(`${API_BASE}/health`),
};
