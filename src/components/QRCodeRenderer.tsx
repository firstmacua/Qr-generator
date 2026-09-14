import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, { Options, FileExtension } from 'qr-code-styling';
import { QRConfig } from '../types';
import { Download, Copy, Check, Printer, ExternalLink, Sparkles } from 'lucide-react';

interface QRCodeRendererProps {
  value: string;
  config: QRConfig;
  className?: string;
  onSimulateScan?: () => void;
  isDynamic?: boolean;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  config,
  className = '',
  onSimulateScan,
  isDynamic = false,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadSize, setDownloadSize] = useState<number>(1024);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize and update QRCodeStyling
  useEffect(() => {
    // Determine effective logo
    const effectiveLogo = config.logoUrl || undefined;

    // Build gradient or solid color for dots
    let dotsOptions: Options['dotsOptions'] = {
      type: config.dotsType,
      color: config.dotsColor,
    };

    if (config.colorType === 'gradient' && config.dotsGradient?.colorStops?.length >= 2) {
      dotsOptions = {
        type: config.dotsType,
        gradient: {
          type: config.dotsGradient.type,
          rotation: (config.dotsGradient.rotation * Math.PI) / 180,
          colorStops: config.dotsGradient.colorStops,
        },
      };
    }

    const options: Options = {
      width: 320,
      height: 320,
      type: 'canvas',
      data: value || 'https://example.com',
      image: effectiveLogo,
      margin: config.margin || 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        // When a logo is present, use higher error correction level (Q or H) so it scans reliably
        errorCorrectionLevel: effectiveLogo ? 'H' : config.errorCorrectionLevel,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: config.logoSize || 0.28,
        margin: config.logoMargin || 4,
        crossOrigin: 'anonymous',
      },
      dotsOptions,
      cornersSquareOptions: {
        type: config.cornersSquareType,
        color: config.cornersSquareColor || config.dotsColor,
      },
      cornersDotOptions: {
        type: config.cornersDotType,
        color: config.cornersDotColor || config.cornersSquareColor || config.dotsColor,
      },
      backgroundOptions: {
        color: config.backgroundTransparent ? 'transparent' : config.backgroundColor,
      },
    };

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(options);
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
        qrCodeInstance.current.append(qrRef.current);
      }
    } else {
      qrCodeInstance.current.update(options);
    }
  }, [value, config]);

  const handleDownload = async (extension: FileExtension) => {
    if (!qrCodeInstance.current) return;
    setIsDownloading(true);

    try {
      // Create a temporary instance at higher resolution for crisp print/download
      const exportOptions: Options = {
        width: downloadSize,
        height: downloadSize,
        type: extension === 'svg' ? 'svg' : 'canvas',
        data: value || 'https://example.com',
        image: config.logoUrl || undefined,
        margin: (config.margin || 10) * (downloadSize / 320),
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: config.logoUrl ? 'H' : config.errorCorrectionLevel,
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: config.logoSize || 0.28,
          margin: (config.logoMargin || 4) * (downloadSize / 320),
          crossOrigin: 'anonymous',
        },
        dotsOptions: {
          type: config.dotsType,
          ...(config.colorType === 'gradient' && config.dotsGradient?.colorStops?.length >= 2
            ? {
                gradient: {
                  type: config.dotsGradient.type,
                  rotation: (config.dotsGradient.rotation * Math.PI) / 180,
                  colorStops: config.dotsGradient.colorStops,
                },
              }
            : { color: config.dotsColor }),
        },
        cornersSquareOptions: {
          type: config.cornersSquareType,
          color: config.cornersSquareColor || config.dotsColor,
        },
        cornersDotOptions: {
          type: config.cornersDotType,
          color: config.cornersDotColor || config.cornersSquareColor || config.dotsColor,
        },
        backgroundOptions: {
          color: config.backgroundTransparent ? 'transparent' : config.backgroundColor,
        },
      };

      const highResQr = new QRCodeStyling(exportOptions);
      await highResQr.download({
        name: `qr-code-${Date.now()}`,
        extension,
      });
    } catch (err) {
      console.error('Download error:', err);
      // Fallback to standard download
      qrCodeInstance.current.download({
        name: `qr-code-${Date.now()}`,
        extension,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.warn('ClipboardItem error, falling back to data URL', err);
          // Fallback to copying URL string
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Failed to copy QR code image', err);
    }
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Печать QR-кода</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
              .card { text-align: center; padding: 24px; }
              img { max-width: 380px; height: auto; margin-bottom: 16px; }
              .url { font-family: monospace; font-size: 14px; color: #475569; word-break: break-all; max-width: 400px; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${dataUrl}" alt="QR Code" />
              <div class="url">${value}</div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Canvas Card */}
      <div className="relative group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:shadow-md flex flex-col items-center">
        {/* Scannability indicator badge */}
        <div className="w-full flex items-center justify-between mb-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Готов к сканированию</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Коррекция: {config.logoUrl ? 'H (30%)' : `${config.errorCorrectionLevel}`}
          </div>
        </div>

        {/* QR Canvas Container */}
        <div
          ref={qrRef}
          className="rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[320px] min-w-[320px] transition-transform duration-200"
          style={{
            backgroundColor: config.backgroundTransparent ? 'transparent' : config.backgroundColor,
          }}
        />

        {/* Dynamic Link URL preview */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {isDynamic ? 'Динамический URL перехода' : 'Содержимое QR'}
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <span className="font-mono text-xs text-slate-700 truncate select-all" title={value}>
              {value}
            </span>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
              title="Открыть ссылку"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Simulate Scan Test Button (For dynamic links) */}
        {isDynamic && onSimulateScan && (
          <button
            type="button"
            id="test-scan-btn"
            onClick={onSimulateScan}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Протестировать сканирование (записать переход)</span>
          </button>
        )}
      </div>

      {/* Export & Actions bar */}
      <div className="w-full max-w-sm mt-4 flex flex-col gap-3">
        {/* Resolution selector for print & high-res */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span className="font-medium">Разрешение экспорта:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { label: '512px', val: 512 },
              { label: '1024px', val: 1024 },
              { label: '2048px (Печать)', val: 2048 },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setDownloadSize(opt.val)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  downloadSize === opt.val
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="download-png-btn"
            disabled={isDownloading}
            onClick={() => handleDownload('png')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Скачать PNG</span>
          </button>

          <button
            type="button"
            id="download-svg-btn"
            disabled={isDownloading}
            onClick={() => handleDownload('svg')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Скачать SVG</span>
          </button>
        </div>

        {/* Copy & Print */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="copy-qr-btn"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
          </button>

          <button
            type="button"
            id="print-qr-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать</span>
          </button>
        </div>
      </div>
    </div>
  );
};
