import React, { useRef } from 'react';
import { QRConfig, DotStyle, CornerSquareStyle, CornerDotStyle, ErrorCorrectionLevel } from '../types';
import { COLOR_PRESETS, PRESET_LOGOS } from '../constants/presets';
import { Palette, Shapes, Image as ImageIcon, Sliders, Upload, X, ShieldAlert, Sparkles } from 'lucide-react';

interface QRStyleControlsProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const QRStyleControls: React.FC<QRStyleControlsProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = React.useState<'colors' | 'shapes' | 'logo' | 'settings'>('colors');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Размер файла не должен превышать 4 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange({
        logoUrl: result,
        errorCorrectionLevel: 'H', // Auto-upgrade to High error correction for reliable scanning
      });
    };
    reader.readAsDataURL(file);
  };

  const dotStyles: { id: DotStyle; label: string }[] = [
    { id: 'rounded', label: 'Закругленные' },
    { id: 'dots', label: 'Точки' },
    { id: 'square', label: 'Квадраты' },
    { id: 'classy', label: 'Классик' },
    { id: 'classy-rounded', label: 'Скругленный' },
    { id: 'extra-rounded', label: 'Супер-круглые' },
  ];

  const cornerSquareStyles: { id: CornerSquareStyle; label: string }[] = [
    { id: 'extra-rounded', label: 'Скругленный' },
    { id: 'square', label: 'Квадрат' },
    { id: 'dot', label: 'Круг' },
  ];

  const cornerDotStyles: { id: CornerDotStyle; label: string }[] = [
    { id: 'dot', label: 'Круглая' },
    { id: 'square', label: 'Квадратная' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/80 bg-slate-50/50 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'colors'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Цвета & Стиль</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'shapes'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>Форма пикселей</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'logo'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Логотип</span>
          {config.logoUrl && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Параметры</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex flex-col gap-6 overflow-y-auto max-h-[600px]">
        {/* TAB 1: COLORS */}
        {activeTab === 'colors' && (
          <div className="flex flex-col gap-5">
            {/* Color Presets */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-slate-700">Готовые палитры</label>
                <span className="text-[11px] text-slate-400">В 1 клик</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (preset.gradient) {
                        onChange({
                          colorType: 'gradient',
                          dotsColor: preset.dotsColor,
                          dotsGradient: preset.gradient,
                          cornersSquareColor: preset.cornersColor,
                          cornersDotColor: preset.cornersColor,
                          backgroundColor: preset.backgroundColor,
                        });
                      } else {
                        onChange({
                          colorType: 'single',
                          dotsColor: preset.dotsColor,
                          cornersSquareColor: preset.cornersColor,
                          cornersDotColor: preset.cornersColor,
                          backgroundColor: preset.backgroundColor,
                        });
                      }
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-slate-50 text-left transition-all group"
                  >
                    <div
                      className="w-5 h-5 rounded-md shrink-0 shadow-2xs border border-black/10"
                      style={{
                        background: preset.gradient
                          ? `linear-gradient(135deg, ${preset.gradient.colorStops[0].color}, ${preset.gradient.colorStops[1].color})`
                          : preset.dotsColor,
                      }}
                    />
                    <span className="text-xs font-medium text-slate-700 truncate group-hover:text-slate-900">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Solid vs Gradient Switch */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Тип заливки пикселей</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => onChange({ colorType: 'single' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    config.colorType === 'single'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Один цвет
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ colorType: 'gradient' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    config.colorType === 'gradient'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Градиент
                </button>
              </div>
            </div>

            {/* Color Pickers */}
            {config.colorType === 'single' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Цвет точек (пикселей)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.dotsColor}
                    onChange={(e) => onChange({ dotsColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={config.dotsColor}
                    onChange={(e) => onChange({ dotsColor: e.target.value })}
                    className="w-32 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                <div className="text-xs font-medium text-slate-700">Настройки градиента</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1.5">Начальный цвет</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.dotsGradient.colorStops[0]?.color || '#2563eb'}
                        onChange={(e) => {
                          const stops = [...config.dotsGradient.colorStops];
                          stops[0] = { offset: 0, color: e.target.value };
                          onChange({
                            dotsGradient: { ...config.dotsGradient, colorStops: stops },
                          });
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <span className="font-mono text-xs uppercase text-slate-600">
                        {config.dotsGradient.colorStops[0]?.color || '#2563eb'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1.5">Конечный цвет</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.dotsGradient.colorStops[1]?.color || '#06b6d4'}
                        onChange={(e) => {
                          const stops = [...config.dotsGradient.colorStops];
                          stops[1] = { offset: 1, color: e.target.value };
                          onChange({
                            dotsGradient: { ...config.dotsGradient, colorStops: stops },
                          });
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <span className="font-mono text-xs uppercase text-slate-600">
                        {config.dotsGradient.colorStops[1]?.color || '#06b6d4'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Угол наклона градиента</span>
                    <span className="font-mono">{config.dotsGradient.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={config.dotsGradient.rotation}
                    onChange={(e) =>
                      onChange({
                        dotsGradient: {
                          ...config.dotsGradient,
                          rotation: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="h-px bg-slate-100" />

            {/* Corner Eyes Colors */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Цвет угловых меток (глазков)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Внешняя рамка</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornersSquareColor}
                      onChange={(e) => onChange({ cornersSquareColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={config.cornersSquareColor}
                      onChange={(e) => onChange({ cornersSquareColor: e.target.value })}
                      className="w-24 px-2 py-1 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Внутренняя точка</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornersDotColor}
                      onChange={(e) => onChange({ cornersDotColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={config.cornersDotColor}
                      onChange={(e) => onChange({ cornersDotColor: e.target.value })}
                      className="w-24 px-2 py-1 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Background Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">Цвет фона</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.backgroundTransparent}
                    onChange={(e) => onChange({ backgroundTransparent: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600">Прозрачный фон</span>
                </label>
              </div>

              {!config.backgroundTransparent && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="w-28 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">
                    {config.backgroundColor.toLowerCase() === '#ffffff'
                      ? 'Стандартный белый'
                      : 'Кастомный фон'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SHAPES */}
        {activeTab === 'shapes' && (
          <div className="flex flex-col gap-5">
            {/* Dots style */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2.5">
                Форма пикселей QR-кода
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dotStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onChange({ dotsType: style.id })}
                    className={`p-3 rounded-xl border text-xs font-medium text-center transition-all flex flex-col items-center gap-1.5 ${
                      config.dotsType === style.id
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="capitalize">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Corner Square Style */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2.5">
                Форма рамки уголков
              </label>
              <div className="grid grid-cols-3 gap-2">
                {cornerSquareStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onChange({ cornersSquareType: style.id })}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      config.cornersSquareType === style.id
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Dot Style */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2.5">
                Форма точки внутри уголков
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cornerDotStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onChange({ cornersDotType: style.id })}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      config.cornersDotType === style.id
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGO */}
        {activeTab === 'logo' && (
          <div className="flex flex-col gap-5">
            {/* Custom Logo Upload */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Загрузить собственный логотип
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {config.logoUrl ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={config.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Логотип прикреплен</div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Коррекция H активна
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium"
                    >
                      Заменить
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ logoUrl: null })}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Удалить логотип"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 mb-1">
                    Нажмите для загрузки логотипа
                  </span>
                  <span className="text-[11px] text-slate-400 text-center">
                    PNG, SVG, JPG или WebP (до 4 МБ)
                  </span>
                </div>
              )}
            </div>

            {/* Popular Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2.5">
                Или выберите готовую иконку сервиса
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        logoUrl: preset.svg,
                        errorCorrectionLevel: 'H',
                      })
                    }
                    className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 flex flex-col items-center gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 flex items-center justify-center">
                      <img src={preset.svg} alt={preset.name} className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 group-hover:text-slate-900 truncate max-w-[60px]">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Sizing & Padding Sliders (Only if logo is present) */}
            {config.logoUrl && (
              <div className="flex flex-col gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-700">Параметры отображения логотипа</div>

                {/* Logo Size */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Размер логотипа</span>
                    <span className="font-mono">{Math.round((config.logoSize || 0.28) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.38"
                    step="0.01"
                    value={config.logoSize || 0.28}
                    onChange={(e) => onChange({ logoSize: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Компактный</span>
                    <span className="text-emerald-600">Рекомендуемый (28%)</span>
                    <span>Максимум</span>
                  </div>
                </div>

                {/* Logo Margin */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Отступ вокруг логотипа (px)</span>
                    <span className="font-mono">{config.logoMargin || 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={config.logoMargin || 4}
                    onChange={(e) => onChange({ logoMargin: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & ERROR CORRECTION */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-5">
            {/* Error correction level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Уровень коррекции ошибок
                </label>
                <span className="text-[11px] text-slate-400">Стойкость к повреждению</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { level: 'L', name: 'Низкий', percent: '7%' },
                  { level: 'M', name: 'Средний', percent: '15%' },
                  { level: 'Q', name: 'Высокий', percent: '25%' },
                  { level: 'H', name: 'Максимум', percent: '30%' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => onChange({ errorCorrectionLevel: item.level as ErrorCorrectionLevel })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      config.errorCorrectionLevel === item.level
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.level}</div>
                    <div className="text-[10px] text-slate-500">{item.percent}</div>
                  </button>
                ))}
              </div>

              {config.logoUrl && config.errorCorrectionLevel !== 'H' && (
                <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    При использовании логотипа рекомендуется уровень <strong>H (30%)</strong>, чтобы QR-код гарантированно считывался любыми камерами.
                  </span>
                </div>
              )}
            </div>

            {/* Margin slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Внешняя белая рамка (Margin)</span>
                <span className="font-mono text-slate-500">{config.margin || 10}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={config.margin || 10}
                onChange={(e) => onChange({ margin: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
