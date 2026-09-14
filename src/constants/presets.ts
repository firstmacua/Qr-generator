export interface ColorPreset {
  id: string;
  name: string;
  dotsColor: string;
  cornersColor: string;
  backgroundColor: string;
  gradient?: {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: { offset: number; color: string }[];
  };
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'classic-black',
    name: 'Классический темный',
    dotsColor: '#0f172a',
    cornersColor: '#020617',
    backgroundColor: '#ffffff',
  },
  {
    id: 'deep-ocean',
    name: 'Глубокий океан',
    dotsColor: '#1d4ed8',
    cornersColor: '#1e40af',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#2563eb' },
        { offset: 1, color: '#06b6d4' },
      ],
    },
  },
  {
    id: 'emerald-luxury',
    name: 'Изумруд',
    dotsColor: '#059669',
    cornersColor: '#047857',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#059669' },
        { offset: 1, color: '#10b981' },
      ],
    },
  },
  {
    id: 'sunset-amber',
    name: 'Закат',
    dotsColor: '#ea580c',
    cornersColor: '#c2410c',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#dc2626' },
        { offset: 1, color: '#f59e0b' },
      ],
    },
  },
  {
    id: 'cyber-violet',
    name: 'Фиолетовый неон',
    dotsColor: '#7c3aed',
    cornersColor: '#6d28d9',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#7c3aed' },
        { offset: 1, color: '#ec4899' },
      ],
    },
  },
  {
    id: 'ruby-rose',
    name: 'Рубиновый',
    dotsColor: '#e11d48',
    cornersColor: '#be123c',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#e11d48' },
        { offset: 1, color: '#f43f5e' },
      ],
    },
  },
  {
    id: 'dark-gold',
    name: 'Премиум Золото',
    dotsColor: '#b45309',
    cornersColor: '#92400e',
    backgroundColor: '#ffffff',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#d97706' },
        { offset: 1, color: '#fbbf24' },
      ],
    },
  },
  {
    id: 'dark-canvas',
    name: 'Ночной режим',
    dotsColor: '#38bdf8',
    cornersColor: '#60a5fa',
    backgroundColor: '#0f172a',
    gradient: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#38bdf8' },
        { offset: 1, color: '#818cf8' },
      ],
    },
  },
];

// Inline SVG Data URLs for popular services
export interface PresetLogo {
  id: string;
  name: string;
  svg: string;
}

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2324A1DE"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/></svg>`,
  },
  {
    id: 'vk',
    name: 'VK',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230077FF"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.068 13.528c.535.525 1.088 1.032 1.583 1.594.22.25.432.508.6.793.242.41.055.875-.357.892l-2.61.035c-.675.053-1.216-.205-1.67-.714-.368-.415-.71-.85-1.066-1.274-.145-.174-.298-.34-.48-.472-.375-.274-.705-.183-.918.232-.217.422-.266.885-.292 1.348-.037.66-.237.85-.9.882-1.39.068-2.696-.233-3.87-1.033-1.065-.726-1.872-1.69-2.55-2.768-1.332-2.107-2.34-4.364-3.21-6.685-.09-.24-.009-.4.246-.412l2.67-.008c.373.01.62.204.76.55.534 1.32 1.203 2.56 2.025 3.715.22.31.45.613.754.846.335.257.595.163.74-.236.182-.5.234-1.026.248-1.554.04-1.442-.2-2.16-.948-2.378-.297-.087-.22-.216-.098-.363.318-.382.72-.497 1.472-.497h1.493c.484.084.594.31.64.792v3.388c.02.43.216.592.57.348.334-.23.57-.552.79-.884.774-1.168 1.34-2.434 1.848-3.73.116-.296.305-.46.634-.455l2.842.003c.123 0 .248.01.368.046.425.127.534.39.387.822-.38 1.11-.98 2.083-1.63 3.033-.49.717-1.03 1.397-1.528 2.11-.212.305-.19.497.08.777z"/></svg>`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2325D366"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm0 18.15c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.13.82.83-3.05-.2-.32c-.84-1.34-1.28-2.89-1.28-4.46 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.35-8.38 8.35zm4.52-6.2c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.98.69.46-.04 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>`,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  {
    id: 'globe',
    name: 'Веб-сайт',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  },
];
