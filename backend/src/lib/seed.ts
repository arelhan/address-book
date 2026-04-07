import prisma from '../prisma/client';
import { hashPassword } from './auth';

export async function ensureInitialAdmin() {
    const fullName = process.env.INITIAL_ADMIN_FULL_NAME || 'ruşen ali elhan';
    const username = process.env.INITIAL_ADMIN_USERNAME || 'rusenali.elhan';
    const email = process.env.INITIAL_ADMIN_EMAIL || 'rusenali.elhan@saglik.gov.tr';
    const nationalId = process.env.INITIAL_ADMIN_NATIONAL_ID || '38263920216';
    const phone = process.env.INITIAL_ADMIN_PHONE || '0535 685 4646';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';

    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });

    if (existing) {
        if (existing.role !== 'SUPER_ADMIN') {
            await prisma.user.update({
                where: { id: existing.id },
                data: { role: 'SUPER_ADMIN' },
            });
        }
        return;
    }

    const { salt, hash } = hashPassword(password);

    await prisma.user.create({
        data: {
            fullName,
            username,
            email,
            nationalId,
            phone,
            role: 'SUPER_ADMIN',
            passwordSalt: salt,
            passwordHash: hash,
        },
    });
}
