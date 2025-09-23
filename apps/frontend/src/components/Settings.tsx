import React, { useState } from 'react';
import PushToggle from './PushToggle';
import { persistenceService } from '../services/persistence.service';

async function clearCaches(): Promise<number> {
    if (!('caches' in self)) return 0;
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    return names.length;
}

async function clearIndexedDB(): Promise<void> {
    // Clear all known app DBs (prototype: none yet)
    // If using idb in future, list DB names here.
    const dbs = await (window.indexedDB as any).databases?.();
    if (Array.isArray(dbs)) {
        await Promise.all(
            dbs.map((db: any) => new Promise<void>((resolve) => {
                if (!db.name) return resolve();
                const req = indexedDB.deleteDatabase(db.name);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
                req.onblocked = () => resolve();
            }))
        );
    }
}

const Settings: React.FC = () => {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleClearAll = async () => {
        setBusy(true);
        setMessage(null);
        try {
            const clearedCaches = await clearCaches();
            await clearIndexedDB();
            await persistenceService.clearDatabase();
            setMessage(`Cleared ${clearedCaches} cache buckets and recreated IndexedDB database.`);
        } catch (e) {
            setMessage('Failed to clear storage.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="settings-page" style={{ padding: 16 }}>
            <h2>Settings</h2>
            <section style={{ marginTop: 16 }}>
                <h3>Notifications</h3>
                <PushToggle />
            </section>

            <section style={{ marginTop: 24 }}>
                <h3>Storage</h3>
                <p>Clear cached files and IndexedDB data.</p>
                <button className="cta-button secondary" onClick={handleClearAll} disabled={busy}>
                    {busy ? 'Clearing…' : 'Clear Cache & IndexedDB'}
                </button>
            </section>

            {message && (
                <div style={{ marginTop: 16 }}>
                    <small>{message}</small>
                </div>
            )}

            <section style={{ marginTop: 24 }}>
                <h3>About</h3>
                <p>Offline Food Ordering PWA prototype. Background Sync and Push supported.</p>
            </section>
        </div>
    );
};

export default Settings;


