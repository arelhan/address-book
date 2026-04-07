'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/auth';
import { AuthUser, LoginInput, CreateUserInput, UpdateUserInput, InitialSetupInput } from '../types';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const token = getAuthToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await api.me();
            setUser(data.user);
        } catch {
            clearAuthToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void refreshUser();
    }, []);

    const login = async (data: LoginInput) => {
        const result = await api.login(data);
        setAuthToken(result.token);
        setUser(result.user);
        return result.user;
    };

    const logout = () => {
        void api.logout().catch(() => null);
        clearAuthToken();
        setUser(null);
        setLoading(false);
    };

    const createUser = async (data: CreateUserInput) => {
        return api.createUser(data);
    };

    const updateUser = async (id: string, data: UpdateUserInput) => {
        return api.updateUser(id, data);
    };

    const deleteUser = async (id: string) => {
        return api.deleteUser(id);
    };

    const listUsers = async () => {
        return api.listUsers();
    };

    const listAuditLogs = async (page = 1, pageSize = 20) => {
        return api.listAuditLogs(page, pageSize);
    };

    const getSetupStatus = async () => {
        return api.getSetupStatus();
    };

    const setupInitialSuperAdmin = async (data: InitialSetupInput) => {
        const result = await api.setupInitialSuperAdmin(data);
        setAuthToken(result.token);
        setUser(result.user);
        return result.user;
    };

    const getDeletedContacts = async (page = 1, pageSize = 20) => {
        return api.getDeletedContacts(page, pageSize);
    };

    const getDeletedContactsCount = async () => {
        return api.getDeletedContactsCount();
    };

    const restoreContact = async (id: string) => {
        return api.restoreContact(id);
    };

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canManageContacts = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    return {
        user,
        loading,
        login,
        logout,
        refreshUser,
        createUser,
        updateUser,
        deleteUser,
        listUsers,
        listAuditLogs,
        getSetupStatus,
        setupInitialSuperAdmin,
        getDeletedContacts,
        getDeletedContactsCount,
        restoreContact,
        isAdmin: canManageContacts,
        isSuperAdmin,
        canManageContacts,
    };
}
