namespace GyrMonitor.Desktop.Core.Features.EventSimulator.Domain;

public sealed record CattleSelectionItem(string Id, string TagNumber, string Status)
{
    public string DisplayName => string.IsNullOrWhiteSpace(TagNumber)
        ? $"{Id} ({Status})"
        : $"{TagNumber} ({Status})";
}
