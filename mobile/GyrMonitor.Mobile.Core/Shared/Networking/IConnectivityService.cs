namespace GyrMonitor.Mobile.Core.Shared.Networking;

public interface IConnectivityService
{
    bool IsConnected { get; }

    event EventHandler? ConnectivityRestored;
}
