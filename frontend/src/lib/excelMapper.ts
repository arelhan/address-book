import * as XLSX from 'xlsx';
import { CreateContactInput, ContactType } from '../types';

const COLUMN_MAP: Record<string, string> = {
    // Type
    'tür': 'type', 'tur': 'type', 'tip': 'type', 'type': 'type',
    // Name
    'ad': 'name', 'ad soyad': 'name', 'adsoyad': 'name', 'isim': 'name',
    'name': 'name', 'firma': 'name', 'firma adı': 'name',
    'firma ünvanı': 'name',
    // Title
    'ünvan': 'title', 'unvan': 'title', 'title': 'title', 'görev': 'title', 'gorev': 'title',
    // Department
    'birim': 'department', 'departman': 'department', 'department': 'department', 'bölüm': 'department', 'bolum': 'department',
    // Email
    'e-posta': 'email', 'eposta': 'email', 'email': 'email', 'mail': 'email',
    // Phone
    'telefon': 'phone', 'tel': 'phone', 'phone': 'phone', 'cep': 'phone',
    'telefon numarası': 'phone', 'cep telefonu': 'phone',
    // Phone label
    'telefon etiketi': 'phoneLabel', 'tel etiketi': 'phoneLabel',
    'telefon türü': 'phoneLabel', 'phone label': 'phoneLabel',
    // Address
    'adres': 'address', 'address': 'address',
    // Notes
    'notlar': 'notes', 'not': 'notes', 'notes': 'notes', 'açıklama': 'notes',
};

const TYPE_MAP: Record<string, ContactType> = {
    'kişi': 'PERSON', 'kisi': 'PERSON', 'person': 'PERSON', 'bireysel': 'PERSON',
    'firma': 'COMPANY', 'company': 'COMPANY', 'şirket': 'COMPANY', 'sirket': 'COMPANY',
};

export const FIELD_OPTIONS = [
    { value: 'type', label: 'Tür' },
    { value: 'name', label: 'Ad' },
    { value: 'title', label: 'Ünvan' },
    { value: 'department', label: 'Birim' },
    { value: 'email', label: 'E-posta' },
    { value: 'phone', label: 'Telefon' },
    { value: 'phoneLabel', label: 'Telefon Etiketi' },
    { value: 'address', label: 'Adres' },
    { value: 'notes', label: 'Notlar' },
    { value: '_skip', label: '— Atla —' },
];

export interface ParsedExcel {
    headers: string[];
    rows: Record<string, string>[];
}

export function autoDetectMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    for (const header of headers) {
        const normalized = header.toLowerCase().trim();
        const field = COLUMN_MAP[normalized];
        mapping[header] = field || '_skip';
    }
    return mapping;
}

export async function parseExcelFile(file: File): Promise<ParsedExcel> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (jsonData.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = Object.keys(jsonData[0]);
    const rows = jsonData.map(row => {
        const stringRow: Record<string, string> = {};
        for (const key of headers) {
            stringRow[key] = String(row[key] ?? '').trim();
        }
        return stringRow;
    });

    return { headers, rows };
}

export function downloadTemplate() {
    const headers = ['Tür', 'Ad Soyad', 'Ünvan', 'Birim', 'Telefon', 'Telefon Etiketi', 'E-posta', 'Adres', 'Notlar'];
    const sampleRows = [
        ['Kişi', 'Ahmet Yılmaz', 'Müdür', 'İnsan Kaynakları', '05321234567', 'Cep', 'ahmet@firma.com', 'Atatürk Cad. No:1 Ankara', 'Pazartesi müsait'],
        ['Kişi', 'Ayşe Demir', 'Mühendis', 'Ar-Ge', '05559876543;02121234567', 'Cep', 'ayse@firma.com', '', ''],
        ['Firma', 'ABC Teknoloji Ltd.', '', '', '02121112233', 'İş', 'info@abc.com', 'Levent, İstanbul', 'Yazılım firması'],
        ['Firma', 'XYZ Danışmanlık', '', '', '02125554433', 'İş', '', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

    // Kolon genişlikleri
    ws['!cols'] = [
        { wch: 10 }, // Tür
        { wch: 25 }, // Ad Soyad
        { wch: 15 }, // Ünvan
        { wch: 20 }, // Birim
        { wch: 25 }, // Telefon
        { wch: 15 }, // Telefon Etiketi
        { wch: 25 }, // E-posta
        { wch: 30 }, // Adres
        { wch: 25 }, // Notlar
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kişiler');
    XLSX.writeFile(wb, 'adres-defteri-sablon.xlsx');
}

export function mapRowsToContacts(
    rows: Record<string, string>[],
    headerMapping: Record<string, string>
): CreateContactInput[] {
    return rows
        .filter(row => {
            const nameHeader = Object.entries(headerMapping).find(([, field]) => field === 'name')?.[0];
            return nameHeader && row[nameHeader]?.trim();
        })
        .map(row => {
            let type: ContactType = 'PERSON';
            let name = '';
            let title = '';
            let department = '';
            let email = '';
            let phone = '';
            let phoneLabel = 'Cep';
            let address = '';
            let notes = '';

            for (const [header, field] of Object.entries(headerMapping)) {
                const value = row[header] || '';
                switch (field) {
                    case 'type': {
                        const normalized = value.toLowerCase().trim();
                        type = TYPE_MAP[normalized] || 'PERSON';
                        break;
                    }
                    case 'name': name = value; break;
                    case 'title': title = value; break;
                    case 'department': department = value; break;
                    case 'email': email = value; break;
                    case 'phone': phone = value; break;
                    case 'phoneLabel': phoneLabel = value || 'Cep'; break;
                    case 'address': address = value; break;
                    case 'notes': notes = value; break;
                }
            }

            const phones = phone
                ? phone.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0).map(number => ({
                    number: String(number),
                    label: phoneLabel,
                }))
                : [];

            return {
                type,
                name,
                ...(title && { title }),
                ...(department && { department }),
                ...(email && { email }),
                ...(address && { address }),
                ...(notes && { notes }),
                phones,
            };
        });
}
