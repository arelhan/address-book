export type ContactType = 'PERSON' | 'COMPANY';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface Phone {
    id: string;
    number: string;
    label: string;
}

export interface Contact {
    id: string;
    type: ContactType;
    name: string;
    title?: string | null;
    department?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    avatarUrl?: string | null;
    phones: Phone[];
    parentId?: string | null;
    parent?: { id: string; name: string; type: ContactType } | null;
    children?: Contact[];
    _count?: { children: number };
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactInput {
    type: ContactType;
    name: string;
    title?: string;
    department?: string;
    email?: string;
    address?: string;
    notes?: string;
    parentId?: string | null;
    phones: { number: string; label: string }[];
}

export interface AuthUser {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: UserRole;
}

export interface LoginInput {
    identifier: string;
    password: string;
}

export interface SetupStatusResponse {
    needsSetup: boolean;
}

export interface InitialSetupInput {
    fullName: string;
    username: string;
    email: string;
    nationalId: string;
    phone: string;
    password: string;
}

export interface CreateUserInput {
    fullName: string;
    username: string;
    email: string;
    nationalId: string;
    phone: string;
    role: UserRole;
    password: string;
}

export interface UpdateUserInput {
    fullName: string;
    username: string;
    email: string;
    nationalId: string;
    phone: string;
    role: UserRole;
    password?: string;
}

export interface ManagedUser {
    id: string;
    fullName: string;
    username: string;
    email: string;
    nationalId: string;
    phone: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLogUser {
    id: string;
    fullName: string;
    username: string;
    role: UserRole;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
    user?: AuditLogUser | null;
}

export interface PasswordResetRequestInput {
    username: string;
    nationalId: string;
    phone: string;
}

export interface PasswordResetInput {
    token: string;
    password: string;
}

export interface PaginatedContactsResponse {
    items: Contact[];
    total: number;
    page: number;
    pageSize: number;
}

export interface BulkImportResult {
    summary: {
        total: number;
        success: number;
        failed: number;
    };
    errors: Array<{
        row: number;
        errors: Record<string, string[]>;
    }>;
}

