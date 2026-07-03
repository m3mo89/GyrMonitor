namespace GyrMonitor.Client.Core.Networking;

public interface IConnectivityService
{
    bool IsConnected { get; }

    event EventHandler? ConnectivityRestored;

    event EventHandler<bool>? ConnectivityChanged;
}
