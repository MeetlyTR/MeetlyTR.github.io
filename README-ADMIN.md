# 🚀 Site Yönetim Paneli Kullanım Kılavuzu

## Admin Paneline Erişim

Admin paneline şu adresten erişebilirsiniz:
- **URL**: `https://meetlytr.github.io/admin.html`
- **Yerel**: `http://localhost/admin.html` (local server çalıştırıyorsanız)

🔐 **Güvenlik**: Admin paneli şifre korumalıdır. Şifreyi `admin.html` dosyasındaki `ADMIN_PASSWORD` değişkeninden değiştirebilirsiniz.

### Varsayılan Şifre
- Varsayılan şifre: `Meetly2024!`
- Şifreyi değiştirmek için `admin.html` dosyasını düzenleyin

## Özellikler

### 1. Hero Section (Ana Sayfa Başlık Bölümü)
- Başlık, alt başlık ve açıklama metinlerini düzenleyebilirsiniz
- İngilizce ve Türkçe versiyonları ayrı ayrı düzenlenebilir
- Arka plan resmi yükleyebilirsiniz

### 2. Hakkımda (About)
- 4 paragraf metin düzenleyebilirsiniz
- Profil resmi yükleyebilirsiniz
- İngilizce ve Türkçe versiyonları

### 3. Servisler (Services)
- Yeni servis ekleyebilirsiniz
- Mevcut servisleri düzenleyebilir veya silebilirsiniz

### 4. Projeler (Projects)
- Yeni proje ekleyebilirsiniz
- Proje resimleri yükleyebilirsiniz
- Proje açıklamalarını düzenleyebilirsiniz

### 5. Deneyim (Experience)
- İş deneyimlerinizi ekleyebilir/düzenleyebilirsiniz
- Tarih, pozisyon, açıklama bilgilerini güncelleyebilirsiniz

### 6. İletişim (Contact)
- Email, LinkedIn, GitHub linklerini güncelleyebilirsiniz
- İletişim açıklama metinlerini düzenleyebilirsiniz

### 7. Çeviriler (Translations)
- Tüm çevirileri JSON formatında düzenleyebilirsiniz
- 30+ dil desteği için çevirileri ekleyebilirsiniz

## Kullanım Adımları

### 1. İçerik Düzenleme
1. Admin paneline gidin (şifre gerektirmez)
2. Düzenlemek istediğiniz sekmesine tıklayın (Hero, About, vb.)
3. Metinleri düzenleyin
4. Resim yüklemek için "Resim Yükle" butonuna tıklayın
5. "Kaydet" butonuna tıklayın

### 2. Resim Yükleme
1. "Resim Yükle" alanına tıklayın
2. Bilgisayarınızdan bir resim seçin
3. Resim otomatik olarak önizleme olarak gösterilir
4. Resim base64 formatında kaydedilir (büyük resimler için dikkatli olun)

### 3. Export/Import
1. **Export**: Tüm verileri JSON formatında indirmek için "Export Et" butonuna tıklayın
2. **Import**: Daha önce export ettiğiniz JSON dosyasını yüklemek için "Import Et" butonuna tıklayın
3. **JSON İndir**: Sadece translations.json dosyasını indirmek için "JSON Olarak İndir" butonuna tıklayın

### 4. GitHub'a Push Etme
1. Admin panelinde yaptığınız değişiklikleri kaydedin
2. "JSON Olarak İndir" butonuna tıklayarak translations.json dosyasını indirin
3. İndirdiğiniz dosyayı `translations.json` olarak kaydedin
4. GitHub repository'nize push edin:
   ```bash
   git add translations.json
   git commit -m "Update translations from admin panel"
   git push origin main
   ```

## Notlar

### Resim Yükleme
- Resimler base64 formatında localStorage'a kaydedilir
- Büyük resimler için GitHub'a resim dosyası olarak yükleyip URL'ini kullanmanız önerilir
- Resimleri `images/` klasörüne yükleyip URL'lerini kullanabilirsiniz

### Veri Saklama
- Veriler şu an için localStorage'da saklanıyor
- Kalıcı olması için GitHub'a push etmeniz gerekiyor
- Export/Import özelliği ile yedek alabilirsiniz

### Çoklu Dil Desteği
- Tüm içerikler İngilizce ve Türkçe olarak düzenlenebilir
- Diğer diller için translations.json dosyasını düzenleyebilirsiniz
- 30+ dil desteği için çevirileri ekleyebilirsiniz

## Gelecek Geliştirmeler

- [ ] GitHub API entegrasyonu (otomatik push)
- [ ] Resim yükleme için GitHub API
- [ ] Daha gelişmiş editör (WYSIWYG)
- [ ] Çoklu dil düzenleme arayüzü
- [ ] Versiyon kontrolü
- [ ] Önizleme modu

## Sorun Giderme

### Veriler kayboldu
- localStorage temizlenmiş olabilir
- Export ettiğiniz JSON dosyasını Import edin

### Resimler görünmüyor
- Resimler base64 formatında kaydedilir, büyük resimler sorun yaratabilir
- Resimleri GitHub'a yükleyip URL'lerini kullanın

### Değişiklikler görünmüyor
- GitHub'a push ettiğinizden emin olun
- Browser cache'ini temizleyin
- GitHub Pages'in güncellenmesi birkaç dakika sürebilir

## Destek

Sorularınız için:
- GitHub Issues: [MeetlyTR/MeetlyTR.github.io](https://github.com/MeetlyTR/MeetlyTR.github.io/issues)
- Email: mucahit.muzaffer@gmail.com

