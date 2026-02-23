import { useState } from 'react';
import { useMood } from '../contexts/MoodContext';
import { exportToCSV, exportToJSON, downloadFile } from '../utils/patternAnalysis';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Clock,
  Hash,
  Check,
  Copy,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

type ExportFormat = 'json' | 'csv';

interface DataRange {
  label: string;
  value: 'all' | 'week' | 'month' | 'year';
  icon: React.ReactNode;
}

const dateRanges: DataRange[] = [
  { label: 'All Time', value: 'all', icon: <Calendar className="w-4 h-4" /> },
  { label: 'This Week', value: 'week', icon: <Clock className="w-4 h-4" /> },
  { label: 'This Month', value: 'month', icon: <Calendar className="w-4 h-4" /> },
  { label: 'This Year', value: 'year', icon: <Calendar className="w-4 h-4" /> },
];

export function DataExport() {
  const { entries, clearAllEntries } = useMood();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [range, setRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFilteredEntries = () => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return entries;
    }

    return entries.filter((entry) => new Date(entry.createdAt) >= startDate);
  };

  const handleExport = () => {
    const filteredEntries = getFilteredEntries();

    if (filteredEntries.length === 0) {
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = exportToJSON(filteredEntries);
      filename = `moodmash-export-${range}-${timestamp}.json`;
      mimeType = 'application/json';
    } else {
      content = exportToCSV(filteredEntries);
      filename = `moodmash-export-${range}-${timestamp}.csv`;
      mimeType = 'text/csv';
    }

    downloadFile(content, filename, mimeType);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleCopyToClipboard = () => {
    const filteredEntries = getFilteredEntries();
    const content = format === 'json' ? exportToJSON(filteredEntries) : exportToCSV(filteredEntries);

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearData = () => {
    clearAllEntries();
    setShowClearConfirm(false);
  };

  const filteredEntries = getFilteredEntries();
  const entryCount = filteredEntries.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Data Export</h2>
            <p className="text-slate-400 text-sm">Export your mood data in various formats</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-3">Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                format === 'json'
                  ? 'bg-violet-500/20 border-violet-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <FileJson className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">JSON</p>
                <p className="text-xs text-slate-500">Structured data format</p>
              </div>
            </button>

            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                format === 'csv'
                  ? 'bg-violet-500/20 border-violet-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">CSV</p>
                <p className="text-xs text-slate-500">Spreadsheet compatible</p>
              </div>
            </button>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-3">Date Range</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dateRanges.map((rangeOption) => (
              <button
                key={rangeOption.value}
                onClick={() => setRange(rangeOption.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                  range === rangeOption.value
                    ? 'bg-violet-500/20 border-violet-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {rangeOption.icon}
                <span className="text-sm">{rangeOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">Entries to export</p>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-500" />
              <span className="text-white font-medium">{entryCount}</span>
            </div>
          </div>
          {range !== 'all' && (
            <p className="text-xs text-slate-500">
              From {dateRanges.find((r) => r.value === range)?.label.toLowerCase()}
            </p>
          )}
        </div>

        {/* Export Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={entryCount === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              exportSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {exportSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {format.toUpperCase()}
              </>
            )}
          </button>

          <button
            onClick={handleCopyToClipboard}
            disabled={entryCount === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Preview */}
      {entryCount > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Data Preview</h3>
          <div className="bg-slate-900 rounded-lg p-4 max-h-64 overflow-auto">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap">
              {format === 'json'
                ? exportToJSON(filteredEntries).slice(0, 2000) + (exportToJSON(filteredEntries).length > 2000 ? '...' : '')
                : exportToCSV(filteredEntries).slice(0, 2000) + (exportToCSV(filteredEntries).length > 2000 ? '...' : '')}
            </pre>
          </div>
        </div>
      )}

      {/* Clear Data */}
      <div className="glass rounded-xl p-6 border-red-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Clear All Data</h3>
            <p className="text-slate-400 text-sm mb-4">
              Permanently delete all your mood entries. This action cannot be undone.
            </p>

            {showClearConfirm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>Total entries in database: {entries.length}</span>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-center">
        <p className="text-slate-500 text-sm">
          Your data is stored locally on your device. Export regularly to keep backups.
        </p>
      </div>
    </div>
  );
}

export default DataExport;
