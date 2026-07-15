# Vivo Launcher

Senin verdiğin React arayüzünü (VivoLauncher-main) frontend olarak kullanan,
C# / .NET 8 WinForms + WebView2 tabanlı bir Minecraft launcher'ı. Oyunu indirip
başlatma işini **CmlLib.Core** (v4.0.6) yapıyor. Sadece şu 3 sürüm destekleniyor:

- 1.21.4
- 1.16.5
- 1.8.9

Giriş ekranı sadece kullanıcı adı soran "offline" bir giriş (Microsoft/Mojang
hesabı gerektirmiyor), tıpkı senin arayüzde tasarlandığı gibi.

## Klasör yapısı

```
VivoLauncher/
  VivoLauncher.sln              -> Visual Studio solution dosyası
  VivoLauncher/                 -> C# WinForms projesi
    VivoLauncher.csproj
    Program.cs
    MainForm.cs                 -> WebView2'yi kurar, JS <-> C# köprüsü
    Services/
      MinecraftLauncherService.cs -> CmlLib.Core sarmalayıcısı (install+launch)
    wwwroot/                    -> React arayüzünün DERLENMİŞ hali (npm run build çıktısı)
  frontend/                     -> React kaynak kodu (senin projen + bridge.js eklendi)
```

`wwwroot` klasörü, `frontend` klasöründeki React projesinin `npm run build`
çıktısıdır ve WinForms uygulaması tarafından WebView2 üzerinden yerel dosya
olarak sunulur (internet gerektirmez, tamamen gömülü).

## Nasıl çalışıyor?

1. `MainForm` açılışta bir `WebView2` kontrolü oluşturur ve
   `wwwroot` klasörünü `https://appassets.local/` adresine haritalar
   (`SetVirtualHostNameToFolderMapping`), sonra `index.html`'i açar.
2. React tarafında eklediğim `src/bridge.js`, `window.chrome.webview` üzerinden
   C# tarafına mesaj gönderip C#'tan mesaj dinliyor.
3. Login sayfası: kullanıcı adını her açılışta boş bekler, hatırlama/otomatik
   doldurma yok. Kullanıcı adı sadece o oturumda bellekte tutulur
   (`UserContext`), diske kaydedilmez.
4. Ana sayfa: "play now" butonu `{ type: "launch", username, version }`
   mesajı gönderir. C# tarafında `MinecraftLauncherService`:
   - `MSession.CreateOfflineSession(username)` ile offline oturum açar,
   - `MinecraftLauncher.InstallAndBuildProcessAsync(version, option)` ile
     gerekli dosyaları (client jar, kütüphaneler, assetler, gerekiyorsa Java
     runtime) indirir/kontrol eder ve oyun process'ini hazırlar,
   - indirme ilerlemesini `launchProgress` mesajlarıyla arayüze geri yollar
     (yüzde + durum metni), arayüzdeki yeşil ilerleme çubuğunda gösterilir,
   - işlem bitince `process.Start()` ile Minecraft'ı açar ve `launchReady`
     mesajı yollar; oyun kapanınca `gameExited` mesajı yollar.
   - Hata olursa `launchError` mesajıyla arayüzde kırmızı hata metni gösterilir.
5. Sadece 3 sürüm (`1.21.4`, `1.16.5`, `1.8.9`) hem arayüzdeki
   `VersionSelect` bileşeninde hem de C# tarafındaki
   `MinecraftLauncherService.SupportedVersions` içinde sabitlenmiş durumda;
   başka bir sürüm göndermeye çalışırsa C# reddediyor.

Oyun dosyaları `%AppData%\.vivolauncher` klasörüne iniyor, resmi
launcher'ın klasörüyle karışmıyor.

## Gereksinimler (senin bilgisayarında / build alacağın makinede)

- **Visual Studio 2022** (17.8+) — ".NET masaüstü geliştirme" iş yükü ile,
  veya sadece **.NET 8 SDK** + `dotnet` CLI.
- **WebView2 Runtime** — Windows 10/11'de genelde zaten kurulu gelir
  (Edge ile birlikte). Yoksa: https://developer.microsoft.com/microsoft-edge/webview2/
- İnternet bağlantısı: NuGet paketlerini (`Microsoft.Web.WebView2`,
  `CmlLib.Core`) ilk restore sırasında indirmek için.
- Bilgisayarında **Java kurulu olmasına gerek yok** — CmlLib.Core, sürümün
  ihtiyaç duyduğu Java runtime'ı otomatik indirir.

## Build & çalıştırma

### Visual Studio ile
1. `VivoLauncher.sln` dosyasını aç.
2. Solution'ı build et (NuGet paketleri otomatik restore olur).
3. `F5` ile çalıştır.

### Komut satırından
```powershell
cd VivoLauncher
dotnet restore
dotnet build -c Release
dotnet run -c Release --project VivoLauncher
```

Yayınlamak (tek klasörde .exe) için:
```powershell
dotnet publish VivoLauncher/VivoLauncher.csproj -c Release -r win-x64 --self-contained false -o publish
```
`publish` klasöründeki `wwwroot` klasörünün de yanında olduğundan emin ol
(csproj bunu otomatik kopyalıyor).

## Frontend'i değiştirmek istersen

`frontend/` klasörü senin orijinal React projesi + `bridge.js` +
login/main sayfalarındaki köprü bağlantıları. Değişiklik yaptıktan sonra:

```powershell
cd frontend
npm install
npm run build
```

