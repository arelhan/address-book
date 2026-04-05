# Adres Defteri Uygulaması — Geliştirme Promptu

## Proje Özeti

Spotlight tarzı arama arayüzüne sahip, kişi / firma / kurum ayrımı yapmadan **tek bir unified Contact modeli** üzerinden çalışan modern bir adres defteri uygulaması. Backend ve frontend ayrı projeler olarak geliştirilecek.

---

## Teknik Yığın

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM |
| **Veritabanı** | SQLite (geliştirme), PostgreSQL (üretim) |
| **Doğrulama** | Zod (her iki tarafta paylaşılabilir) |

---

## 1. Veri Modeli (Prisma Schema)

Temel felsefe: **Tek bir `Contact` tablosu**, `type` alanı ile kişi/firma/kurum ayrımı yapılır. Telefon numaraları ayrı bir tabloda one-to-many ilişki ile tutulur. Hiyerarşi (alt birim / üst birim) self-referencing relation ile sağlanır.

```prisma
model Contact {
  id          String   @id @default(cuid())
  type        ContactType // PERSON | COMPANY | INSTITUTION
  name        String      // Kişi adı-soyadı, firma ünvanı veya kurum adı
  title       String?     // Ünvan (Müdür, Direktör vb.)
  email       String?
  address     String?
  notes       String?
  avatarUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // İlişkiler
  phones      Phone[]
  parentId    String?
  parent      Contact?   @relation("SubUnits", fields: [parentId], references: [id])
  children    Contact[]  @relation("SubUnits")

  @@index([type])
  @@index([name])
}

enum ContactType {
  PERSON
  COMPANY
  INSTITUTION
}

model Phone {
  id        String @id @default(cuid())
  number    String
  label     String @default("Cep") // Cep, İş, Ev, Faks vb.
  contactId String
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
}
```

### Hiyerarşi Örnekleri

- `Kurum: Belediye` → alt birim: `Fen İşleri Müdürlüğü` → kişi: `Ahmet Yılmaz`
- `Firma: ABC Ltd.` → alt birim: `Satış Departmanı` → kişi: `Mehmet Kaya`
- Bir kişi doğrudan bir firmaya/kuruma `parentId` ile bağlanabilir.

---

## 2. Backend API (Express + TypeScript)

### Proje Yapısı

```
backend/
├── src/
│   ├── index.ts           # Express app bootstrap
│   ├── routes/
│   │   └── contacts.ts    # Tüm contact route'ları
│   ├── controllers/
│   │   └── contactController.ts
│   ├── services/
│   │   └── contactService.ts
│   ├── validators/
│   │   └── contactSchema.ts  # Zod şemaları
│   ├── prisma/
│   │   └── client.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

### API Endpointleri

```
GET    /api/contacts              # Liste (filtre, arama, sayfalama)
GET    /api/contacts/search?q=    # Spotlight arama (debounced, fuzzy)
GET    /api/contacts/:id          # Detay (phones + children dahil)
POST   /api/contacts              # Yeni kayıt (phones dizisi ile birlikte)
PUT    /api/contacts/:id          # Güncelle
DELETE /api/contacts/:id          # Sil
GET    /api/contacts/:id/children # Alt birimleri / bağlı kişileri getir
```

### Arama Endpoint Detayı (`GET /api/contacts/search?q=`)

```typescript
// contactService.ts
async function searchContacts(query: string) {
  return prisma.contact.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
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
}
```

### Zod Doğrulama Şeması

```typescript
// contactSchema.ts
import { z } from 'zod';

const phoneSchema = z.object({
  number: z.string().min(7).max(20),
  label: z.string().default('Cep'),
});

export const createContactSchema = z.object({
  type: z.enum(['PERSON', 'COMPANY', 'INSTITUTION']),
  name: z.string().min(1).max(200),
  title: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  parentId: z.string().cuid().optional().nullable(),
  phones: z.array(phoneSchema).min(0).max(10),
});
```

### CORS Konfigürasyonu

```typescript
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
```

---

## 3. Frontend (Next.js 14 + TypeScript)

### Proje Yapısı

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Ana sayfa (Spotlight arama)
│   │   └── contacts/
│   │       └── [id]/
│   │           └── page.tsx  # Kişi detay sayfası
│   ├── components/
│   │   ├── SpotlightSearch.tsx
│   │   ├── ContactCard.tsx
│   │   ├── ContactForm.tsx
│   │   ├── PhoneInput.tsx      # Dinamik telefon ekleme
│   │   ├── ContactTypeSelector.tsx
│   │   ├── HierarchyTree.tsx   # Alt birim ağacı
│   │   └── ui/
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       └── AnimatedList.tsx
│   ├── hooks/
│   │   ├── useSearch.ts        # Debounced arama hook
│   │   └── useContacts.ts
│   ├── lib/
│   │   └── api.ts              # Fetch wrapper
│   └── types/
│       └── index.ts
├── package.json
└── tailwind.config.ts
```

---

## 4. UI/UX Tasarım Detayları

### 4.1 Spotlight Arama (Ana Ekran)

