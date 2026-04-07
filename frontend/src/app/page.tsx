'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Shield, Upload, FileText, Trash2 } from 'lucide-react';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/ContactForm';
import { useContacts } from '@/hooks/useContacts';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import { CreateContactInput } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const { create } = useContacts();
  const { user, logout, canManageContacts, isSuperAdmin } = useAuth();
  const refreshCountRef = useRef<(() => void) | null>(null);

  const handleCreate = async (data: CreateContactInput) => {
    try {
      await create(data);
      setIsModalOpen(false);
      refreshCountRef.current?.();
    } catch {
      alert("Hata oluştu.");
    }
  };

  const handleImportComplete = () => {
    refreshCountRef.current?.();
  };

  const openContactDetail = (contactId: string) => {
    router.push(`/contacts/${contactId}`);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto mb-6 w-full max-w-5xl rounded-[30px] border border-black/5 dark:border-white/10 bg-[linear-gradient(135deg,rgba(0,122,255,0.12),rgba(0,122,255,0.03))] dark:bg-[linear-gradient(135deg,rgba(0,122,255,0.16),rgba(0,122,255,0.05))] px-5 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007AFF]">Adres Defteri</p>
              <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white">{user?.fullName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user?.username} · {user?.role}</p>
            </div>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => router.push('/users')}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    <Shield size={16} /> Kullanıcı Yönetimi
                  </button>
                  <button
                    onClick={() => router.push('/trash')}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    <Trash2 size={16} /> Pasifler
                  </button>
                  <button
                    onClick={() => router.push('/logs')}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    <FileText size={16} /> Loglar
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#1f1f24] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <LogOut size={16} /> Çıkış
              </button>
            </div>
          </div>
        </div>

        <SpotlightSearch
          onContactClick={(contact) => openContactDetail(contact.id)}
          registerRefreshCount={(fn) => { refreshCountRef.current = fn; }}
          canManage={canManageContacts}
        />

        {canManageContacts && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              title="Excel Yükle"
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#2C2C2E] text-[#34C759] dark:text-[#30D158] border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#3A3A3C] font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Excel Yükle</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              title="Yeni Kayıt"
              className="flex items-center gap-2 px-4 py-3 bg-[#007AFF] hover:bg-[#006ee6] active:bg-[#005bb5] text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Yeni Kayıt</span>
            </button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Kayıt Ekle">
          <ContactForm onSubmit={handleCreate} />
        </Modal>

        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onImportComplete={handleImportComplete}
        />
      </main>
    </AuthGuard>
  );
}
