using System.Diagnostics;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.ProcessBuilder;

namespace VivoLauncher.Services;

/// <summary>
/// Raised while CmlLib.Core downloads/installs game files.
/// </summary>
public sealed class LaunchProgressEventArgs : EventArgs
{
    public int Percent { get; init; }
    public string Text { get; init; } = string.Empty;
}

/// <summary>
/// Thin wrapper around CmlLib.Core that only allows the three Minecraft
/// versions this launcher supports, and turns CmlLib's progress events
/// into a single 0-100 percent + status text pair that we forward to the
/// WebView2 frontend.
/// </summary>
public sealed class MinecraftLauncherService
{
    public static readonly string[] SupportedVersions = { "1.21.4", "1.16.5", "1.8.9" };

    private readonly MinecraftLauncher _launcher;

    public event EventHandler<LaunchProgressEventArgs>? ProgressChanged;

    public MinecraftLauncherService()
    {
        // Resmi launcher'ın "%AppData%\.minecraft" klasörüne benzer şekilde,
        // oyun dosyaları %AppData%\.vivolauncher altında tutulur.
        var gameDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            ".vivolauncher");

        var path = new MinecraftPath(gameDir);
        _launcher = new MinecraftLauncher(path);

        // Fired for each file/asset/library CmlLib processes (check, download, extract...).
        _launcher.FileProgressChanged += (_, args) =>
        {
            var percent = args.TotalTasks <= 0
                ? 0
                : (int)Math.Clamp(args.ProgressedTasks * 100.0 / args.TotalTasks, 0, 100);

            Raise(percent, $"{args.EventType}: {args.Name}");
        };

        // Fired with raw byte-level download progress for large files.
        _launcher.ByteProgressChanged += (_, args) =>
        {
            if (args.TotalBytes <= 0) return;
            var percent = (int)Math.Clamp(args.ProgressedBytes * 100.0 / args.TotalBytes, 0, 100);
            Raise(percent, "Dosyalar indiriliyor...");
        };
    }

    private void Raise(int percent, string text)
        => ProgressChanged?.Invoke(this, new LaunchProgressEventArgs { Percent = percent, Text = text });

    /// <summary>
    /// Installs (if needed) and launches the given vanilla version with an
    /// offline session for the given username. Only the three whitelisted
    /// versions are accepted.
    /// </summary>
    public async Task<Process> LaunchAsync(string username, string version)
    {
        if (Array.IndexOf(SupportedVersions, version) < 0)
        {
            throw new ArgumentException(
                $"Desteklenmeyen sürüm: {version}. Sadece {string.Join(", ", SupportedVersions)} desteklenir.",
                nameof(version));
        }

        if (string.IsNullOrWhiteSpace(username))
            username = "Steve";

        var session = MSession.CreateOfflineSession(username);

        var option = new MLaunchOption
        {
            Session = session,
            MaximumRamMb = 4096,
        };

        // Downloads/verifies everything the version needs (client jar,
        // libraries, assets and, if missing, the matching Java runtime),
        // then builds (but does not start) the game process.
        var process = await _launcher.InstallAndBuildProcessAsync(version, option);
        return process;
    }
}
