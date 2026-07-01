using SQLite;

namespace GyrMonitor.Mobile.Core.Shared.Storage;

public interface ISqliteConnectionProvider
{
    SQLiteAsyncConnection GetConnection();
}

public sealed class SqliteConnectionProvider : ISqliteConnectionProvider
{
    private readonly SQLiteAsyncConnection _connection;

    public SqliteConnectionProvider(string databasePath)
    {
        _connection = new SQLiteAsyncConnection(databasePath, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);
    }

    public SQLiteAsyncConnection GetConnection() => _connection;
}
