namespace GyrMonitor.Desktop.Core.Features.Cattle;

public interface ICattleApi
{
    Task<IReadOnlyList<CattleSummaryDto>> GetCattleAsync();
}
