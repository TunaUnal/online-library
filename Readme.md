# 📁 Dosya Paylaşım Platformu

Bu platform okul, iş merkezi, kütüphane, dershane gibi yerlerde kullanıcıların **ortak ve local** bir sistemde dosylarını paylaşabilmesini amaçlayan bir projedir.

Kullanıcılar kendi hesapları ile sisteme girip sistemdeki dosyalardan ihtiyacı olanı görüntüleyebilir/indirebilir.

Aynı zamanda elinde olan dosyayı diğer kullanıcılar ile paylaşabilir. Paylaştığı dosyaların istatistiklerini inceleyebilir (henüz değil :))

Yöneticiler kullanıcılar tarafından yüklenen dosyaları onaylayabilir/reddebilir. Buna bağlı olarak dosya paylaşılır veya silinir. Event-driven mimarisi ile bu olaylar kullanıcıya bildirim olarak gider.

İsteğe bağlı olarak uzak canlıya alınsa da lokal olarak da kullanılabilir. Dosya güvenliği ve hız açısından local server tercih edilebilir.

## 🔐 Güvenlik Çalışmalarım (Bazıları yapıldı, bazıları planlandı)

- Sistemde _login_ işlemi hariç bütün istekler JWT ile korunur. Giriş yapmamış istekler ve giriş yaptığı halde yetkisi olmayan işlemlerin istekleri loglanır, admine bildirim gider.
- Yüklenen dosyaların _dosya adları_ random + uniq şekilde belirlenir, asla kullanıcıya gösterilmez. Örneğin kullanıcının "Elektrik Mühendisliği Devre Teorisi 2 1.Vize Çıkmışları" dosyası sunucuda "98vdf42s98dvf4-fv5sd4f-vfx256.pdf" olarak tutulur. Doğrudan erişim engellenmiş olur. Buna ek olarak bu isim bilinse bile **Router** doğrudan erişimleri engeller. Dosya indirme işlemleri JWT doğrulamasından geçerek backend tarafından yapılır. Böylece bütün indirme işlemleri kayıt altında olur.

## 🚀 Özet Özellikler

- 🔐 JWT tabanlı kimlik doğrulama
- 📤 Dosya yükleme, indirme ve silme
- 📈 Dosya indirme istatistikleri (hit sistemi)
- 🧠 Event-driven mimari (loglama, bildirim, alarm sistemi)
- 🧩 Katmanlı yapı (controller, service, repository)
- 🔔 Gerçek zamanlı bildirim alt yapısı (hazır event emitter)
- 🧱 Role ve sahiplik bazlı erişim kontrolü (middleware)
- 🪵 Hem dosya hem veritabanı loglaması

---
