import React, { useState, useEffect } from 'react';
import { Copy, Check, Eye, Terminal } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';

interface MacOSCodeBlockProps {
  language: string;
  value: string;
  onOpenArtifact?: (code: string, language: string) => void;
}

export const MacOSCodeBlock: React.FC<MacOSCodeBlockProps> = ({
  language,
  value,
  onOpenArtifact
}) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'plaintext').toLowerCase().replace('language-', '');

  const isPreviewable = ['html', 'svg', 'jsx', 'tsx', 'javascript', 'typescript'].includes(cleanLang) ||
    value.includes('<!DOCTYPE') || value.includes('<svg') || value.includes('function') || value.includes('export default');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = React.useMemo(() => {
    try {
      const grammar = Prism.languages[cleanLang] || Prism.languages.javascript || Prism.languages.plaintext;
      if (grammar) {
        return Prism.highlight(value, grammar, cleanLang);
      }
    } catch (e) {
      // fallback
    }
    return '';
  }, [value, cleanLang]);

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-white/[0.09] bg-[#0E1018] shadow-xl">
      {/* macOS Window Titlebar for Code Block */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/[0.06] select-none">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80" />
          </div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8E93A6] ml-2">
            {cleanLang}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isPreviewable && onOpenArtifact && (
            <button
              onClick={() => onOpenArtifact(value, cleanLang)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#E5FF44]/15 text-[#E5FF44] hover:bg-[#E5FF44]/25 border border-[#E5FF44]/30 transition-all"
              title="Open in Live Artifact Canvas"
            >
              <Eye className="w-3 h-3" />
              <span>Preview Artifact</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-[#8E93A6] hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#E5FF44]" />
                <span className="text-[#E5FF44]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-[#0A0C13]">
        {highlightedHtml ? (
          <pre
            className="language-custom"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre>{value}</pre>
        )}
      </div>
    </div>
  );
};
