import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, ChevronLeft, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Modal } from './ui/Modal';
import { api } from '../lib/api';
import { BulkImportResult } from '../types';
import {
    parseExcelFile,
    autoDetectMapping,
    mapRowsToContacts,
    downloadTemplate,
    FIELD_OPTIONS,
    ParsedExcel,
} from '../lib/excelMapper';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

type Step = 'upload' | 'preview' | 'result';
const IMPORT_CHUNK_SIZE = 300;

export function ExcelImportModal({ isOpen, onClose, onImportComplete }: Props) {
    const [step, setStep] = useState<Step>('upload');
    const [dragOver, setDragOver] = useState(false);
    const [parsed, setParsed] = useState<ParsedExcel | null>(null);
    const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<BulkImportResult | null>(null);
    const [importProgress, setImportProgress] = useState<{ processed: number; total: number; success: number; failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('upload');
        setDragOver(false);
        setParsed(null);
        setHeaderMapping({});
        setLoading(false);
        setError('');
        setResult(null);
        setImportProgress(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFile = useCallback(async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'xlsx' && ext !== 'csv' && ext !== 'xls') {
            setError('Desteklenmeyen dosya formatı. Lütfen .xlsx veya .csv dosyası seçin.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const data = await parseExcelFile(file);
            if (data.rows.length === 0) {
                setError('Dosyada veri bulunamadı.');
                setLoading(false);
                return;
            }
            setParsed(data);
            setHeaderMapping(autoDetectMapping(data.headers));
            setStep('preview');
        } catch {
            setError('Dosya okunamadı. Lütfen geçerli bir Excel/CSV dosyası seçin.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleMappingChange = (header: string, field: string) => {
        setHeaderMapping(prev => ({ ...prev, [header]: field }));
    };

    const handleImport = async () => {
        if (!parsed) return;

        const contacts = mapRowsToContacts(parsed.rows, headerMapping);
        if (contacts.length === 0) {
            setError('Eşleme sonrası geçerli kayıt bulunamadı. "Ad" alanının eşlendiğinden emin olun.');
            return;
        }

        setLoading(true);
        setError('');
        setImportProgress({ processed: 0, total: contacts.length, success: 0, failed: 0 });
        try {
            const aggregated: BulkImportResult = {
                summary: {
                    total: contacts.length,
                    success: 0,
                    failed: 0,
                },
                errors: [],
            };

            for (let start = 0; start < contacts.length; start += IMPORT_CHUNK_SIZE) {
                const chunk = contacts.slice(start, start + IMPORT_CHUNK_SIZE);
                const chunkResult = await api.bulkCreateContacts(chunk, start);

                aggregated.summary.success += chunkResult.summary.success;
                aggregated.summary.failed += chunkResult.summary.failed;

                if (chunkResult.errors.length > 0) {
                    aggregated.errors.push(...chunkResult.errors);
                    if (aggregated.errors.length > 1000) {
                        aggregated.errors = aggregated.errors.slice(0, 1000);
                    }
                }

                setImportProgress({
                    processed: Math.min(start + chunk.length, contacts.length),
                    total: contacts.length,
                    success: aggregated.summary.success,
                    failed: aggregated.summary.failed,
                });
            }

            setResult(aggregated);
            setStep('result');
            if (aggregated.summary.success > 0) {
                onImportComplete();
            }
        } catch {
            setError('İçe aktarma sırasında bir hata oluştu. Lütfen tekrar deneyin. Sorun devam ederse dosyayı daha küçük parçalara bölerek yükleyin.');
        } finally {
            setLoading(false);
            setImportProgress(null);
        }
    };

    const hasNameMapping = Object.values(headerMapping).includes('name');

    const selectClasses = "px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Excel / CSV İçe Aktar" maxWidth="max-w-4xl">
            {step === 'upload' && (
                <div className="space-y-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                            dragOver
                                ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#007AFF]/10'
                                : 'border-gray-300 dark:border-zinc-600 hover:border-[#007AFF]/50 hover:bg-gray-50 dark:hover:bg-[#1C1C1E]'
                        }`}
                    >
                        <Upload size={48} className={`mb-4 ${dragOver ? 'text-[#007AFF]' : 'text-gray-400 dark:text-gray-500'}`} />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Excel veya CSV dosyası sürükleyip bırakın
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            veya tıklayarak dosya seçin
                        </p>
                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                            Desteklenen formatlar: .xlsx, .csv
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.csv,.xls"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-zinc-700 rounded-2xl text-[#007AFF] font-semibold hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors"
                    >
                        <Download size={18} />
                        Örnek Şablon İndir (.xlsx)
                    </button>

                    {loading && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            Dosya okunuyor...
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>
            )}

            {step === 'preview' && parsed && (
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FileSpreadsheet size={18} />
                        Toplam <strong className="text-gray-900 dark:text-white">{parsed.rows.length}</strong> kayıt bulundu
                    </div>

                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-1">
                            Kolon Eşleme
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {parsed.headers.map(header => (
                                <div key={header} className="flex items-center gap-2 p-2 bg-white dark:bg-[#1C1C1E] rounded-xl border border-black/5 dark:border-white/10">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1" title={header}>
                                        {header}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                                    <select
                                        value={headerMapping[header] || '_skip'}
                                        onChange={(e) => handleMappingChange(header, e.target.value)}
                                        className={selectClasses}
                                    >
                                        {FIELD_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!hasNameMapping && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm">
                            <AlertCircle size={18} />
                            &quot;Ad&quot; alanı eşlenmedi. En az bir kolon &quot;Ad&quot; olarak eşlenmelidir.
                        </div>
                    )}

                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-1">
                            Önizleme (ilk {Math.min(parsed.rows.length, 5)} kayıt)
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-[#2C2C2E]">
                                        {parsed.headers.filter(h => headerMapping[h] !== '_skip').map(header => (
                                            <th key={header} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {FIELD_OPTIONS.find(o => o.value === headerMapping[header])?.label || header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsed.rows.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-t border-black/5 dark:border-white/5">
                                            {parsed.headers.filter(h => headerMapping[h] !== '_skip').map(header => (
                                                <td key={header} className="px-3 py-2 text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[200px] truncate">
                                                    {row[header]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {importProgress && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                İçe aktarma ilerlemesi: {importProgress.processed} / {importProgress.total}
                            </div>
                            <div className="w-full h-2 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#007AFF] transition-all"
                                    style={{ width: `${Math.max(2, Math.round((importProgress.processed / Math.max(importProgress.total, 1)) * 100))}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                Başarılı: {importProgress.success} | Hatalı: {importProgress.failed} | Parça boyutu: {IMPORT_CHUNK_SIZE}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { setStep('upload'); setError(''); }}
                            className="flex items-center px-5 py-3 bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 rounded-[18px] font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-[#3A3A3C]"
                        >
                            <ChevronLeft size={18} className="mr-1" /> Geri
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={loading || !hasNameMapping}
                            className="flex-1 bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] text-white px-6 py-3 rounded-[18px] font-semibold text-[17px] transition-colors disabled:opacity-50 shadow-md"
                        >
                            {loading ? 'İçe aktarılıyor...' : `${parsed.rows.length} Kayıt İçe Aktar`}
                        </button>
                    </div>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-5">
                    <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                        result.summary.failed === 0
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                        <CheckCircle2 size={28} className={result.summary.failed === 0 ? 'text-[#34C759]' : 'text-yellow-500'} />
                        <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {result.summary.success} / {result.summary.total} kayıt başarıyla eklendi
                            </p>
                            {result.summary.failed > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {result.summary.failed} kayıt hatalı olduğu için atlandı
                                </p>
                            )}
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div>
                            <h3 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-1">
                                Hatalı Satırlar {result.errors.length >= 1000 ? '(ilk 1000 gösteriliyor)' : ''}
                            </h3>
                            <div className="max-h-48 overflow-y-auto space-y-2 styled-scrollbar">
                                {result.errors.map((err, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm">
                                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-medium text-red-700 dark:text-red-400">Satır {err.row}:</span>{' '}
                                            <span className="text-red-600 dark:text-red-300">
                                                {Object.entries(err.errors).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join(' | ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            onClick={handleClose}
                            className="w-full bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] text-white px-6 py-3.5 rounded-[18px] font-semibold text-[17px] transition-colors shadow-md"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
