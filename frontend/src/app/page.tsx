'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload } from 'lucide-react';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/ContactForm';
import { useContacts } from '@/hooks/useContacts';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import { CreateContactInput } from '@/types';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const { create } = useContacts();
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
    <main className="min-h-screen px-4 py-8">
      <SpotlightSearch
        onContactClick={(contact) => openContactDetail(contact.id)}
        registerRefreshCount={(fn) => { refreshCountRef.current = fn; }}
      />

      {/* Floating Action Buttons - Sağ alt köşe */}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Kayıt Ekle">
        <ContactForm onSubmit={handleCreate} />
      </Modal>

      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </main>
  );
}
