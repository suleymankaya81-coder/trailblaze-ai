## Destinasyon sayfası rötuşları

1. **Tiqets kartı görseli:** Şu anki şehir müzesi / akvaryum fotoğrafları yerine milli park ziyaretçi merkezi, park giriş kapısı veya manzara noktası fotoğrafları kullanılacak. Lisanslı Commons fotoğrafları olacak, kredileri gösterilecek. Bu fotoğraflar her destinasyonda farklı seçilecek.
2. **Mont (Packable Down Jacket) kartı:** Fotoğraf kartı tam doldurmuyor, boşluk kalıyor. Kart düzeltilecek ve gerçek bir mont / katmanlı giyim fotoğrafı eklenecek. Bunun için 2–3 lisanslı seçenek bulunacak.
3. **"Price on request" yazan kartlar:** Bu yazının yerine kart türüne göre tahmini başlangıç fiyatı gelecek. Örnekler: kamp alanı "Est. from $35/night", kabin "Est. from $120/night", karavan "Est. from $150/day". Fiyatların yanında "estimate" etiketi olacak; kesin fiyat partner sitesinde görünecek.
4. Yellowstone, Grand Teton ve Moab sayfaları masaüstü ve mobilde kontrol edilecek.

### Teknik
- `servicePhotos.json` dosyasına `parkentry` kategorisi eklenecek ve `jacket` kategorisi genişletilecek. Tiqets eşlemesi `TravelpayoutsCards` içinde `parkentry` olarak değişecek.
- Mont kartının görsel kapsayıcısı `object-cover` ile sabit oranlı olacak.
- Paylaşılan bir `estimatedFrom(category)` yardımcısı yazılacak. Bu yardımcı, fiyatı boş olan kartlarda kullanılacak ve küçük bir birim testle denetlenecek.
