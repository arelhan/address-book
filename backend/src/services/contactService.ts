import prisma from '../prisma/client';

export const getContacts = async () => {
    return prisma.contact.findMany({
        include: { phones: true, parent: true },
        orderBy: { name: 'asc' },
    });
};

export const getContactsCount = async () => {
    return prisma.contact.count();
};

export const searchContacts = async (query: string) => {
    return prisma.contact.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { notes: { contains: query } },
                { phones: { some: { number: { contains: query } } } },
            ],
        },
        include: {
            phones: true,
            parent: { select: { id: true, name: true, type: true } },
            _count: { select: { children: true } },
        },
        take: 20,
        orderBy: { name: 'asc' },
    });
};

export const getContactById = async (id: string) => {
    return prisma.contact.findUnique({
        where: { id },
        include: { phones: true, children: true, parent: true },
    });
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
    return prisma.contact.delete({ where: { id } });
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

    const [, deleted] = await prisma.$transaction([
        prisma.contact.updateMany({
            where: { parentId: { in: uniqueIds } },
            data: { parentId: null },
        }),
        prisma.contact.deleteMany({
            where: { id: { in: uniqueIds } },
        }),
    ]);

    return deleted;
};

export const getContactChildren = async (id: string) => {
    return prisma.contact.findMany({
        where: { parentId: id },
        include: { phones: true }
    });
};