Sonra oluşan `frontend/dist/*` içeriğini `VivoLauncher/VivoLauncher/wwwroot/`
klasörünün içine kopyala (üzerine yaz), tekrar build al.

## Notlar / bilinen sınırlamalar

- Giriş tamamen "offline" modda; Microsoft/Mojang hesabıyla giriş yok
  (istersen ekleyebiliriz, `CmlLib.Core.Auth.Microsoft` paketiyle mümkün).
- Sadece vanilla sürümler destekleniyor (Forge/Fabric yok) — istersen bu da
  eklenebilir, CmlLib.Core destekliyor.
- Uygulama x64 için ayarlandı (modern Windows'larda standart).
- İlk kez bir sürüm seçilip oynandığında dosyalar indirileceği için ilk açılış
  biraz sürebilir; sonraki açılışlarda dosyalar diskte olduğu için çok daha
  hızlı açılır.
- **Oyun oturum başına sadece 1 kez başlatılabiliyor**: "play now" butonuna
  bir kez basılıp oyun başladıktan sonra hem arayüzde buton kalıcı olarak
  kilitleniyor hem de C# tarafı (`MainForm.HandleLaunchAsync`) ikinci bir
  `launch` isteğini reddediyor. Tekrar oynamak için launcher'ın kapatılıp
  yeniden açılması gerekiyor.
- **Launcher bilgisayarda sadece 1 kez açılabiliyor**: `Program.cs` içinde
  isimlendirilmiş bir `Mutex` ile ikinci bir launcher penceresi açılmaya
  çalışılırsa "Vivo Launcher zaten açık" uyarısı çıkıp kapanıyor.
- **"Minecraft kapansa da launcher hâlâ oyunda gösteriyor" hatası düzeltildi**:
  arayüz artık tek bir `phase` durumu (`idle` / `launching` / `running` /
  `exited` / `error`) üzerinden çalışıyor. Oyun süreci kapanınca (`gameExited`
  mesajı) panel "Oyun kapatıldı. Tekrar oynamak için launcher'ı yeniden açın."
  yazısına geçiyor, eskiden kalan ilerleme çubuğu/metin artık takılı kalmıyor.
- **Sayfa değiştirince farklı/tutarsız mesaj gösterme hatası düzeltildi**:
  oyun durumu artık `frontend/src/context/LaunchContext.jsx` içinde,
  `App`'in üstünde tek bir yerde tutuluyor. Önceden bu durum `MainPage`
  bileşeninin kendi local state'indeydi; Patch Notes / Announce sayfasına
  gidip geri dönünce bileşen yeniden mount olduğu için durum sıfırlanıyor,
  "play now" tekrar tıklanabilir gibi görünüyordu. Artık hangi sayfaya
  gidip gelirsen git aynı sabit durum (örn. "Minecraft açık" / "Oyun
  kapatıldı, tekrar oynayamazsın") gösteriliyor. Ayrıca oyun zaten
  çalışırken/kapandıktan sonra tekrar "play now"a basılırsa host'tan gelen
  ret mesajı bu sabit ekranı bozmuyor; sadece gerçek ilk deneme başarısız
  olursa hata ekranına geçip tekrar denemeye izin veriyor.
- **`WindowsBase` sürüm çakışması uyarısı giderildi**: `Microsoft.Web.WebView2`
  paketi hem WinForms hem WPF kontrolünü içeriyor ve WPF'inki `WindowsBase
  5.0.0.0`'a, .NET 8'in kendisi ise `4.0.0.0`'a ihtiyaç duyuyor. Projede
  sadece WinForms kullanıldığı için `.csproj`'a `<UseWPF>false</UseWPF>`
  eklendi ve ek bir MSBuild `Target` ile WPF DLL'i referanslardan tamamen
  çıkarıldı — build artık o uyarıyı vermiyor.
- **Oyun dosyaları `%AppData%\.vivolauncher` klasöründe** tutuluyor (resmi
  launcher'ın `%AppData%\.minecraft` klasörüne benzer şekilde), eskiden
  `%AppData%\VivoLauncher\minecraft` idi.
- **Switch Account**: normalde çalışır, ama "play now"a basıldıktan sonra
  (indirme sürerken veya oyun açıldıktan/kapandıktan sonra) devre dışı kalır.
- **Pencere büyütülemiyor**: `MainForm` sabit boyutlu (`FixedSingle`,
  `MaximizeBox = false`), yeniden boyutlandırma ve maximize kapalı.
- **Sağ tık menüsü, DevTools (F12) ve link durum çubuğu kapalı**: WebView2
  ayarlarında `AreDefaultContextMenusEnabled`, `AreDevToolsEnabled`,
  `AreBrowserAcceleratorKeysEnabled` ve `IsStatusBarEnabled` false yapıldı;
  bir butona/linke uzun süre gelince sol altta çıkan beyaz durum yazısı da
  bu sayede görünmüyor.
- **Sürükleme/tarayıcı gibi davranma sorunu çözüldü**: buton/resim
  sürüklendiğinde artık hiçbir yere "gitmeye" çalışmıyor. Hem frontend'de
  (`main.jsx`'te `dragstart`/`drop` engellendi, `global.css`'te metin seçimi
  ve resim/link sürüklemesi kapatıldı — input hariç) hem de C# tarafında
  (`NavigationStarting` sadece `https://appassets.local/` ile başlayan
  adreslere izin veriyor, `NewWindowRequested` yeni pencere/sekme açmayı
  engelliyor, `IsSwipeNavigationEnabled = false`) önlem alındı.