Uygulama açıldığında ekranın ortasında **macOS Spotlight benzeri** büyük bir arama kutusu yer alır. Arka plan hafif bir gradient veya dokulu bir yüzey olabilir.

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│          🔍  Kişi, firma veya kurum ara...        │
│          ┌──────────────────────────────┐        │
│          │                              │        │
│          └──────────────────────────────┘        │
│               [+ Yeni Kayıt]                     │
│                                                  │
│  Yazmaya başladığında aşağıda kartlar belirir:   │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Ahmet Y.   │  │ ABC Ltd.   │  │ Belediye   │ │
│  │ 📱 0532... │  │ 📞 0262... │  │ 📞 0222... │ │
│  │ Kişi       │  │ Firma      │  │ Kurum      │ │
│  └────────────┘  └────────────┘  └────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Davranış:**
- Boşken: Sadece arama kutusu ve "Yeni Kayıt" butonu görünür.
- Yazarken (300ms debounce): Arama kutusu yukarı kayar (animate), altında sonuç kartları **staggered fade-in** ile belirir.
- Sonuç yoksa: "Kayıt bulunamadı" mesajı soft animasyonla gösterilir.

### 4.2 Sonuç Kartları (ContactCard)

Her kart şunları gösterir:
- **Sol üst:** Contact type badge (renk kodlu — Kişi: mavi, Firma: yeşil, Kurum: turuncu)
- **İsim** (büyük, bold)
- **İlk telefon numarası** (hızlı erişim için)
- **Bağlı olduğu üst birim** (varsa küçük etiket olarak)
- **Alt birim sayısı** (varsa: "3 alt birim" şeklinde)

```typescript
// ContactCard.tsx — Framer Motion ile
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
  className="cursor-pointer rounded-xl border p-4"
>
  {/* kart içeriği */}
</motion.div>
```

**Kart Tıklama:** Detay sayfasına yönlendirir veya bir slide-over panel açar.

### 4.3 Kayıt Ekleme / Düzenleme Formu (Modal)

"Yeni Kayıt" butonuna tıklayınca açılan modal form:

1. **Tip Seçici** (üstte 3 buton — segmented control tarzı):
   - `Kişi` | `Firma` | `Kurum`
   - Seçime göre form alanları hafifçe değişir (ör: Kişi seçildiğinde "Ünvan" alanı belirir)

2. **Temel Alanlar:**
   - İsim (zorunlu)
   - E-posta
   - Adres
   - Ünvan (sadece Kişi tipinde)
   - Notlar

3. **Telefon Numaraları (Dinamik):**
   - Başlangıçta 1 telefon alanı
   - `+ Telefon Ekle` butonu ile yeni satır eklenir
   - Her satır: `[Etiket Dropdown: Cep/İş/Ev/Faks] [Numara Input] [Sil ✕]`
   - Framer Motion ile ekleme/silme animasyonu

4. **Üst Birim Bağlantısı:**
   - Aranabilir dropdown (firma/kurum listesinden seçim)
   - İsteğe bağlı

### 4.4 Detay Görünümü

Bir kaydın detay sayfası veya slide-over paneli:

- Tüm bilgiler düzenli şekilde gösterilir
- Telefon numaralarının yanında "Ara" ve "Kopyala" ikonları
- Eğer alt birimleri/kişileri varsa → **iç içe açılabilir ağaç yapısı** (collapsible tree)
- Düzenle ve Sil butonları

### 4.5 Animasyonlar

| Element | Animasyon |
|---------|-----------|
| Arama kutusu | Yazmaya başlayınca yukarı kayma (`layout` animasyonu) |
| Sonuç kartları | Staggered fade-in (her kart 50ms gecikmeyle) |
| Modal açılma | Scale + fade (0.95 → 1.0) + backdrop blur |
| Telefon satırı ekleme | Height + opacity animasyonu |
| Telefon satırı silme | Collapse + fade-out |
| Tip seçici | Active tab altında sliding indicator |
| Kart hover | Subtle scale (1.02) + shadow genişleme |
| Badge | Küçük pulse animasyonu (yeni eklenenlerde) |

---

## 5. Debounced Arama Hook

```typescript
// hooks/useSearch.ts
import { useState, useEffect, useCallback } from 'react';

export function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    fetch(`http://localhost:4000/api/contacts/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  return { query, setQuery, results, isLoading };
}
```

---

## 6. Paylaşılan Tipler

```typescript
// types/index.ts
export type ContactType = 'PERSON' | 'COMPANY' | 'INSTITUTION';

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
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  avatarUrl?: string | null;
  phones: Phone[];
  parentId?: string | null;
  parent?: { id: string; name: string; type: ContactType } | null;
  children?: Contact[];
  _count?: { children: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  type: ContactType;
  name: string;
  title?: string;
  email?: string;
  address?: string;
  notes?: string;
  parentId?: string | null;
  phones: { number: string; label: string }[];
}
```

---

## 7. Çalıştırma

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run dev    # http://localhost:4000

# Frontend
cd frontend
npm install
npm run dev    # http://localhost:3000
```

---

## 8. Ekstra Notlar

- **Klavye navigasyonu:** Spotlight aramada ↑↓ tuşları ile kartlar arasında gezinme, Enter ile seçim.
- **Responsive:** Mobilde kartlar tek sütun, masaüstünde 2-3 sütun grid.
- **Boş durum:** Hiç kayıt yokken güzel bir illustration veya mesaj göster.
- **Hızlı telefon kopyalama:** Kart üzerinde telefon numarasına tıklayınca panoya kopyala + küçük toast bildirimi.
- **Renk paleti önerisi:** Koyu tema destekli, birincil renk olarak slate/zinc tonları, vurgu rengi olarak amber veya emerald.
