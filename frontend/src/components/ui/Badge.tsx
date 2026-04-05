import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'person' | 'company';
    className?: string;
}

export function Badge({ children, variant = 'person', className = '' }: BadgeProps) {
    const vColor = {
        person: 'bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]',
        company: 'bg-[#34C759]/10 text-[#248A3D] dark:bg-[#30D158]/20 dark:text-[#30D158]'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${vColor[variant]} ${className}`}>
            {children}
        </span>
    );
}
