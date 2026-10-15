export type ScanType = 
  | 'phone' 
  | 'email' 
  | 'message' 
  | 'url' 
  | 'payment' 
  | 'qr' 
  | 'attachment' 
  | 'offer';

export type RiskLevel = 
  | 'lower_risk' 
  | 'caution' 
  | 'high_risk' 
  | 'very_high_risk' 
  | 'insufficient_evidence';

export type EvidenceQuality = 'low' | 'moderate' | 'high' | 'verified';

export interface OriginIntelligence {
  item_type: string;
  identified_entity: string;
  source: string;
  is_approximate: boolean;
  is_verified: boolean;
  confidence: number;
  country?: string;
  region_or_circle?: string;
  isp_or_carrier?: string;
  hosting_provider?: string;
  ip_address?: string;
  sender_header?: string;
  limitations?: string[];
  notes?: string;
  lookup_time?: string;
  [key: string]: any;
}

export interface ScanResult {
  id?: number;
  scan_type: ScanType;
  input_preview: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  evidence_quality: EvidenceQuality;
  overall_assessment: string;
  categories: string[];
  warning_signs: string[];
  reasons: string[];
  legitimate_explanations: string[];
  missing_evidence: string[];
  safe_next_actions: string[];
  origin_intelligence?: OriginIntelligence;
  created_at?: string;
  disclaimer?: string;
}

export interface CommunityReport {
  id: number;
  identifier: string;
  scam_type: string;
  incident_date: string;
  location_state: string;
  location_district: string;
  description: string;
  loss_amount?: number | null;
  evidence_notes?: string | null;
  status: 'pending' | 'reviewed' | 'rejected' | 'verified';
  confidence_score: number;
  moderation_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotspotArea {
  id: number;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  report_count: number;
  verified_count: number;
  dominant_categories: string[];
  risk_index: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  evidence_status: string;
  updated_at: string;
}

export interface OverviewStats {
  total_scans: number;
  high_risk_scans: number;
  caution_scans: number;
  lower_risk_scans: number;
  verified_reports_count: number;
  pending_reports_count: number;
  risk_distribution: { name: string; value: number; color: string }[];
  category_distribution: { category: string; count: number }[];
  timeline_data: { date: string; scans: number; threats: number }[];
  recent_scans: ScanResult[];
  recent_reports: CommunityReport[];
}
