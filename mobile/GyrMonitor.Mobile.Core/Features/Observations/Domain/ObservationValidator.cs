namespace GyrMonitor.Mobile.Core.Features.Observations.Domain;

public enum ObservationValidationError
{
    None,
    AlertNotSelected,
    CommentEmpty
}

public static class ObservationValidator
{
    public static ObservationValidationError Validate(string? alertId, string? comment)
    {
        if (string.IsNullOrWhiteSpace(alertId))
        {
            return ObservationValidationError.AlertNotSelected;
        }

        if (string.IsNullOrWhiteSpace(comment))
        {
            return ObservationValidationError.CommentEmpty;
        }

        return ObservationValidationError.None;
    }
}
