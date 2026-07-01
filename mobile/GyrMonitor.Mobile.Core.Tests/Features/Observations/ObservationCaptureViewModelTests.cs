using GyrMonitor.Mobile.Core.Features.Observations;
using GyrMonitor.Mobile.Core.Features.Sync;
using Moq;

namespace GyrMonitor.Mobile.Core.Tests.Features.Observations;

public class ObservationCaptureViewModelTests
{
    [Fact]
    public async Task SaveAsync_PersistsPendingObservationAndEnqueuesSyncItem()
    {
        PendingObservation? savedObservation = null;
        SyncQueueItem? savedQueueItem = null;

        var observations = new Mock<IPendingObservationRepository>();
        observations.Setup(repo => repo.AddAsync(It.IsAny<PendingObservation>())).Callback<PendingObservation>(o => savedObservation = o).Returns(Task.CompletedTask);

        var syncQueue = new Mock<ISyncQueueRepository>();
        syncQueue.Setup(repo => repo.AddAsync(It.IsAny<SyncQueueItem>())).Callback<SyncQueueItem>(q => savedQueueItem = q).Returns(Task.CompletedTask);

        var viewModel = new ObservationCaptureViewModel(observations.Object, syncQueue.Object, "MOBILE-001")
        {
            AlertId = "alert-1",
            Comment = "Checked in field"
        };

        var raised = false;
        viewModel.Saved += (_, _) => raised = true;

        await viewModel.SaveCommand.ExecuteAsync(null);

        Assert.True(raised);
        Assert.True(viewModel.SavedOffline);
        Assert.Equal(string.Empty, viewModel.Comment);
        Assert.NotNull(savedObservation);
        Assert.Equal("alert-1", savedObservation!.AlertId);
        Assert.Equal("Checked in field", savedObservation.Comment);
        Assert.Equal(SyncStatuses.Pending, savedObservation.SyncStatus);

        Assert.NotNull(savedQueueItem);
        Assert.Equal(SyncEntityTypes.Observation, savedQueueItem!.EntityType);
        Assert.Equal(savedObservation.LocalId, savedQueueItem.EntityLocalId);
        Assert.Equal(SyncStatuses.Pending, savedQueueItem.Status);
    }

    [Fact]
    public async Task SaveAsync_SetsError_WhenCommentIsEmpty()
    {
        var observations = new Mock<IPendingObservationRepository>();
        var syncQueue = new Mock<ISyncQueueRepository>();

        var viewModel = new ObservationCaptureViewModel(observations.Object, syncQueue.Object, "MOBILE-001")
        {
            AlertId = "alert-1",
            Comment = "   "
        };

        await viewModel.SaveCommand.ExecuteAsync(null);

        Assert.Equal("Comment must not be empty.", viewModel.ErrorMessage);
        observations.Verify(repo => repo.AddAsync(It.IsAny<PendingObservation>()), Times.Never);
        syncQueue.Verify(repo => repo.AddAsync(It.IsAny<SyncQueueItem>()), Times.Never);
    }

    [Fact]
    public async Task SaveAsync_SetsError_WhenAlertIdMissing()
    {
        var observations = new Mock<IPendingObservationRepository>();
        var syncQueue = new Mock<ISyncQueueRepository>();

        var viewModel = new ObservationCaptureViewModel(observations.Object, syncQueue.Object, "MOBILE-001") { Comment = "Checked" };

        await viewModel.SaveCommand.ExecuteAsync(null);

        Assert.Equal("Select an alert before saving an observation.", viewModel.ErrorMessage);
    }
}
