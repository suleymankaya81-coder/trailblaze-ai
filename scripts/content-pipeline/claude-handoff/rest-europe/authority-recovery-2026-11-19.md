# Otorite ülke ve park bağlantıları — 19 Kasım 2026

- Avrupa menüsü Wayback üzerinden yeniden alındı (200). Hırvatistan, Estonya, Macaristan, Letonya, Litvanya, Polonya, Romanya ve Slovenya kataloglarının tamamı eski ülke adresleriyle `authority-country-links.json` içinde ilişkilendirildi. Bu ilişki eski park adresinin bulunduğu anlamına gelmez.
- Norveç, İsveç, Finlandiya, İzlanda, İrlanda ve Hollanda'nın eksik ülke yönlendirmeleri eklendi. Önizlemede altı eski adres 301, altı ülke hedefi 200 döndü. Henüz yayımlanmamış sekiz ülkeye kırık yönlendirme yapılmıyor; yayın coğrafyası güncellendiğinde ülke bağlantısı etkinleşir.
- İsviçre'nin eski menü bağlantısı Slovenya ile aynı `/eu/sl/sl.htm` adresidir. Yanlış İsviçre kodu üretilmedi; Belçika ve Danimarka için de kanıtsız eski adres eklenmedi.
- Karadağ kataloğundaki `List of national parks of Montenegro` destinasyon olmayan bir liste sayfasıydı, kaldırıldı. Wikipedia metninin millî park statüsünü doğruladığı mevcut `lake-skadar` kaydı park olarak eşlendi; kopya destinasyon yaratılmadı. Beş gerçek park kimliği korunuyor. Toplam aday sayısı 819.
- 18 eski ülke sayfası 404 verdi, altı istekte bağlantı kurulamadı; CDX dizini 503 verdi. Eski park adreslerinin tamamı kurtarıldı denemez. Bu engeller `evidence/authority-recovery-2026-11-19.json` içinde kayıtlı.
- 32 JavaScript ve üç Python testi geçti; önizleme derlemesi başarılı. Yayındaki Norveç hedefi bu kontrolde 404 döndü; önizleme düzeltmeleri site yayını yapılana kadar canlı sitede doğrulanmış sayılmaz. Site veya destinasyon yayımlanmadı.
- Son erişim kontrolü: 24 eski ülke eşlemesinin tamamında 301 hedefi doğrulandı. Yayımlanmış 16 ülke telefon ve bilgisayarda, açık ve koyu görünümde 64 kez açıldı; her kontrolde sonraki gerçek destinasyon bağlantısı da 200 döndü, yatay taşma bulunmadı. Bu kontrol eski park adreslerinin kurtarıldığını veya tüm harita katmanlarının yüklendiğini göstermez. Otorite domaininin DNS ve sahiplik kontrolü ayrıca başarılıdır.

Kod değişiklikleri: `legacy.ts` doğrulanmış ülke eşlemeleri ve yayın koruması; `legacy.test.ts` yönlendirme testleri; `authority_parks.py` Skadar ad eşlemesi ve liste sayfalarını reddetme; `test_authority_recovery.py` katalog denetimleri. Katalog, kapsam ve kaynak kayıtları ayrıca güncellendi.

## Yayın isteği — 19 Kasım 05:56 UTC

Kullanıcının tamamla talebi üzerine site yayını istendi. 32 JavaScript ve üç Python testi tekrar geçti. İlk canlı kontrolde altı eski adres hâlâ genel destinasyon dizinine yönlendi, Norveç ülke hedefi 404 verdi; yeni yayının canlıya ulaştığı henüz doğrulanmadı. Arşiv yeniden denendi: Norveç/Hırvatistan ülke kayıtları 404, CDX 503; eski park adresleri için dış kaynak engeli sürüyor. Yeni destinasyon yayımlanmadı.