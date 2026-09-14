import { useState, useEffect, useCallback } from 'react';
import { QRConfig, DynamicLink } from './types';
import { QRContentSelector } from './components/QRContentSelector';
import { QRStyleControls } from './components/QRStyleControls';
import { QRCodeRenderer } from './components/QRCodeRenderer';
import { DynamicLinksTable } from './components/DynamicLinksTable';
import { AnalyticsView } from './components/AnalyticsView';
import { CreateLinkModal } from './components/CreateLinkModal';
import {
  QrCode,
  BarChart3,
  Plus,
  Activity,
  Sparkles,
  Layers,
  HelpCircle,
  Save,
  Check,
} from 'lucide-react';

const DEFAULT_QR_CONFIG: QRConfig = {
  contentType: 'dynamic',
  rawText: '',
  dynamicLinkId: '',
  dotsType: 'rounded',
  colorType: 'single',
  dotsColor: '#2563eb',
  dotsGradient: {
    type: 'linear',
    rotation: 45,
    colorStops: [
      { offset: 0, color: '#2563eb' },
      { offset: 1, color: '#06b6d4' },
    ],
  },
  cornersSquareType: 'extra-rounded',
  cornersSquareColor: '#1d4ed8',
  cornersDotType: 'dot',
  cornersDotColor: '#1d4ed8',
  backgroundColor: '#ffffff',
  backgroundTransparent: false,
  logoUrl: null,
  logoSize: 0.28,
  logoMargin: 4,
  logoBackground: true,
  logoBackgroundColor: '#ffffff',
  logoBorderRadius: 8,
  errorCorrectionLevel: 'M',
  width: 320,
  height: 320,
  margin: 10,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'designer' | 'links'>('designer');
  const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
  const [dynamicLinks, setDynamicLinks] = useState<DynamicLink[]>([]);
  const [selectedDynamicLink, setSelectedDynamicLink] = useState<DynamicLink | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [selectedStatsLinkId, setSelectedStatsLinkId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [globalStats, setGlobalStats] = useState<{ totalLinks: number; totalScans: number }>({
    totalLinks: 0,
    totalScans: 0,
  });

  // Fetch dynamic links from API
  const fetchLinks = useCallback(async () => {
    try {
      setLoadingLinks(true);
      const res = await fetch('/api/links');
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setDynamicLinks(data.links);
        const totalScans = data.links.reduce((acc: number, l: DynamicLink) => acc + (l.totalScans || 0), 0);
        setGlobalStats({ totalLinks: data.links.length, totalScans });

        // If no link is currently selected or if none in config, pick the first
        if (data.links.length > 0) {
          setSelectedDynamicLink((prev) => {
            if (prev) {
              const updated = data.links.find((l: DynamicLink) => l.id === prev.id);
              return updated || data.links[0];
            }
            return data.links[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic links', err);
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Sync selectedDynamicLink to config rawText
  useEffect(() => {
    if (config.contentType === 'dynamic' && selectedDynamicLink) {
      const shortUrl = `${window.location.origin}/r/${selectedDynamicLink.shortCode}`;
      setConfig((prev) => ({
        ...prev,
        dynamicLinkId: selectedDynamicLink.id,
        rawText: shortUrl,
        // If link has saved qrConfig, optionally merge it
        ...(selectedDynamicLink.qrConfig ? (selectedDynamicLink.qrConfig as Partial<QRConfig>) : {}),
      }));
    }
  }, [selectedDynamicLink, config.contentType]);

  // Handle config updates
  const handleConfigChange = (updates: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Open dynamic link in Designer
  const handleOpenInDesigner = (link: DynamicLink) => {
    setSelectedDynamicLink(link);
    const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
    setConfig((prev) => ({
      ...prev,
      contentType: 'dynamic',
      dynamicLinkId: link.id,
      rawText: shortUrl,
      ...(link.qrConfig ? (link.qrConfig as Partial<QRConfig>) : {}),
    }));
    setActiveTab('designer');
  };

  // Save current design for selected dynamic link
  const handleSaveDesignToLink = async () => {
    if (!selectedDynamicLink) return;
    try {
      const res = await fetch(`/api/links/${selectedDynamicLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrConfig: config }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate scan for current QR
  const handleSimulateScanCurrent = async () => {
    if (!selectedDynamicLink) return;
    try {
      await fetch(`/api/links/${selectedDynamicLink.id}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: 'mobile',
          os: 'iOS',
          browser: 'Safari',
          referrer: 'Сканирование с камеры смартфона',
        }),
      });
      await fetchLinks();
      alert(`Переход по ссылке /r/${selectedDynamicLink.shortCode} успешно зафиксирован!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete dynamic link
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту динамическую ссылку?')) return;
    try {
      await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
      await fetchLinks();
      if (selectedStatsLinkId === linkId) {
        setSelectedStatsLinkId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update target URL for dynamic link
  const handleUpdateTargetUrl = async (linkId: string, newTarget: string) => {
    try {
      await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: newTarget }),
      });
      await fetchLinks();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate scan from table
  const handleSimulateScanTable = async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: 'mobile',
          os: 'Android',
          browser: 'Chrome',
          referrer: 'Тестовый скан',
        }),
      });
      await fetchLinks();
    } catch (err) {
      console.error(err);
    }
  };

  const currentQrValue =
    config.contentType === 'dynamic' && selectedDynamicLink
      ? `${window.location.origin}/r/${selectedDynamicLink.shortCode}`
      : config.rawText || 'https://example.com';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">QR Code Studio</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  Dynamic & Stats
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Кастомизация логотипа, пикселей и трекинг переходов
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              id="tab-designer-btn"
              onClick={() => {
                setActiveTab('designer');
                setSelectedStatsLinkId(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'designer'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Генератор QR</span>
            </button>

            <button
              type="button"
              id="tab-links-btn"
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'links'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Динамические ссылки & Аналитика</span>
              {globalStats.totalScans > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                  {globalStats.totalScans}
                </span>
              )}
            </button>
          </div>

          {/* New Link Button */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-xl">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>{globalStats.totalLinks} ссылок</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700">{globalStats.totalScans} сканов</span>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Новая ссылка</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: QR DESIGNER */}
        {activeTab === 'designer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: QR Content & Styling Controls (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Content Formats Selector */}
              <QRContentSelector
                config={config}
                onChange={handleConfigChange}
                dynamicLinks={dynamicLinks}
                selectedDynamicLink={selectedDynamicLink}
                onSelectDynamicLink={(link) => setSelectedDynamicLink(link)}
                onRequestCreateDynamicLink={() => setIsCreateModalOpen(true)}
                onViewStats={(linkId) => {
                  setSelectedStatsLinkId(linkId);
                  setActiveTab('links');
                }}
              />

              {/* Style Controls (Colors, Shapes, Logo, Error Correction) */}
              <QRStyleControls config={config} onChange={handleConfigChange} />

              {/* Save preset design to dynamic link button */}
              {config.contentType === 'dynamic' && selectedDynamicLink && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Сохранить оформление для &quot;{selectedDynamicLink.title}&quot;
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Этот стиль QR-кода будет автоматически открываться при выборе этой ссылки
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveDesignToLink}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    {savedNotice ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Сохранено!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Сохранить стиль</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Live Interactive QR Preview & Export (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
              <QRCodeRenderer
                value={currentQrValue}
                config={config}
                isDynamic={config.contentType === 'dynamic'}
                onSimulateScan={handleSimulateScanCurrent}
              />

              {/* Dynamic QR Guide Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs text-slate-600 flex flex-col gap-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Как работают динамические QR-коды?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  В QR-код зашивается постоянная ссылка сервиса, которая перенаправляет на нужный вам сайт. Вы можете напечатать QR-код на упаковке, баннере или визитке, а адрес назначения менять в личном кабинете в любое время!
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-[11px] text-blue-600">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatsLinkId(null);
                      setActiveTab('links');
                    }}
                    className="font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Перейти к аналитике переходов →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DYNAMIC LINKS & ANALYTICS */}
        {activeTab === 'links' && (
          <div>
            {selectedStatsLinkId ? (
              <AnalyticsView
                linkId={selectedStatsLinkId}
                onBack={() => setSelectedStatsLinkId(null)}
                onOpenInDesigner={handleOpenInDesigner}
              />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Global KPI stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Всего динамических ссылок</span>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{globalStats.totalLinks}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Всего зафиксировано переходов</span>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{globalStats.totalScans}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Возможность смены адреса</span>
                      <div className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Без перепечатки кодов</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>

                {/* Dynamic Links Table */}
                <DynamicLinksTable
                  links={dynamicLinks}
                  loading={loadingLinks}
                  onSelectLink={(linkId) => setSelectedStatsLinkId(linkId)}
                  onOpenInDesigner={handleOpenInDesigner}
                  onCreateNew={() => setIsCreateModalOpen(true)}
                  onDeleteLink={handleDeleteLink}
                  onUpdateTargetUrl={handleUpdateTargetUrl}
                  onSimulateScan={handleSimulateScanTable}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal for creating a new dynamic link */}
      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newLink) => {
          fetchLinks();
          handleOpenInDesigner(newLink);
        }}
      />
    </div>
  );
}
