import React, { useState } from 'react';
import { DynamicLink } from '../types';
import {
  BarChart2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  Plus,
  QrCode,
  Sparkles,
  Link as LinkIcon,
  Search,
} from 'lucide-react';

interface DynamicLinksTableProps {
  links: DynamicLink[];
  loading: boolean;
  onSelectLink: (linkId: string) => void;
  onOpenInDesigner: (link: DynamicLink) => void;
  onCreateNew: () => void;
  onDeleteLink: (linkId: string) => void;
  onUpdateTargetUrl: (linkId: string, newTarget: string) => Promise<void>;
  onSimulateScan: (linkId: string) => Promise<void>;
}

export const DynamicLinksTable: React.FC<DynamicLinksTableProps> = ({
  links,
  loading,
  onSelectLink,
  onOpenInDesigner,
  onCreateNew,
  onDeleteLink,
  onUpdateTargetUrl,
  onSimulateScan,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  const filteredLinks = links.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      l.targetUrl.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (link: DynamicLink) => {
    const fullUrl = `${window.location.origin}/r/${link.shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (link: DynamicLink) => {
    setEditingId(link.id);
    setEditUrl(link.targetUrl);
  };

  const handleSaveEdit = async (linkId: string) => {
    if (!editUrl.trim()) return;
    await onUpdateTargetUrl(linkId, editUrl.trim());
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Top Header & Search Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Управление динамическими QR-ссылками</h2>
          <p className="text-xs text-slate-500">
            Отслеживайте переходы и меняйте адрес назначения в любое время без перепечатки кода
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или ссылке..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            id="create-link-btn"
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Создать ссылку</span>
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 font-semibold">Название и короткий код</th>
              <th className="py-3 px-4 font-semibold">Целевой адрес (куда ведет QR)</th>
              <th className="py-3 px-4 font-semibold text-center">Переходы</th>
              <th className="py-3 px-4 font-semibold">Дата</th>
              <th className="py-3 px-4 font-semibold text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLinks.map((link) => {
              const fullShortUrl = `${window.location.origin}/r/${link.shortCode}`;
              const isEditing = editingId === link.id;

              return (
                <tr key={link.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Title & Short URL */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{link.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        /r/{link.shortCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(link)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                        title="Скопировать короткую ссылку"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Target URL */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-mono text-slate-800 w-full focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(link.id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium"
                        >
                          ОК
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span className="truncate font-mono text-xs text-slate-600" title={link.targetUrl}>
                          {link.targetUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(link)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 transition-opacity"
                          title="Редактировать адрес перехода"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <a
                          href={link.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Открыть адрес"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </td>

                  {/* Scans Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                      {link.totalScans}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(link.createdAt).toLocaleDateString('ru-RU')}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectLink(link.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                        title="Подробная статистика"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Аналитика</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenInDesigner(link)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Открыть QR в дизайнере"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSimulateScan(link.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Смоделировать тестовый скан"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteLink(link.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Удалить ссылку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredLinks.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-sm font-medium text-slate-600">Динамических ссылок не найдено</span>
                    <span className="text-xs text-slate-400 mt-1">
                      Создайте вашу первую динамическую ссылку, чтобы отслеживать сканирования
                    </span>
                    <button
                      type="button"
                      onClick={onCreateNew}
                      className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                    >
                      + Создать первую ссылку
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
