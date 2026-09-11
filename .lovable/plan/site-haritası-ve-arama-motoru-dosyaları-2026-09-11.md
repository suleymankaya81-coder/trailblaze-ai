# Site haritası ve arama motoru dosyaları

Site haritası zaten otomatik üretiliyor, ama adres olarak eski `.lovable.app` adresi kullanılıyor ve sayfalarda "asıl adres" bilgisi eksik. Google'a temiz bir yapı sunmak için şunları düzenliyorum.

## Yapılacaklar

1. **Ana adres olarak minialife.com** — site haritasındaki tüm bağlantılar ve `robots.txt` içindeki site haritası satırı `https://minialife.com` üzerinden verilecek (şu an eski test adresi yazıyor).
2. **Tarih bilgisi düzeltmesi** — sabit sayfalara (hakkımızda, iletişim, gizlilik vb.) her istekte "bugün güncellendi" damgası basılıyor; bu yanıltıcı olduğu için kaldırılacak. Destinasyon sayfaları gerçek güncelleme tarihini korumaya devam edecek.
3. **Arama sayfası hariç tutulacak** — arama sonuç sayfası zaten arama motorlarına kapalı; site haritasına da girmeyecek (şu anda zaten yok, kontrol edilip sabitlenecek).
4. **Her sayfaya "asıl adres" etiketi** — ana sayfa, destinasyonlar listesi, her destinasyon sayfası ve tüm bilgi sayfalarına kendi tam adresini gösteren etiket ve paylaşım adresi eklenecek. Böylece aynı içeriğin farklı adreslerde kopya sayılması engellenir.
5. **Yayına alma** — bu değişiklikler canlı adreste ancak yayınlandıktan sonra görünür; onay verirsen düzenlemeden sonra yayınlarım.

## Search Console'a vereceğin adres

```text
https://minialife.com/sitemap.xml
```

Search Console'da "Site Haritaları" bölümüne `sitemap.xml` yazman yeterli.

## Teknik notlar

- `src/lib/seo/sitemap.server.ts`: sabit `BASE_URL = "https://minialife.com"`, statik yollarda `lastmod` kaldırılır, destinasyonlarda `updated_at` korunur.
- `public/robots.txt`: `Sitemap:` satırı minialife.com'a çevrilir.
- Rota dosyalarında `head().links` içine leaf seviyede `rel="canonical"` ve `meta` içine `og:url` eklenir; `__root.tsx`'e canonical eklenmez.
