import prisma from '../prisma/client';

interface ContactPaginationParams {
    page: number;
    pageSize: number;
}

const contactInclude = {
    phones: true,
    parent: {
        select: {
            id: true,
            name: true,
            type: true,
            deletedAt: true,
        },
    },
    _count: { select: { children: true } },
} as const;

const activeContactWhere = {
    deletedAt: null,
} as const;

const deletedContactWhere = {
    deletedAt: { not: null },
} as const;

function normalizeSearchText(value: string) {
    return value
        .toLocaleLowerCase('tr-TR')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildContactSearchHaystack(contact: {
    name: string;
    email?: string | null;
    notes?: string | null;
    title?: string | null;
    department?: string | null;
    phones?: Array<{ number: string; label?: string | null }>;
}) {
    return normalizeSearchText([
        contact.name,
        contact.email || '',
        contact.notes || '',
        contact.title || '',
        contact.department || '',
        ...(contact.phones || []).map(phone => `${phone.number} ${phone.label || ''}`),
    ].join(' '));
}

function matchesSearch(contact: {
    name: string;
    email?: string | null;
    notes?: string | null;
    title?: string | null;
    department?: string | null;
    phones?: Array<{ number: string; label?: string | null }>;
}, query: string) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return false;

    const tokens = normalizedQuery.split(' ').filter(Boolean);
    const haystack = buildContactSearchHaystack(contact);
    return tokens.every(token => haystack.includes(token));
}

function sanitizeParentContact<T extends { parent?: { id: string; name: string; type: string; deletedAt?: Date | null } | null }>(contact: T) {
    if (!contact.parent || contact.parent.deletedAt) {
        return { ...contact, parent: null };
    }

    const { deletedAt: _deletedAt, ...parent } = contact.parent;
    return { ...contact, parent };
}

function sanitizeContacts<T extends { parent?: { id: string; name: string; type: string; deletedAt?: Date | null } | null }>(contacts: T[]) {
    return contacts.map(sanitizeParentContact);
}

export const getContacts = async ({ page, pageSize }: ContactPaginationParams) => {
    const skip = (page - 1) * pageSize;
    const [items, total] = await prisma.$transaction([
        prisma.contact.findMany({
            where: activeContactWhere,
            include: contactInclude,
            orderBy: { name: 'asc' },
            skip,
            take: pageSize,
        }),
        prisma.contact.count({ where: activeContactWhere }),
    ]);

    return { items: sanitizeContacts(items), total };
};

export const getContactsCount = async () => {
    return prisma.contact.count({ where: activeContactWhere });
};

export const searchContacts = async (query: string, { page, pageSize }: ContactPaginationParams) => {
    const allContacts = await prisma.contact.findMany({
        where: activeContactWhere,
        include: contactInclude,
        orderBy: { name: 'asc' },
    });

    const filtered = allContacts.filter(contact => matchesSearch(contact, query));
    const skip = (page - 1) * pageSize;

    return {
        items: sanitizeContacts(filtered.slice(skip, skip + pageSize)),
        total: filtered.length,
    };
};

export const getDeletedContacts = async ({ page, pageSize }: ContactPaginationParams) => {
    const skip = (page - 1) * pageSize;
    const [items, total] = await prisma.$transaction([
        prisma.contact.findMany({
            where: deletedContactWhere,
            include: contactInclude,
            orderBy: { updatedAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.contact.count({ where: deletedContactWhere }),
    ]);

    return { items: sanitizeContacts(items), total };
};

export const getDeletedContactsCount = async () => {
    return prisma.contact.count({ where: deletedContactWhere });
};

export const getContactById = async (id: string) => {
    const contact = await prisma.contact.findFirst({
        where: { id, ...activeContactWhere },
        include: {
            phones: true,
            children: {
                where: { deletedAt: null },
                include: { phones: true },
            },
            parent: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    deletedAt: true,
                },
            },
        },
    });

    if (!contact) return null;

    return sanitizeParentContact(contact);
};

export const createContact = async (data: any) => {
    const { phones, ...contactData } = data;
    return prisma.contact.create({
        data: {
            ...contactData,
            phones: {
                create: phones || [],
            },
        },
        include: { phones: true },
    });
};

export const updateContact = async (id: string, data: any) => {
    const { phones, ...contactData } = data;

    if (phones) {
        await prisma.phone.deleteMany({ where: { contactId: id } });
    }

    return prisma.contact.update({
        where: { id },
        data: {
            ...contactData,
            ...(phones && {
                phones: {
                    create: phones,
                },
            }),
        },
        include: { phones: true },
    });
};

export const deleteContact = async (id: string) => {
    return prisma.contact.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: { phones: true },
    });
};

export const restoreContact = async (id: string) => {
    return prisma.contact.update({
        where: { id },
        data: { deletedAt: null },
        include: { phones: true },
    });
};

export const bulkCreateContacts = async (
    contacts: Array<{ type: string; name: string; phones: any[]; title?: string; department?: string; email?: string; address?: string; notes?: string; parentId?: string | null }>
) => {
    return prisma.$transaction(
        contacts.map(({ phones, ...contactData }) =>
            prisma.contact.create({
                data: {
                    type: contactData.type,
                    name: contactData.name,
                    title: contactData.title,
                    department: contactData.department,
                    email: contactData.email,
                    address: contactData.address,
                    notes: contactData.notes,
                    parentId: contactData.parentId,
                    phones: { create: phones || [] },
                },
                include: { phones: true },
            })
        )
    );
};

export const bulkDeleteContacts = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    const chunkSize = Number(process.env.BULK_DELETE_CHUNK_SIZE || 400);
    let totalDeleted = 0;

    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
        const chunk = uniqueIds.slice(i, i + chunkSize);
        const [, deleted] = await prisma.$transaction([
            prisma.contact.updateMany({
                where: { parentId: { in: chunk } },
                data: { parentId: null },
            }),
            prisma.contact.updateMany({
                where: { id: { in: chunk }, deletedAt: null },
                data: { deletedAt: new Date() },
            }),
        ]);

        totalDeleted += deleted.count;
    }

    return { count: totalDeleted };
};

export const getContactChildren = async (id: string) => {
    return prisma.contact.findMany({
        where: { parentId: id, deletedAt: null },
        include: { phones: true }
    });
};
