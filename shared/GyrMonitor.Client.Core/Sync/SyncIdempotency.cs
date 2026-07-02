using System.Security.Cryptography;
using System.Text;

namespace GyrMonitor.Client.Core.Sync;

public static class SyncIdempotency
{
    public static string ComputeKey(IEnumerable<string> entityIds)
    {
        var joined = string.Join(",", entityIds.OrderBy(id => id, StringComparer.Ordinal));
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(joined));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
