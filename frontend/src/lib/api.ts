import {
    Contact,
    CreateContactInput,
    BulkImportResult,
    PaginatedContactsResponse,
    LoginInput,
    AuthUser,
    SetupStatusResponse,
    AuditLogEntry,
    CreateUserInput,
    ManagedUser,
    PasswordResetRequestInput,
    PasswordResetInput,
    UpdateUserInput,
    InitialSetupInput,
} from '../types';
import { getAuthToken } from './auth';

async function parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json() as Promise<T>;
    }
    return undefined as T;
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (auth) {
        const token = getAuthToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const res = await fetch(`/api${path}`, { ...options, headers });
    if (!res.ok) {
        const errorBody = await parseResponse<{ error?: string }>(res).catch(() => null);
        throw new Error(errorBody?.error || 'API Error');
    }

    return parseResponse<T>(res);
}

export const api = {
    async login(data: LoginInput): Promise<{ token: string; user: AuthUser }> {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }, false);
    },

    async getSetupStatus(): Promise<SetupStatusResponse> {
        return request('/auth/setup/status', {}, false);
    },

    async setupInitialSuperAdmin(data: InitialSetupInput): Promise<{ token: string; user: AuthUser }> {
        return request('/auth/setup', {
            method: 'POST',
            body: JSON.stringify(data),
        }, false);
    },

    async me(): Promise<{ user: AuthUser }> {
        return request('/auth/me');
    },

    async logout(): Promise<{ message: string }> {
        return request('/auth/logout', { method: 'POST' });
    },

    async createUser(data: CreateUserInput): Promise<{ user: AuthUser }> {
        return request('/auth/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async listUsers(): Promise<{ users: ManagedUser[] }> {
        return request('/auth/users');
    },

    async updateUser(id: string, data: UpdateUserInput): Promise<{ user: ManagedUser }> {
        return request(`/auth/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteUser(id: string): Promise<{ message: string }> {
        return request(`/auth/users/${id}`, { method: 'DELETE' });
    },

    async listAuditLogs(page = 1, pageSize = 20): Promise<{ items: AuditLogEntry[]; total: number; page: number; pageSize: number }> {
        return request(`/auth/logs?page=${page}&pageSize=${pageSize}`);
    },

    async requestPasswordReset(data: PasswordResetRequestInput): Promise<{ token: string }> {
        return request('/auth/password-reset/request', {
            method: 'POST',
            body: JSON.stringify(data),
        }, false);
    },

    async resetPassword(data: PasswordResetInput): Promise<{ message: string }> {
        return request('/auth/password-reset/confirm', {
            method: 'POST',
            body: JSON.stringify(data),
        }, false);
    },

    async getContacts(page = 1, pageSize = 20): Promise<PaginatedContactsResponse> {
        return request(`/contacts?page=${page}&pageSize=${pageSize}`);
    },

    async getDeletedContacts(page = 1, pageSize = 20): Promise<PaginatedContactsResponse> {
        return request(`/contacts/deleted?page=${page}&pageSize=${pageSize}`);
    },

    async getContactsCount(): Promise<number> {
        const data = await request<{ count: number }>('/contacts/count');
        return data.count;
    },

    async getDeletedContactsCount(): Promise<number> {
        const data = await request<{ count: number }>('/contacts/deleted/count');
        return data.count;
    },

    async searchContacts(query: string, page = 1, pageSize = 20): Promise<PaginatedContactsResponse> {
        return request(`/contacts/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
    },

    async getContact(id: string): Promise<Contact> {
        return request(`/contacts/${id}`);
    },

    async getContactChildren(id: string): Promise<Contact[]> {
        return request(`/contacts/${id}/children`);
    },

    async createContact(data: CreateContactInput): Promise<Contact> {
        return request('/contacts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateContact(id: string, data: Partial<CreateContactInput>): Promise<Contact> {
        return request(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteContact(id: string): Promise<void> {
        await request(`/contacts/${id}`, { method: 'DELETE' });
    },

    async restoreContact(id: string): Promise<{ message: string }> {
        return request(`/contacts/${id}/restore`, { method: 'POST' });
    },

    async bulkCreateContacts(contacts: CreateContactInput[], rowOffset = 0): Promise<BulkImportResult> {
        return request('/contacts/bulk', {
            method: 'POST',
            body: JSON.stringify({ contacts, rowOffset }),
        });
    },

    async bulkDeleteContacts(ids: string[]): Promise<{ deletedCount: number }> {
        return request('/contacts/bulk-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        });
    },
};

