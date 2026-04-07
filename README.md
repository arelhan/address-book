# Address Book

Yetkili adres defteri uygulamasi. Bu repo Docker ile calisir ve ilk kurulumda otomatik olarak super_admin olusturma akisi bulunur.

## Ozellikler

- Kisi ve firma kayitlari
- Arama, sayfalama ve iki sutunlu kart gorunumu
- Excel toplu yukleme
- Toplu pasif hale getirme ve super_admin icin geri aktivasyon
- Login, parola sifirlama ve rol tabanli erisim
- Kullanici yonetimi
- Audit log takibi
- Ilk calistirmada setup sayfasi ile super_admin olusturma

## Gereksinimler

- Docker
- Docker Compose

## Hizli Baslangic

1. Projeyi acin.
2. Uygulamayi calistirin:

```bash
docker compose up -d --build
```

3. Tarayicida frontend'i acin:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Ilk Calistirma

Eger veritabaninda henuz kullanici yoksa uygulama otomatik olarak setup akisine yonlenir.

- Setup sayfasi: `/setup`
- Bu sayfada ad soyad, kullanici adi, e-posta, TC, telefon ve parola girerek ilk `SUPER_ADMIN` hesabini olusturabilirsiniz.
- Kurulum tamamlandiktan sonra uygulama dogrudan giris yapar.
- Setup tamamlanmadan login sayfasi kullanilmaz.

Setup ekranini elle acmak isterseniz:

```text
http://localhost:3000/setup
```

## Temiz Ilk Kurulum

Eger uygulamayi baska bir bilgisayarda veya temiz bir veritabaniyla test etmek istiyorsaniz, volume'u sifirlayarak yeniden baslatabilirsiniz:

```bash
docker compose down -v
docker compose up -d --build
```

Bu durumda uygulama tekrar setup sayfasini acacaktir.

## Rol ve Erisim

- `VIEWER`: Sadece goruntuleme
- `ADMIN`: Kayit ekleme, guncelleme, pasif yapma
- `SUPER_ADMIN`: Kullanici yonetimi, audit log, pasif kayitlari listeleme ve tekrar aktif etme

## Pasif Kayitlar

Silme islemi fiziksel olarak kayit silmez. Kayitlar pasife cekilir ve normal kullanicilara gorunmez.

- Pasif kayitlar sayfasi sadece `SUPER_ADMIN` icindir.
- Bu sayfadan kayitlari tekrar aktif edebilirsiniz.

## Ortam Degiskenleri

Istege bagli olarak asagidaki degiskenleri kullanabilirsiniz:

- `CORS_ORIGIN`: Izin verilen frontend origin'i. Varsayilan `http://localhost:3000`.
- `JSON_LIMIT`: Backend JSON body limiti. Varsayilan `20mb`.
- `BULK_IMPORT_MAX`: Tek import isteginde kabul edilen maksimum kayit sayisi.
- `BULK_DELETE_MAX`: Tek toplu pasiflestirme isteginde kabul edilen maksimum id sayisi.
- `BULK_DELETE_CHUNK_SIZE`: Toplu pasiflestirmede kullanim chunk boyutu.
- `AUTH_TOKEN_TTL_MS`: Token gecerlilik suresi.
- `INITIAL_ADMIN_*`: Istege bagli ilk kurulum varsayilanlari.

## Gelistirme

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Notlar

- Backend saglik kontrolu `/health` uzerinden calisir.
- Arama Turkce karakter normalizasyonu destekler.
- Login / setup / audit log akislari frontend proxy uzerinden backend'e iletilir.
