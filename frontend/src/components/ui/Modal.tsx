import React, { useEffect } from 'react';

import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md transition-opacity"
                    />
                    <div

                        className={`relative bg-[#F5F5F7] dark:bg-[#000000] border border-black/5 dark:border-white/10 rounded-[30px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`}
                    >
                        <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.08] flex justify-between items-center bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-md relative z-10">
                            <h2 className="text-[19px] font-semibold tracking-tight text-black dark:text-white">{title}</h2>
                            <button onClick={onClose} className="p-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
                                <X size={20} strokeWidth={2.5} className="text-gray-500 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto w-full styled-scrollbar">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
