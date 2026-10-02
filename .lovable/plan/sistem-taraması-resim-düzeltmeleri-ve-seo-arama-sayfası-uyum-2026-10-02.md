# Sistem taraması, resim düzeltmeleri ve SEO arama sayfası uyumu

## Taramada bulunanlar

**Genel durum:** Derleme hatası ve sayfa hatası kaydı yok. Yayındaki 20 destinasyon açılıyor, taslaklar gizli.

**Resimler (20 yayındaki destinasyon):**
- 3 çift destinasyon aynı kapak fotoğrafını kullanıyor, yani en az 3 tanesi yanlış:
  - Moab & Arches = Shenandoah (Shenandoah'ta çöl kayası fotoğrafı)
  - Lake Tahoe = Mount Rainier
  - Asheville = Great Smoky Mountains
- Bahsettiğin "resim şablonları" bu projede bulunmuyor. Ne bir fotoğraf kuralı ne de fotoğraf sahibi bilgisi alanı var. Resim bulma aracı yazılmış ama hiç çalıştırılmamış. Bu kurallar büyük ihtimalle GitHub'daki depoda kaldı ve buraya gelmedi.
- Partner kartları (Campspot, RoverPass, Harvest Hosts, RentCars) destinasyonun kapak fotoğrafını kopyalıyor. Yanlış kapak oralara da taşınıyor.

**SEO arama sayfaları (Aşama 3 yapısı):**
- Uyan taraflar: bir destinasyona birden fazla adres verilebiliyor, her adres tek ve benzersiz, sayfa türü, anahtar kelime, arama hacmi ve zorluk alanları var.
- Eksikler:
  1. Sayfa türleri insanların gerçek aramalarını tam karşılamıyor. Örneğin "cabins", "things to do", "best time to visit", "near [şehir]", "hotels" gibi sık aramalar için ayrı tür yok. Hepsi "other" türüne düşer.
  2. Adres sadece tek parça olabiliyor (`/yellowstone-camping`). Bu iyi, ama hangi kalıpların kullanılacağı (`camping-near-yellowstone` mı, `yellowstone-camping` mi) belirlenmemiş.
  3. Hangi aramaların önemli olduğu henüz bilinmiyor; anahtar kelime verisi boş.
  4. Sayfalar henüz sitede açılmıyor (bilinçli olarak ertelendi).

## Yapılacaklar

1. **Yanlış resimleri düzelt:** Shenandoah, Mount Rainier ve Great Smoky Mountains için doğru, ismiyle eşleşen fotoğraflar seçilecek. Diğer 17 destinasyonun kapak ve galeri fotoğraflarına tek tek bakılacak, yanlış olanlar da değiştirilecek. Partner kartlarının fotoğrafları da güncellenecek.
2. **Resim kuralını projeye ekle:** Bir fotoğrafın birden fazla destinasyonda kullanılmasını veritabanı engelleyecek. Kapak fotoğrafının boş bırakılması da engellenecek. Fotoğraf sahibi bilgisi için bir alan eklenecek.
3. **Gerçek aramaları araştır:** Semrush ile (Google arama verisi sunan servis) Yellowstone, Yosemite ve Grand Canyon için en çok aranan kalıplar çıkarılacak. Örnekler: "yellowstone camping", "yellowstone cabins", "camping near yellowstone", "yellowstone rv parks", "things to do in yellowstone". Sonuç sana tablo olarak sunulacak.
4. **Yapıyı aramalara göre genişlet:** Araştırma sonucuna göre sayfa türlerine sık aramalar eklenecek (örn. cabins, rv_parks, things_to_do, best_time, near_city). Kullanılacak adres kalıbı belirlenip kayıtlara kural olarak eklenecek. Adresi destinasyon adıyla başlamayan kayıtlar reddedilecek.
5. **Sayfa oluşturma yok:** Bu adımda gerçek arama sayfası üretilmeyecek ve sitede yeni adres açılmayacak. Bu, senin onayından sonraki aşamaya kalacak.

## Teknik detaylar

- Resimler, yalnızca 20 yayındaki destinasyon için veri güncellemesiyle değişecek. Taslak destinasyonların resimleri bu aşamada taranmayacak; istenirse ayrıca yapılır.
- Yeni değişiklik dosyası: yayındaki kayıtlar için `hero_image` benzersizliği (status='published' kısmi benzersiz indeks) ve `photo_credit` alanı. Mevcut kayıtlar silinmeyecek.
- `landing_page_type` listesine yeni değerler eklenecek (mevcut değerler korunur). `seo_landing_pages`'e adresin destinasyon slug'ı veya takma adıyla başladığını kontrol eden bir tetikleyici eklenecek.
- `/destinations/{slug}`, ana sayfa tasarımı, Awin/GetYourGuide bağlantıları ve harita değişmeyecek.
