using GyrMonitor.Desktop.Core.Features.EventSimulator;
using GyrMonitor.Desktop.Core.Features.Sync;
using Moq;

namespace GyrMonitor.Desktop.Core.Tests.Features.EventSimulator;

public class EventSimulatorViewModelTests
{
    [Fact]
    public async Task GenerateAsync_PersistsPendingEventTaggedAsSimulator_AndEnqueuesSyncItem()
    {
        PendingEvent? savedEvent = null;
        SyncQueueItem? savedQueueItem = null;

        var events = new Mock<IPendingEventRepository>();
        events.Setup(r => r.AddAsync(It.IsAny<PendingEvent>())).Callback<PendingEvent>(e => savedEvent = e).Returns(Task.CompletedTask);

        var syncQueue = new Mock<ISyncQueueRepository>();
        syncQueue.Setup(r => r.AddAsync(It.IsAny<SyncQueueItem>())).Callback<SyncQueueItem>(q => savedQueueItem = q).Returns(Task.CompletedTask);

        var viewModel = new EventSimulatorViewModel(events.Object, syncQueue.Object)
        {
            CattleId = "cattle-1",
            IsInactivity = true,
            InactiveMinutes = 90,
            Confidence = 0.85
        };

        var raised = false;
        viewModel.Saved += (_, _) => raised = true;

        await viewModel.GenerateCommand.ExecuteAsync(null);

        Assert.True(raised);
        Assert.True(viewModel.SavedOffline);
        Assert.NotNull(savedEvent);
        Assert.Equal(SimulatedEventTypes.Inactivity, savedEvent!.EventType);
        Assert.Equal(SimulatedEventSource.DesktopSimulator, savedEvent.Source);
        Assert.Equal(90, savedEvent.InactiveMinutes);

        Assert.NotNull(savedQueueItem);
        Assert.Equal(SyncEntityTypes.Event, savedQueueItem!.EntityType);
        Assert.Equal(savedEvent.LocalId, savedQueueItem.EntityLocalId);
    }

    [Fact]
    public async Task GenerateAsync_SetsError_WhenCattleIdMissing()
    {
        var events = new Mock<IPendingEventRepository>();
        var syncQueue = new Mock<ISyncQueueRepository>();

        var viewModel = new EventSimulatorViewModel(events.Object, syncQueue.Object);

        await viewModel.GenerateCommand.ExecuteAsync(null);

        Assert.Equal("Select a cattle id before generating an event.", viewModel.ErrorMessage);
        events.Verify(r => r.AddAsync(It.IsAny<PendingEvent>()), Times.Never);
    }

    [Fact]
    public async Task GenerateAsync_SetsError_WhenConfidenceOutOfRange()
    {
        var events = new Mock<IPendingEventRepository>();
        var syncQueue = new Mock<ISyncQueueRepository>();

        var viewModel = new EventSimulatorViewModel(events.Object, syncQueue.Object) { CattleId = "cattle-1", Confidence = 1.5 };

        await viewModel.GenerateCommand.ExecuteAsync(null);

        Assert.Equal("Confidence must be between 0 and 1.", viewModel.ErrorMessage);
    }
}
