using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Client.Core.Networking;

namespace GyrMonitor.Desktop.Core.Features.Cattle;

public sealed partial class CattleViewModel : ObservableObject
{
    private readonly ICattleApi _cattleApi;

    public ObservableCollection<CattleSummaryDto> Cattle { get; } = new();

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private string? errorMessage;

    public CattleViewModel(ICattleApi cattleApi)
    {
        _cattleApi = cattleApi;
    }

    [RelayCommand]
    public async Task LoadAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var result = await _cattleApi.GetCattleAsync();
            Cattle.Clear();
            foreach (var cattle in result)
            {
                Cattle.Add(cattle);
            }
        }
        catch (ApiException ex)
        {
            ErrorMessage = ex.Message;
        }
        catch (Exception)
        {
            ErrorMessage = "Unable to reach the server.";
        }
        finally
        {
            IsBusy = false;
        }
    }
}
