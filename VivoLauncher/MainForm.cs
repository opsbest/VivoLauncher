using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using VivoLauncher.Services;

namespace VivoLauncher;

public class MainForm : Form
{
    private readonly WebView2 _webView = new();
    private readonly MinecraftLauncherService _launcherService = new();
    private bool _launching;
    private bool _hasLaunchedOnce;

    public MainForm()
    {
        Text = "Vivo Launcher";
        Width = 960;
        Height = 600;
        StartPosition = FormStartPosition.CenterScreen;

        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        MinimizeBox = true;

        _webView.Dock = DockStyle.Fill;
        Controls.Add(_webView);

        _launcherService.ProgressChanged += (_, e) =>
            PostToWeb(new { type = "launchProgress", percent = e.Percent, text = e.Text });

        Load += MainForm_Load;
    }

    private async void MainForm_Load(object? sender, EventArgs e)
    {
        try
        {
            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VivoLauncher", "WebView2");
            Directory.CreateDirectory(userDataFolder);

            var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
            await _webView.EnsureCoreWebView2Async(environment);

            var wwwroot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
            _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "appassets.local", wwwroot, CoreWebView2HostResourceAccessKind.Allow);

            var settings = _webView.CoreWebView2.Settings;
            settings.AreDefaultContextMenusEnabled = false;
            settings.AreDevToolsEnabled = false;
            settings.AreBrowserAcceleratorKeysEnabled = false;
            settings.IsStatusBarEnabled = false;
            settings.IsZoomControlEnabled = false;
            settings.IsBuiltInErrorPageEnabled = false;
            settings.IsSwipeNavigationEnabled = false;

            _webView.CoreWebView2.NavigationStarting += (_, navArgs) =>
            {
                if (!navArgs.Uri.StartsWith("https://appassets.local/", StringComparison.OrdinalIgnoreCase))
                    navArgs.Cancel = true;
            };
            _webView.CoreWebView2.NewWindowRequested += (_, newWindowArgs) =>
            {
                newWindowArgs.Handled = true;
            };

            _webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            _webView.CoreWebView2.Navigate("https://appassets.local/index.html");
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                this,
                "WebView2 başlatılamadı. Microsoft Edge WebView2 Runtime kurulu olduğundan emin olun.\n\n" + ex.Message,
                "Vivo Launcher",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private async void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var root = doc.RootElement;
            var type = root.TryGetProperty("type", out var t) ? t.GetString() : null;

            switch (type)
            {
                case "launch":
                    await HandleLaunchAsync(root);
                    break;
            }
        }
        catch (Exception ex)
        {
            PostToWeb(new { type = "launchError", message = "Mesaj işlenemedi: " + ex.Message });
        }
    }

    private async Task HandleLaunchAsync(JsonElement root)
    {
        if (_launching) return;

        if (_hasLaunchedOnce)
        {
            PostToWeb(new
            {
                type = "launchError",
                message = "Bu oturumda oyun zaten başlatıldı. Tekrar oynamak için launcher'ı kapatıp yeniden açman gerekiyor."
            });
            return;
        }

        var username = root.TryGetProperty("username", out var u) ? u.GetString() ?? "Steve" : "Steve";
        var version = root.TryGetProperty("version", out var v) ? v.GetString() ?? "1.21.4" : "1.21.4";

        _launching = true;
        PostToWeb(new { type = "launchStarted" });

        try
        {
            var process = await _launcherService.LaunchAsync(username, version);
            process.EnableRaisingEvents = true;
            process.Exited += (_, _) => BeginInvoke(() => PostToWeb(new { type = "gameExited" }));
            process.Start();

            _hasLaunchedOnce = true;
            PostToWeb(new { type = "launchReady" });
        }
        catch (Exception ex)
        {
            PostToWeb(new { type = "launchError", message = ex.Message });
        }
        finally
        {
            _launching = false;
        }
    }

    private void PostToWeb(object payload)
    {
        var json = JsonSerializer.Serialize(payload);

        void Send()
        {
            if (_webView.CoreWebView2 != null)
                _webView.CoreWebView2.PostWebMessageAsJson(json);
        }

        if (InvokeRequired)
            BeginInvoke(Send);
        else
            Send();
    }
}
