export type DotStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded';
export type CornerDotStyle = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface GradientConfig {
  type: 'linear' | 'radial';
  rotation: number; // in degrees, e.g. 45
  colorStops: { offset: number; color: string }[];
}

export interface QRConfig {
  // Content
  contentType: 'url' | 'dynamic' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone';
  rawText: string;
  dynamicLinkId?: string;

  // Dots & Colors
  dotsType: DotStyle;
  colorType: 'single' | 'gradient';
  dotsColor: string;
  dotsGradient: GradientConfig;

  // Corners
  cornersSquareType: CornerSquareStyle;
  cornersSquareColor: string;
  cornersDotType: CornerDotStyle;
  cornersDotColor: string;

  // Background
  backgroundColor: string;
  backgroundTransparent: boolean;

  // Logo
  logoUrl: string | null;
  logoSize: number; // 0.15 to 0.4
  logoMargin: number;
  logoBackground: boolean;
  logoBackgroundColor: string;
  logoBorderRadius: number;

  // Quality & Size
  errorCorrectionLevel: ErrorCorrectionLevel;
  width: number;
  height: number;
  margin: number;
}

export interface ScanEvent {
  id: string;
  linkId: string;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'tablet' | 'other';
  os: string;
  browser: string;
  referrer: string;
  ipHash: string;
  userAgent: string;
}

export interface DynamicLink {
  id: string;
  shortCode: string;
  title: string;
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
  totalScans: number;
  qrConfig?: Partial<QRConfig>;
}

export interface LinkStats {
  link: DynamicLink;
  scans: ScanEvent[];
  totalScans: number;
  uniqueVisitors: number;
  timeline: { date: string; count: number }[];
  deviceBreakdown: { name: string; value: number; percentage: number }[];
  osBreakdown: { name: string; value: number; percentage: number }[];
  browserBreakdown: { name: string; value: number; percentage: number }[];
}
