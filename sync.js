const Discover = require('node-discover');
const Database = require('better-sqlite3');

class SyncManager {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.d = Discover();

    this.d.on('promotion', () => {
      console.log('This node became the master.');
      this.startSync();
    });

    this.d.on('demotion', () => {
      console.log('This node is no longer the master.');
      this.stopSync();
    });

    this.d.on('added', (node) => {
      console.log('A new node has been added.');
      this.syncWith(node);
    });
  }

  syncWith(node) {
    console.log('Syncing with node:', node.address);

    const lastSync = this.getLastSyncTime(node.address);
    const changes = this.getChanges(lastSync);

    node.send('sync-request', changes);
  }

  getChanges(since) {
    const changes = {
      dishes: this.db.prepare('SELECT * FROM dishes WHERE updated_at > ?').all(since),
      orders: this.db.prepare('SELECT * FROM orders WHERE updated_at > ?').all(since),
      orderItems: this.db.prepare('SELECT * FROM order_items WHERE updated_at > ?').all(since),
    };

    return changes;
  }

  applyChanges(changes) {
    const applyChange = this.db.transaction((table, rows) => {
      const stmt = this.db.prepare(
        `REPLACE INTO ${table} (id, ${Object.keys(rows[0]).join(', ')}) VALUES (${Object.keys(
          rows[0]
        )
          .map(() => '?')
          .join(', ')})`
      );
      for (const row of rows) {
        stmt.run(Object.values(row));
      }
    });

    for (const [table, rows] of Object.entries(changes)) {
      applyChange(table, rows);
    }
  }

  getLastSyncTime(nodeAddress) {
    const result = this.db
      .prepare('SELECT last_sync FROM sync_log WHERE node_address = ?')
      .get(nodeAddress);
    return result ? result.last_sync : 0;
  }

  updateLastSyncTime(nodeAddress) {
    const now = Date.now();
    this.db
      .prepare('REPLACE INTO sync_log (node_address, last_sync) VALUES (?, ?)')
      .run(nodeAddress, now);
  }
}

module.exports = SyncManager;
