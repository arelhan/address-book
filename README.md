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

- Frontend: http://localhost:3001
- Backend: http://localhost:4000

## Ilk Calistirma

Eger veritabaninda henuz kullanici yoksa uygulama otomatik olarak setup akisine yonlenir.

- Setup sayfasi: `/setup`
- Bu sayfada ad soyad, kullanici adi, e-posta, TC, telefon ve parola girerek ilk `SUPER_ADMIN` hesabini olusturabilirsiniz.
- Kurulum tamamlandiktan sonra uygulama dogrudan giris yapar.
- Setup tamamlanmadan login sayfasi kullanilmaz.

Setup ekranini elle acmak isterseniz:

```text
http://localhost:3001/setup
```

## Dokploy Ile Deploy (Tek Compose Dosyasi)

Bu repo Dokploy uzerinde tek dosya ile deploy edilmeye uygundur. Ek bir compose dosyasi gerekmez, `docker-compose.yml` yeterlidir.

1. Kodu Git reposuna push edin.
2. Dokploy panelinde yeni bir Compose app olusturun.
3. Repo baglantisini yapin ve compose path olarak `docker-compose.yml` secin.
4. Gerekirse environment degiskenlerini Dokploy UI'dan override edin:
	- `BACKEND_URL=http://backend:4000`
	- `CORS_ORIGIN` (ozel domain kullaniyorsaniz frontend domainini girin)
5. Deploy edin.

Port notu:

- Dokploy paneli host tarafinda 3000 kullandigi icin, bu repoda frontend host portu `3001` olarak ayarlandi (`3001:3000`).
- Container ici frontend portu hala `3000` kaldigi icin Next.js ayarlari degismedi.
- Dokploy domain routing kullaniyorsaniz host port publish etmek zorunlu degildir; bu ayar sadece localhost port cakismasini onler.

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
