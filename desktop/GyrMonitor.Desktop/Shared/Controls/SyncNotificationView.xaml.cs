namespace GyrMonitor.Desktop.Shared.Controls;

public partial class SyncNotificationView : ContentView
{
    private static readonly TimeSpan DisplayDuration = TimeSpan.FromSeconds(4);

    private int _generation;

    public SyncNotificationView()
    {
        InitializeComponent();
    }

    public void Show(string message)
    {
        var generation = ++_generation;

        MessageLabel.Text = message;
        IsVisible = true;

        Dispatcher.DispatchDelayed(DisplayDuration, () =>
        {
            if (generation == _generation)
            {
                IsVisible = false;
            }
        });
    }
}
