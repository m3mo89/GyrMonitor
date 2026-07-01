using GyrMonitor.Mobile.Core.Features.Sync;

namespace GyrMonitor.Mobile.Core.Tests.Features.Sync;

public class SyncViewModelTests
{
    [Fact]
    public async Task RefreshPendingCountAsync_ReflectsQueuedItems()
    {
        var (queue, observations, _) = await SeedAsync();
        var service = new MobileSyncService(queue, observations, new NeverCalledSyncApi(), "MOBILE-001");
        var viewModel = new SyncViewModel(service);

        await viewModel.RefreshPendingCountCommand.ExecuteAsync(null);

        Assert.Equal(1, viewModel.PendingCount);
    }

    [Fact]
    public async Task SyncNowAsync_UpdatesStatusMessageAndClearsPendingCount()
    {
        var (queue, observations, localId) = await SeedAsync();
        var syncApi = new StubSyncApi(localId);
        var service = new MobileSyncService(queue, observations, syncApi, "MOBILE-001");
        var viewModel = new SyncViewModel(service);

        await viewModel.SyncNowCommand.ExecuteAsync(null);

        Assert.Equal(0, viewModel.PendingCount);
        Assert.Contains("Synced 1", viewModel.StatusMessage);
        Assert.False(viewModel.IsBusy);
    }

    private static async Task<(InMemorySyncQueueRepository Queue, InMemoryPendingObservationRepository Observations, string LocalId)> SeedAsync()
    {
        var queue = new InMemorySyncQueueRepository();
        var observations = new InMemoryPendingObservationRepository();

        var observation = new Core.Features.Observations.PendingObservation
        {
            LocalId = "local-obs-1",
            ObservationId = "22222222-2222-4222-8222-222222222222",
            AlertId = "alert-1",
            Comment = "Checked",
            CreatedAt = "2026-06-30T02:00:00.000Z",
            ClientId = "MOBILE-001"
        };
        await observations.AddAsync(observation);

        await queue.AddAsync(new SyncQueueItem
        {
            LocalId = "queue-1",
            EntityType = SyncEntityTypes.Observation,
            EntityLocalId = observation.LocalId,
            Status = SyncStatuses.Pending,
            CreatedAt = observation.CreatedAt
        });

        return (queue, observations, observation.LocalId);
    }

    private sealed class NeverCalledSyncApi : ISyncObservationsApi
    {
        public Task<SyncObservationsResultDto> SyncAsync(SyncObservationsRequestDto request, string idempotencyKey) =>
            throw new InvalidOperationException("Should not be called when there is nothing pending.");
    }

    private sealed class StubSyncApi : ISyncObservationsApi
    {
        private readonly string _localId;

        public StubSyncApi(string localId) => _localId = localId;

        public Task<SyncObservationsResultDto> SyncAsync(SyncObservationsRequestDto request, string idempotencyKey) =>
            Task.FromResult(new SyncObservationsResultDto
            {
                Processed = 1,
                Created = 1,
                Duplicates = 0,
                Failed = 0,
                Results = new List<SyncObservationItemResultDto> { new() { LocalId = _localId, ObservationId = "22222222-2222-4222-8222-222222222222", Status = "SYNCED", ServerId = "server-1" } }
            });
    }
}
