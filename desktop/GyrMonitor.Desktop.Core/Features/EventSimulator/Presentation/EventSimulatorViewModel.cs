using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Application;
using GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;
using GyrMonitor.Desktop.Core.Resources.Strings;

namespace GyrMonitor.Desktop.Core.Features.EventSimulator.Presentation;

public sealed partial class EventSimulatorViewModel : ObservableObject
{
    private readonly EventSimulatorService _service;

    public event EventHandler? Saved;

    public ObservableCollection<CattleSelectionItem> CattleOptions { get; } = new();

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasCattleOptions))]
    private CattleSelectionItem? selectedCattle;

    public bool HasCattleOptions => CattleOptions.Count > 0;

    [ObservableProperty]
    private bool isInactivity = true;

    [ObservableProperty]
    private int inactiveMinutes = 60;

    [ObservableProperty]
    private double confidence = 0.9;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool savedOffline;

    public EventSimulatorViewModel(EventSimulatorService service)
    {
        _service = service;
    }

    [RelayCommand]
    public async Task LoadCattleAsync()
    {
        if (IsBusy)
        {
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var cattle = await _service.LoadCattleAsync();
            CattleOptions.Clear();
            foreach (var item in cattle)
            {
                CattleOptions.Add(item);
            }

            OnPropertyChanged(nameof(HasCattleOptions));
            SelectedCattle ??= CattleOptions.FirstOrDefault();

            if (CattleOptions.Count == 0)
            {
                ErrorMessage = AppStrings.NoCattleForSimulation;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = string.Format(AppStrings.UnableToLoadCattleRecordsFormat, ex.Message);
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task GenerateAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;

        var validationError = EventSimulationValidator.Validate(SelectedCattle?.Id, Confidence);
        if (validationError == EventSimulationValidationError.CattleNotSelected)
        {
            ErrorMessage = AppStrings.SelectCattleBeforeGenerate;
            return;
        }

        if (validationError == EventSimulationValidationError.ConfidenceOutOfRange)
        {
            ErrorMessage = AppStrings.ConfidenceRangeError;
            return;
        }

        IsBusy = true;

        try
        {
            await _service.GenerateAsync(SelectedCattle!.Id, IsInactivity, InactiveMinutes, Confidence);

            SavedOffline = true;
            Saved?.Invoke(this, EventArgs.Empty);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
