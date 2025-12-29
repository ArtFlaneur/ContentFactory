import React from 'react';
import { GeneratedPost } from '../types';
import { Copy, Check, FileText, Mail, Phone, MapPin, RefreshCw, Download, FileDown } from 'lucide-react';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

interface PressReleaseViewProps {
  post: GeneratedPost;
  onReset?: () => void;
}

export const PressReleaseView: React.FC<PressReleaseViewProps> = ({ post, onReset }) => {
  const [copied, setCopied] = React.useState(false);
  const [isExportingDocx, setIsExportingDocx] = React.useState(false);
  const pressRelease = post.pressRelease;

  if (!pressRelease) return null;

  const locationLine = pressRelease.location?.trim() || '';
  const bodyParagraphs = React.useMemo(() => {
    return pressRelease.body ? pressRelease.body.split('\n\n').filter(Boolean) : [];
  }, [pressRelease.body]);

  const releaseLine = locationLine
    ? `${pressRelease.releaseDate} — ${locationLine}`
    : pressRelease.releaseDate;

  const fullText = React.useMemo(() => {
    return [
      pressRelease.headline,
      pressRelease.subheadline ? pressRelease.subheadline : null,
      releaseLine,
      '',
      pressRelease.body,
      '',
      pressRelease.boilerplate,
      '',
      'Media Contact:',
      pressRelease.mediaContact.name,
      pressRelease.mediaContact.email,
      pressRelease.mediaContact.phone ? pressRelease.mediaContact.phone : null
    ]
      .filter((segment) => segment !== null && segment !== undefined)
      .join('\n');
  }, [pressRelease, releaseLine]);

  const markdownContent = React.useMemo(() => {
    const sections = [
      `# ${pressRelease.headline}`,
      pressRelease.subheadline ? `_${pressRelease.subheadline}_` : null,
      `**${releaseLine}**`,
      '',
      bodyParagraphs.join('\n\n'),
      '',
      '---',
      pressRelease.boilerplate,
      '',
      '### Media Contact',
      pressRelease.mediaContact.name,
      pressRelease.mediaContact.email,
      pressRelease.mediaContact.phone || null
    ];
    return sections
      .filter((segment) => segment !== null && segment !== undefined)
      .join('\n');
  }, [bodyParagraphs, pressRelease, releaseLine]);

  const filenameBase = React.useMemo(() => {
    const slug = slugify(pressRelease.headline || 'press-release');
    const fallbackDate = new Date().toISOString().split('T')[0];
    const sanitizedDate = (pressRelease.releaseDate || fallbackDate)
      .replace(/[^0-9a-zA-Z-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || fallbackDate;
    return `${slug || 'press-release'}-${sanitizedDate}`;
  }, [pressRelease.headline, pressRelease.releaseDate]);

  const downloadBlob = (blob: Blob, extension: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenameBase}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleCopyFullRelease = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, 'md');
  };

  const handleDownloadDocx = async () => {
    if (isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      const docParagraphs: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: releaseLine, smallCaps: true })],
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: pressRelease.headline,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        })
      ];

      if (pressRelease.subheadline) {
        docParagraphs.push(
          new Paragraph({ text: pressRelease.subheadline, spacing: { after: 200 } })
        );
      }

      bodyParagraphs.forEach((paragraph) => {
        docParagraphs.push(new Paragraph({ text: paragraph, spacing: { after: 200 } }));
      });

      docParagraphs.push(new Paragraph({ text: pressRelease.boilerplate, spacing: { before: 200, after: 200 } }));

      docParagraphs.push(
        new Paragraph({ text: 'Media Contact', heading: HeadingLevel.HEADING_3, spacing: { after: 120 } })
      );

      docParagraphs.push(new Paragraph({ text: pressRelease.mediaContact.name }));
      docParagraphs.push(new Paragraph({ text: pressRelease.mediaContact.email }));
      if (pressRelease.mediaContact.phone) {
        docParagraphs.push(new Paragraph({ text: pressRelease.mediaContact.phone }));
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docParagraphs
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, 'docx');
    } catch (err) {
      console.error('Failed to export DOCX', err);
      alert('Could not generate DOCX. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="bg-white rounded-none shadow-none border-2 border-black overflow-hidden flex flex-col h-full">
      <div className="bg-indigo-50 px-6 py-4 border-b-2 border-black flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-indigo-900">{post.title}</h3>
            <p className="text-xs text-indigo-500 mt-0.5">Press Release Format</p>
          </div>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-black rounded-none transition-colors"
            title="Create New"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <article className="bg-white border-2 border-black rounded-none p-8 space-y-6 max-w-4xl mx-auto">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-600">
              <span className="font-semibold">{pressRelease.releaseDate}</span>
              {locationLine && (
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationLine}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
                {pressRelease.headline}
              </h1>
              {pressRelease.subheadline && (
                <p className="text-xl text-slate-700 leading-relaxed">
                  {pressRelease.subheadline}
                </p>
              )}
            </div>
          </header>

          <section className="prose prose-slate max-w-none">
            <div className="text-slate-800 leading-relaxed space-y-4" style={{ whiteSpace: 'pre-wrap' }}>
              {bodyParagraphs.map((paragraph, idx) => (
                <p key={idx} className="text-justify">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="border-t-2 border-slate-200 pt-6">
            <div className="text-slate-700 leading-relaxed bg-slate-50 p-4 border-l-4 border-indigo-600">
              <p style={{ whiteSpace: 'pre-wrap' }}>{pressRelease.boilerplate}</p>
            </div>
          </section>

          <section className="border-t-2 border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Media Contact</h3>
            <div className="space-y-2 text-slate-700">
              <div className="font-semibold">{pressRelease.mediaContact.name}</div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <a href={`mailto:${pressRelease.mediaContact.email}`} className="text-indigo-600 hover:underline">
                  {pressRelease.mediaContact.email}
                </a>
              </div>
              {pressRelease.mediaContact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a href={`tel:${pressRelease.mediaContact.phone}`} className="text-slate-700">
                    {pressRelease.mediaContact.phone}
                  </a>
                </div>
              )}
            </div>
          </section>

          <footer className="space-y-4" />
        </article>
      </div>

      <div className="p-4 bg-slate-50 border-t-2 border-black flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleDownloadMarkdown}
          className="flex items-center px-4 py-2 rounded-none border-2 border-black shadow-none text-sm font-medium transition-colors bg-white text-slate-900 hover:bg-slate-100"
        >
          <Download size={16} className="mr-2" />
          Download Markdown
        </button>
        <button
          onClick={handleDownloadDocx}
          disabled={isExportingDocx}
          className="flex items-center px-4 py-2 rounded-none border-2 border-black shadow-none text-sm font-medium transition-colors bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FileDown size={16} className="mr-2" />
          {isExportingDocx ? 'Preparing DOCX…' : 'Download DOCX'}
        </button>
        <button
          onClick={handleCopyFullRelease}
          className={`flex items-center px-4 py-2 rounded-none border-2 border-black shadow-none text-sm font-medium transition-colors ${
            copied ? 'bg-green-100 text-green-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2" />
              Copied Full Release
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy Full Release
            </>
          )}
        </button>
      </div>
    </div>
  );
};
