import React, { useState } from 'react';
import { X, Play, Code, Copy, Check, Download, ExternalLink, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface ArtifactCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const ArtifactCanvas: React.FC<ArtifactCanvasProps> = ({
  isOpen,
  onClose,
  code,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'python' ? 'py' : language === 'typescript' ? 'ts' : language === 'html' ? 'html' : 'js';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evilclown-artifact.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate safe HTML bundle for preview
  const previewHtml = language === 'html' || code.includes('<html') || code.includes('<!DOCTYPE')
    ? code
    : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0A0B0E; color: #F1F2F6; font-family: system-ui, sans-serif; padding: 20px; }
  </style>
</head>
<body>
  ${code.startsWith('<svg') ? code : `<div id="app"></div><script>${code}<\/script>`}
</body>
</html>`;

  return (
    <div className={`fixed top-0 right-0 h-screen z-40 transition-all duration-300 macos-window flex flex-col ${
      isExpanded ? 'w-full sm:w-[90vw]' : 'w-full sm:w-[500px] lg:w-[600px]'
    }`}>
      {/* macOS Canvas Header */}
      <div className="h-12 px-4 border-b border-white/[0.08] bg-white/[0.03] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>

          <span className="text-xs font-bold text-white tracking-tight">Live Artifact</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5FF44]/20 text-[#E5FF44] font-semibold uppercase">
            {language}
          </span>
        </div>

        {/* Center: Segmented Preview / Code Toggle */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-[#E5FF44] text-black font-semibold shadow-sm'
                : 'text-[#8E93A6] hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'code'
                ? 'bg-[#E5FF44] text-black font-semibold shadow-sm'
                : 'text-[#8E93A6] hover:text-white'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Source</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-[#8E93A6] hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#E5FF44]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded-md text-[#8E93A6] hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-[#8E93A6] hover:text-white hover:bg-white/[0.08] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8E93A6] hover:text-white hover:bg-white/[0.08] transition-colors ml-1"
            title="Close Canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Body */}
      <div className="flex-1 bg-[#06070A] overflow-hidden relative">
        {activeTab === 'preview' ? (
          <iframe
            title="Live Artifact Preview"
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none bg-[#0A0B0E]"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-auto font-mono text-xs leading-relaxed text-[#E1E4F2] bg-[#0A0C13]">
            <pre>{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
