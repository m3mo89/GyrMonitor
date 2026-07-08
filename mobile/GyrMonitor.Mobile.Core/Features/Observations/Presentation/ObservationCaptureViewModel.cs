using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GyrMonitor.Mobile.Core.Features.Observations.Application;
using GyrMonitor.Mobile.Core.Features.Observations.Domain;
using GyrMonitor.Mobile.Core.Resources.Strings;

namespace GyrMonitor.Mobile.Core.Features.Observations.Presentation;

public sealed partial class ObservationCaptureViewModel : ObservableObject
{
    private readonly ObservationCaptureService _service;

    public event EventHandler? Saved;

    [ObservableProperty]
    private string alertId = string.Empty;

    [ObservableProperty]
    private string comment = string.Empty;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isBusy;

    [ObservableProperty]
    private bool savedOffline;

    public ObservationCaptureViewModel(ObservationCaptureService service)
    {
        _service = service;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (IsBusy)
        {
            return;
        }

        ErrorMessage = null;

        var validationError = ObservationValidator.Validate(AlertId, Comment);
        if (validationError == ObservationValidationError.AlertNotSelected)
        {
            ErrorMessage = AppStrings.SelectAlertBeforeSaving;
            return;
        }

        if (validationError == ObservationValidationError.CommentEmpty)
        {
            ErrorMessage = AppStrings.CommentMustNotBeEmpty;
            return;
        }

        IsBusy = true;

        try
        {
            var result = await _service.SaveAsync(AlertId, Comment);
            if (result == ObservationSaveResult.SessionNotSupported)
            {
                ErrorMessage = AppStrings.FieldOperatorOnly;
                return;
            }

            Comment = string.Empty;
            SavedOffline = true;
            Saved?.Invoke(this, EventArgs.Empty);
        }
        finally
        {
            IsBusy = false;
        }
    }
}
