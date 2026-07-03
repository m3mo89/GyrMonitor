using System.Globalization;

namespace GyrMonitor.Desktop.Shared.Converters;

/// <summary>
/// Maps the various status/severity vocabularies used across the app (alert severity,
/// alert status, cattle status) onto the shared three-bucket semantic brush set.
/// </summary>
public sealed class SeverityToBrushConverter : IValueConverter
{
    private static readonly HashSet<string> HighKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "HIGH", "CRITICAL", "INACTIVE"
    };

    private static readonly HashSet<string> MediumKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "MEDIUM", "PENDING", "IN_PROGRESS", "UNDER_OBSERVATION"
    };

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var text = value as string ?? string.Empty;
        var key = HighKeywords.Contains(text) ? "SeverityHighBrush"
            : MediumKeywords.Contains(text) ? "SeverityMediumBrush"
            : "SeverityLowBrush";

        return Application.Current?.Resources.TryGetValue(key, out var brush) == true ? brush : null;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) =>
        throw new NotSupportedException();
}
