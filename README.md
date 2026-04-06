# Address Book - Yapilan Gelistirmeler

Bu dokuman, son gelistirme turunda Docker, arama deneyimi ve import performansi icin yapilan iyilestirmeleri ozetler.

## 1) Docker ve Yerel Ag Erisimi

- Frontend ve backend servisleri `0.0.0.0` uzerinden dinleyecek sekilde guncellendi.
- `docker-compose.yml` ve `docker-compose.dev.yml` icinde host port publish ayarlari netlestirildi (`3000:3000`, `4000:4000`).
- Dev acilis sureleri icin `Dockerfile.dev` dosyalari eklendi.
- Her acilista agir kurulum calismamasi icin kosullu `npm ci` yaklasimi uygulandi.

## 2) Kisi/Firma Yonetimi Ozellikleri

- Toplu secip silme ozelligi eklendi.
- Backend tarafina `bulk-delete` endpoint'i eklendi.
- Detay sayfasinda bilgi duzenleme/guncelleme akisi iyilestirildi.
- Geri tusuna basildiginda arama metni ve sonuclarinin korunmasi icin arama state'i kalici hale getirildi.

## 3) Buyuk Excel/CSV Import Iyilestirmesi

650+ kayit ve gelecekte 10k+ kayit senaryolari icin import akisi guclendirildi:

- Frontend import islemi tek istekte degil, parca parca (chunk) gonderilecek sekilde duzenlendi.
- Import ilerleme durumu UI uzerinde gorunur hale getirildi.
- Backend `bulk` endpoint'i `rowOffset` destegi aldi; hatali satir numaralari dogru raporlaniyor.
- `BULK_IMPORT_MAX` ortam degiskeni ile tek istek ust limiti yonetilebilir hale getirildi.
- JSON body limiti `JSON_LIMIT` ile konfigure edilebilir yapildi (varsayilan: `20mb`).

## 4) Test ve Dogrulama

- Backend TypeScript derleme kontrolleri calistirildi.
- Frontend degisen dosyalar icin lint kontrolleri calistirildi.
- Chunk + rowOffset import davranisi canli endpoint uzerinde test edildi.

## Ortam Degiskenleri

Istege bagli olarak asagidaki degiskenleri kullanabilirsiniz:

- `BULK_IMPORT_MAX`: Tek import isteginde kabul edilen maksimum kayit sayisi.
- `JSON_LIMIT`: Backend `express.json` limit degeri.

## Hizli Calistirma

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Ardindan uygulamaya su adreslerden erisebilirsiniz:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
