using System.Diagnostics;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.ProcessBuilder;

namespace VivoLauncher.Services;

public sealed class LaunchProgressEventArgs : EventArgs
{
    public int Percent { get; init; }
    public string Text { get; init; } = string.Empty;
}

public sealed class MinecraftLauncherService
{
    public static readonly string[] SupportedVersions = { "1.21.4", "1.16.5", "1.8.9" };

    private readonly MinecraftLauncher _launcher;

    public event EventHandler<LaunchProgressEventArgs>? ProgressChanged;

    public MinecraftLauncherService()
    {
        var gameDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            ".vivolauncher");

        var path = new MinecraftPath(gameDir);
        _launcher = new MinecraftLauncher(path);

        _launcher.FileProgressChanged += (_, args) =>
        {
            var percent = args.TotalTasks <= 0
                ? 0
                : (int)Math.Clamp(args.ProgressedTasks * 100.0 / args.TotalTasks, 0, 100);

            Raise(percent, $"{args.EventType}: {args.Name}");
        };

        _launcher.ByteProgressChanged += (_, args) =>
        {
            if (args.TotalBytes <= 0) return;
            var percent = (int)Math.Clamp(args.ProgressedBytes * 100.0 / args.TotalBytes, 0, 100);
            Raise(percent, "Dosyalar indiriliyor...");
        };
    }

    private void Raise(int percent, string text)
        => ProgressChanged?.Invoke(this, new LaunchProgressEventArgs { Percent = percent, Text = text });

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

        var process = await _launcher.InstallAndBuildProcessAsync(version, option);
        return process;
    }
}
