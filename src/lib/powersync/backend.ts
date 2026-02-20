import { AbstractPowerSyncDatabase, CrudEntry, PowerSyncBackendConnector, UpdateType } from '@powersync/web';
import { supabase } from '../supabase';

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session) {
      return null; // Not logged in
    }

    return {
      endpoint: process.env.NEXT_PUBLIC_POWERSYNC_URL || '',
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      for (const op of transaction.crud) {
        lastOp = op;
        const { op: opType, table, opData, id } = op;
        const endpoint = supabase.from(table);

        switch (opType) {
          case UpdateType.PUT:
            const record = { ...opData, id };
            await endpoint.upsert(record);
            break;
          case UpdateType.PATCH:
            await endpoint.update(opData).eq('id', id);
            break;
          case UpdateType.DELETE:
            await endpoint.delete().eq('id', id);
            break;
        }
      }
      await transaction.complete();
    } catch (ex: any) {
      console.error('Data upload error on operation:', lastOp, ex);
      // In a production app, handle specific retryable/non-retryable errors here.
      // E.g., if non-retryable, transaction.complete()
      await transaction.complete();
    }
  }
}
