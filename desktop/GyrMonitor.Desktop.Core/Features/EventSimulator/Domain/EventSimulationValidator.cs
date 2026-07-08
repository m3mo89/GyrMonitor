namespace GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;

public enum EventSimulationValidationError
{
    None,
    CattleNotSelected,
    ConfidenceOutOfRange
}

public static class EventSimulationValidator
{
    public static EventSimulationValidationError Validate(string? selectedCattleId, double confidence)
    {
        if (string.IsNullOrEmpty(selectedCattleId))
        {
            return EventSimulationValidationError.CattleNotSelected;
        }

        if (confidence is < 0 or > 1)
        {
            return EventSimulationValidationError.ConfidenceOutOfRange;
        }

        return EventSimulationValidationError.None;
    }
}
