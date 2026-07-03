using Microsoft.Extensions.DependencyInjection;

namespace GyrMonitor.Desktop;

public partial class App : Application
{
	public App()
	{
		InitializeComponent();
	}

	protected override Window CreateWindow(IActivationState? activationState)
	{
		// AppShell (and the shared controls it embeds, e.g. OfflineBannerView) is resolved here
		// rather than via constructor injection, because its XAML uses eager StaticResource
		// lookups against Application.Current.Resources, which this InitializeComponent() call
		// above populates. Constructor-injecting AppShell into App would build it before that
		// resource merge happens, crashing with "StaticResource not found".
		var shell = IPlatformApplication.Current!.Services.GetRequiredService<AppShell>();
		return new Window(shell);
	}
}
