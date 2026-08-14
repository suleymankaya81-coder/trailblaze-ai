# Sovrn Commerce uyumluluk düzenlemeleri (onay bekliyor)

Sovrn Publisher Code of Conduct maddelerine göre sitede eksik olan noktalar ve önerdiğim düzeltmeler. Hiçbiri uygulanmadı — onayını bekliyorum.

## 1. Outbound link şeffaflığı (Non-Bona Fide Clicks / Interference with Referral)
- Tüm affiliate butonlarına `rel="sponsored nofollow noopener"` eklenecek (şu an sadece `noopener noreferrer`).
- Her affiliate butonunun yanına küçük görünür etiket: "Partner bağlantısı — komisyon kazanabiliriz" + hover/title ile gidilecek partner adı (RVshare, Hipcamp vb.). Sovrn "okuyucu nereye gittiğini her an bilmeli" diyor.
- Tıklama takibi yalnız gerçek kullanıcı tıklamasıyla tetiklenecek; sayfa yüklenirken hiçbir tracking/redirect çağrısı yapılmayacak (mevcut kodda prefetch/auto-call olmadığını doğrulayacağım).
- Yönlendirme "cloaking" gibi görünmemesi için: tıklamadan sonra ara sayfa/gizli yönlendirme yerine doğrudan partner URL'ine `window.open` ile gidilecek, tarayıcı geri tuşu çalışır kalacak; kaynak sayfa URL'si gizlenmeyecek.
- `afsrc=1` parametresi taşıyan linklerin yeniden affiliate edilmemesi için adapter katmanına kontrol eklenecek.

## 2. robots.txt + bot filtresi (zorunlu madde)
- `public/robots.txt` oluşturulacak: bilinen bot/crawler'lar affiliate çıkış yollarından (`/go/*`, tracking uçları) engellenecek, sitemap referansı verilecek.
- Sunucu tarafı tıklama kaydında basit bot filtresi: bilinen bot user-agent'ları ve headless imzaları `click_events`'e yazılmayacak.

## 3. İnce içerik / "4 ay içerik ve trafik" maddesi
- Katalogdaki 426 boş destinasyon sayfası (tagline, görsel, teklif yok) `noindex, nofollow` alacak ve sitemap'ten çıkarılacak; yayındaki 20 zengin sayfa indekslenecek.
- Keşif sayfasındaki boş kayıtlar "yakında" olarak işaretlenip affiliate butonu göstermeyecek (yanıltıcı içerik maddesi).

## 4. Disclosure görünürlüğü (Channel Content / labeling)
- Affiliate link içeren her destinasyon sayfasının üstüne, ilk butondan önce görünür tek satır disclosure bandı: "Bu sayfa partner bağlantıları içerir." + Affiliate Disclosure sayfasına link.
- Footer'da disclosure linki daha görünür hale gelecek.
- Affiliate Disclosure metnine Sovrn Commerce ve üçüncü taraf affiliate ağları üzerinden çalıştığımız açıkça eklenecek.

## 5. Privacy Policy güncellemesi
- Sovrn ve affiliate ağlarıyla veri paylaşımı, tıklama takibi ve opt-out yolu açıkça yazılacak.
- 16 yaş altı hedeflememe beyanı eklenecek (Sovrn "16 yaş altına yönelik olamaz" diyor; mevcut metin 13 diyor).

## 6. İçerik ve iddia hijyeni (Advertising Claims / Trademarks)
- Sayfa başlıkları ve meta açıklamalarında marka isimlerinin (REI, Hipcamp vb.) tanıtım amaçlı kullanımı taranacak; marka adı yalnız partner referansı olarak metin içinde kalacak, title/meta/URL'lerden çıkarılacak.
- AI üretimi metinlerde fiyat garantisi, "en ucuz", sağlık/güvenlik iddiası gibi doğrulanamaz ifadeler engellenecek (prompt kuralı + görülen metinlerde temizlik).
- Yapay/tahmini fiyatlar "tahmini aralık, partner sitesinde değişebilir" notuyla etiketlenecek.

## 7. Kimlik ve iletişim şeffaflığı
- About ve Contact sayfalarına gerçek yayıncı kimliği, iletişim e-postası ve yanıt süresi bilgisi eklenecek (Sovrn hesap doğrulaması ve promotional inquiry maddesi için gerekli).

## 8. Yasak yöntemlerin olmadığının doğrulanması
- Pop-up/pop-under, otomatik indirme, gizli iframe, otomatik yönlendirme, e-posta/SMS pazarlama: kodda tarayıp olmadığını raporlayacağım (şu an görünmüyor, yazılı teyit vereceğim).

## Teknik notlar
Etkilenecek dosyalar: `src/routes/destinations.$slug.tsx`, `src/lib/affiliates/*`, `src/lib/seo/sitemap.server.ts`, `src/routes/privacy.tsx`, `src/routes/affiliate-disclosure.tsx`, `src/routes/about.tsx`, `src/routes/contact.tsx`, `src/components/site/Footer.tsx`, yeni `public/robots.txt`.

Onaylarsan hepsini sırayla uygularım; sadece bir kısmını istersen madde numaralarını yaz.
