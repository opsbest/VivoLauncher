namespace VivoLauncher;

internal static class Program
{
    private const string SingleInstanceMutexName = "Global\\VivoLauncher-SingleInstance-9F3B2C11";

    [STAThread]
    private static void Main()
    {
        using var mutex = new Mutex(initiallyOwned: true, name: SingleInstanceMutexName, createdNew: out var isNew);

        if (!isNew)
        {
            MessageBox.Show(
                "Vivo Launcher zaten açık. Lütfen mevcut pencereyi kullanın.",
                "Vivo Launcher",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
            return;
        }

        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());

        GC.KeepAlive(mutex);
    }
}
