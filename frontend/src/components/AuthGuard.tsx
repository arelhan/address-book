'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
    children: ReactNode;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false, requireSuperAdmin = false }: Props) {
    const router = useRouter();
    const { user, loading, isAdmin, isSuperAdmin, getSetupStatus } = useAuth();

    useEffect(() => {
        const redirectAnonymous = async () => {
            const setupStatus = await getSetupStatus().catch(() => ({ needsSetup: false }));
            router.replace(setupStatus.needsSetup ? '/setup' : '/login');
        };

        if (!loading && !user) {
            void redirectAnonymous();
        }
        if (!loading && user && requireAdmin && !isAdmin) {
            router.replace('/');
        }
        if (!loading && user && requireSuperAdmin && !isSuperAdmin) {
            router.replace('/');
        }
    }, [getSetupStatus, isAdmin, isSuperAdmin, loading, requireAdmin, requireSuperAdmin, router, user]);

    if (loading || !user || (requireAdmin && !isAdmin) || (requireSuperAdmin && !isSuperAdmin)) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
                Yükleniyor...
            </div>
        );
    }

    return <>{children}</>;
}
