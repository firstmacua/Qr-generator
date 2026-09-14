import React, { useState } from 'react';
import { DynamicLink, QRConfig } from '../types';
import {
  Link2,
  Globe,
  Wifi,
  FileText,
  User,
  Mail,
  Phone,
  Plus,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

interface QRContentSelectorProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
  dynamicLinks: DynamicLink[];
  selectedDynamicLink: DynamicLink | null;
  onSelectDynamicLink: (link: DynamicLink) => void;
  onRequestCreateDynamicLink: () => void;
  onViewStats: (linkId: string) => void;
}

export const QRContentSelector: React.FC<QRContentSelectorProps> = ({
  config,
  onChange,
  dynamicLinks,
  selectedDynamicLink,
  onSelectDynamicLink,
  onRequestCreateDynamicLink,
  onViewStats,
}) => {
  // Local state for formatted types
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');

  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  // Update Wi-Fi string
  const handleWifiChange = (ssid: string, pass: string, type: string) => {
    setWifiSsid(ssid);
    setWifiPass(pass);
    setWifiType(type);
    const wifiString = `WIFI:T:${type};S:${ssid};P:${pass};;`;
    onChange({ rawText: wifiString });
  };

  // Update vCard string
  const handleVcardChange = (name: string, phone: string, email: string, org: string) => {
    setVcardName(name);
    setVcardPhone(phone);
    setVcardEmail(email);
    setVcardOrg(org);
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    onChange({ rawText: vcard });
  };

  const handleEmailChange = (to: string, subj: string) => {
    setEmailTo(to);
    setEmailSubject(subj);
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subj)}`;
    onChange({ rawText: mailto });
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    onChange({ rawText: `tel:${phone}` });
  };

  interface ContentTypeItem {
    id: 'dynamic' | 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const contentTypes: ContentTypeItem[] = [
    { id: 'dynamic', label: 'Динамическая ссылка', icon: Link2, badge: 'Аналитика' },
    { id: 'url', label: 'Прямой URL', icon: Globe },
    { id: 'text', label: 'Текст', icon: FileText },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'vcard', label: 'Визитка / Контакт', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Телефон', icon: Phone },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
      {/* Content Type Selector Tabs */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Тип контента QR-кода
        </label>
        <div className="flex flex-wrap gap-1.5">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isActive = config.contentType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  onChange({ contentType: type.id });
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
                {type.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {type.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DYNAMIC LINK CONTENT */}
      {config.contentType === 'dynamic' && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Выберите динамическую ссылку для QR-кода</span>
            </div>
            <button
              type="button"
              onClick={onRequestCreateDynamicLink}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать новую</span>
            </button>
          </div>

          {dynamicLinks.length > 0 ? (
            <div className="flex flex-col gap-2">
              <select
                value={selectedDynamicLink?.id || ''}
                onChange={(e) => {
                  const found = dynamicLinks.find((l) => l.id === e.target.value);
                  if (found) {
                    onSelectDynamicLink(found);
                    onChange({
                      dynamicLinkId: found.id,
                      rawText: `${window.location.origin}/r/${found.shortCode}`,
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dynamicLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.title} (/r/{link.shortCode}) → {link.targetUrl}
                  </option>
                ))}
              </select>

              {selectedDynamicLink && (
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-blue-100">
                  <div className="truncate">
                    <span className="text-slate-400">Цель: </span>
                    <span className="font-mono text-slate-700 font-medium">
                      {selectedDynamicLink.targetUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewStats(selectedDynamicLink.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold shrink-0 ml-2"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Статистика ({selectedDynamicLink.totalScans})</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-xl border border-dashed border-blue-200">
              <p className="text-xs text-slate-600 mb-2">У вас еще нет динамических ссылок</p>
              <button
                type="button"
                onClick={onRequestCreateDynamicLink}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                + Создать динамическую ссылку
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. DIRECT URL */}
      {config.contentType === 'url' && (
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Адрес сайта (URL)
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            value={config.rawText}
            onChange={(e) => onChange({ rawText: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* 3. PLAIN TEXT */}
      {config.contentType === 'text' && (
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Текст сообщения</label>
          <textarea
            rows={3}
            placeholder="Введите любой произвольный текст для кодирования..."
            value={config.rawText}
            onChange={(e) => onChange({ rawText: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      {/* 4. WI-FI */}
      {config.contentType === 'wifi' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Имя сети (SSID)</label>
            <input
              type="text"
              placeholder="Home_WiFi"
              value={wifiSsid}
              onChange={(e) => handleWifiChange(e.target.value, wifiPass, wifiType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Пароль</label>
            <input
              type="text"
              placeholder="Secret123"
              value={wifiPass}
              onChange={(e) => handleWifiChange(wifiSsid, e.target.value, wifiType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Шифрование</label>
            <select
              value={wifiType}
              onChange={(e) => handleWifiChange(wifiSsid, wifiPass, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Без пароля</option>
            </select>
          </div>
        </div>
      )}

      {/* 5. VCARD / CONTACT */}
      {config.contentType === 'vcard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Имя и фамилия</label>
            <input
              type="text"
              placeholder="Иван Иванов"
              value={vcardName}
              onChange={(e) => handleVcardChange(e.target.value, vcardPhone, vcardEmail, vcardOrg)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Телефон</label>
            <input
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={vcardPhone}
              onChange={(e) => handleVcardChange(vcardName, e.target.value, vcardEmail, vcardOrg)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              placeholder="ivan@company.ru"
              value={vcardEmail}
              onChange={(e) => handleVcardChange(vcardName, vcardPhone, e.target.value, vcardOrg)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Организация</label>
            <input
              type="text"
              placeholder="ООО Компания"
              value={vcardOrg}
              onChange={(e) => handleVcardChange(vcardName, vcardPhone, vcardEmail, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* 6. EMAIL */}
      {config.contentType === 'email' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email получателя</label>
            <input
              type="email"
              placeholder="mail@example.com"
              value={emailTo}
              onChange={(e) => handleEmailChange(e.target.value, emailSubject)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Тема письма</label>
            <input
              type="text"
              placeholder="Вопрос по заказу"
              value={emailSubject}
              onChange={(e) => handleEmailChange(emailTo, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* 7. PHONE */}
      {config.contentType === 'phone' && (
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Номер телефона</label>
          <input
            type="tel"
            placeholder="+7 999 123-45-67"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};
