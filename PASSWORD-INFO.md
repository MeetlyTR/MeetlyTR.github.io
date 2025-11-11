# Edit Mode Şifre Bilgileri

## Güvenlik

Edit mode şifresi **SHA-256 hash** ile korunmaktadır. Gerçek şifre hiçbir yerde saklanmaz, sadece hash değeri kodda bulunur.

## Şifre

Şifre güvenlik nedeniyle burada belirtilmemektedir. Şifreyi değiştirmek için `edit-mode.js` dosyasındaki `PASSWORD_HASH` değerini güncelleyin.

## Şifreyi Değiştirme

Şifreyi değiştirmek için:

1. Yeni şifrenizi belirleyin
2. Şifrenin hash'ini hesaplayın:
   ```bash
   node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('YeniŞifreniz').digest('hex'));"
   ```
3. `edit-mode.js` dosyasındaki `PASSWORD_HASH` değerini güncelleyin:
   ```javascript
   const PASSWORD_HASH = 'hesaplanan_hash_değeri';
   ```

## Session Yönetimi

- Şifre doğrulandıktan sonra 24 saat boyunca geçerli bir session oluşturulur
- Session süresi dolduğunda tekrar şifre girmeniz gerekir
- Session bilgisi localStorage'da saklanır

## Notlar

- Gerçek şifre asla GitHub'da görünmez
- Sadece hash değeri kodda saklanır
- Hash değeri geri döndürülemez (one-way function)
- Güvenlik için güçlü bir şifre kullanın

