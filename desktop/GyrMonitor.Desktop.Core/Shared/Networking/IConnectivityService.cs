namespace GyrMonitor.Desktop.Core.Shared.Networking;

public interface IConnectivityService
{
    bool IsConnected { get; }

    event EventHandler? ConnectivityRestored;
}
