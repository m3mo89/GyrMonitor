using GyrMonitor.Desktop.Core.Features.Sync.Presentation;
using Microsoft.Extensions.DependencyInjection;

namespace GyrMonitor.Desktop.Shared.Controls;

public partial class OfflineBannerView : ContentView
{
    public OfflineBannerView()
    {
        InitializeComponent();
        BindingContext = IPlatformApplication.Current!.Services.GetRequiredService<ConnectivityStatusViewModel>();
    }
}
