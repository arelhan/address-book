import React from 'react';
import { Contact } from '../types';
import { ContactCard } from './ContactCard';

export function HierarchyTree({ nodes, onSelect }: { nodes: Contact[]; onSelect: (c: Contact) => void }) {
    if (!nodes || nodes.length === 0) return null;

    return (
        <div className="pl-4 border-l-2 border-gray-200 dark:border-zinc-700 space-y-3 mt-3">
            {nodes.map((child) => (
                <div key={child.id} className="relative">
                    <div className="absolute -left-4 top-5 w-4 border-t-2 border-gray-200 dark:border-zinc-700" />
                    <ContactCard contact={child} onClick={onSelect} />
                </div>
            ))}
        </div>
    );
}
