import React, { useState, useEffect, useCallback } from 'react';
import { LinkStats, DynamicLink } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  ArrowUpRight,
  RefreshCw,
  Edit2,
  Check,
  Calendar,
  Eye,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  linkId: string;
  onBack?: () => void;
  onOpenInDesigner?: (link: DynamicLink) => void;
}

const DEVICE_COLORS: Record<string, string> = {
  Смартфоны: '#3b82f6',
  Компьютеры: '#10b981',
  Планшеты: '#f59e0b',
  Другое: '#94a3b8',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ linkId, onBack, onOpenInDesigner }) => {
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit target URL state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Simulation state
  const [simulating, setSimulating] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/links/${linkId}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setEditUrl(data.stats.link.targetUrl);
      } else {
        setError(data.error || 'Не удалось загрузить статистику');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSaveUrl = async () => {
    if (!stats || !editUrl.trim()) return;
    try {
      setIsSavingUrl(true);
      const res = await fetch(`/api/links/${stats.link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: editUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStats((prev) => (prev ? { ...prev, link: { ...prev.link, targetUrl: editUrl.trim() } } : null));
        setIsEditingUrl(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleSimulateScan = async (deviceType: 'mobile' | 'desktop' | 'tablet' = 'mobile') => {
    if (!stats) return;
    try {
      setSimulating(true);
      const os = deviceType === 'mobile' ? 'iOS' : deviceType === 'tablet' ? 'iPadOS' : 'macOS';
      const browser = deviceType === 'mobile' ? 'Safari' : 'Chrome';

      await fetch(`/api/links/${stats.link.id}/simulate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: deviceType,
          os,
          browser,
          referrer: 'Тестовое сканирование камеры',
        }),
      });
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
        <span className="text-sm">Загрузка аналитики...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-rose-600 mb-4">{error || 'Ссылка не найдена'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl"
        >
          Назад к списку
        </button>
      </div>
    );
  }

  const shortRedirectUrl = `${window.location.origin}/r/${stats.link.shortCode}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Navigation & Link Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium mr-1"
              >
                ← Все ссылки
              </button>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
              Динамический QR
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{stats.link.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Короткая ссылка:</span>
            <a
              href={shortRedirectUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              {shortRedirectUrl}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenInDesigner && (
            <button
              type="button"
              onClick={() => onOpenInDesigner(stats.link)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Редактировать дизайн QR</span>
            </button>
          )}

          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateScan('mobile')}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulating ? 'Запись...' : '+ Симулировать скан'}</span>
          </button>

          <button
            type="button"
            onClick={fetchStats}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Destination URL Card with Inline Editing */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-2xl border border-blue-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-blue-900 mb-0.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Целевой URL перехода (Destination)</span>
          </div>
          {isEditingUrl ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={isSavingUrl}
                onClick={handleSaveUrl}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditUrl(stats.link.targetUrl);
                  setIsEditingUrl(false);
                }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Отмена
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-800 truncate select-all">
                {stats.link.targetUrl}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingUrl(true)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium ml-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Изменить адрес</span>
              </button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed bg-white/70 p-2.5 rounded-xl border border-blue-100">
          💡 <strong>Преимущество динамической ссылки:</strong> Вы можете в любой момент изменить адрес назначения. Уже напечатанные QR-коды продолжат работать!
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Всего переходов</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalScans}</div>
          <div className="text-[11px] text-slate-400 mt-1">Все сканирования QR</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Уникальных устройств</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.uniqueVisitors}</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {stats.totalScans > 0
              ? `${Math.round((stats.uniqueVisitors / stats.totalScans) * 100)}% уникальность`
              : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Основное устройство</span>
            <Smartphone className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.deviceBreakdown[0]?.name || 'Смартфоны'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.deviceBreakdown[0]?.percentage || 100}% всех переходов
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Дата создания</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-1">
            {new Date(stats.link.createdAt).toLocaleDateString('ru-RU')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Статус: активна</div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Динамика сканирований за 7 дней</h3>
            <p className="text-xs text-slate-400">Количество переходов по дням</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Сканирований"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scansGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Breakdown (Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Устройства</h3>
          <p className="text-xs text-slate-400 mb-3">Распределение по типам</p>

          <div className="h-48 w-full flex items-center justify-center">
            {stats.deviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deviceBreakdown}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.deviceBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DEVICE_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(val) => <span className="text-xs text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Нет данных</div>
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Операционные системы</h3>
          <p className="text-xs text-slate-400 mb-3">iOS, Android, Windows и др.</p>

          <div className="flex flex-col gap-3 flex-1 justify-center">
            {stats.osBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{item.name}</span>
                  <span className="font-mono text-slate-500">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Browsers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Браузеры</h3>
          <p className="text-xs text-slate-400 mb-3">Safari, Chrome, Firefox и др.</p>

          <div className="flex flex-col gap-3 flex-1 justify-center">
            {stats.browserBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{item.name}</span>
                  <span className="font-mono text-slate-500">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Журнал последних переходов</h3>
            <p className="text-xs text-slate-400">Последние 50 сканирований с отметкой времени</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Время</th>
                <th className="py-2.5 px-3 font-semibold">Устройство</th>
                <th className="py-2.5 px-3 font-semibold">ОС</th>
                <th className="py-2.5 px-3 font-semibold">Браузер</th>
                <th className="py-2.5 px-3 font-semibold">Источник (Referrer)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">
                    {new Date(scan.timestamp).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {scan.device === 'mobile' ? (
                        <Smartphone className="w-3 h-3 text-blue-500" />
                      ) : scan.device === 'tablet' ? (
                        <Tablet className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Monitor className="w-3 h-3 text-emerald-500" />
                      )}
                      {scan.device === 'mobile'
                        ? 'Смартфон'
                        : scan.device === 'tablet'
                        ? 'Планшет'
                        : 'Компьютер'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{scan.os}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{scan.browser}</td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[200px]" title={scan.referrer}>
                    {scan.referrer}
                  </td>
                </tr>
              ))}
              {stats.scans.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    Пока нет переходов по этому QR-коду
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
