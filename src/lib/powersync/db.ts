import { PowerSyncDatabase, WASQLiteOpenFactory } from '@powersync/web';
import { AppSchema } from './AppSchema';
import { SupabaseConnector } from './backend';

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: 'library-app.sqlite',
    worker: '/@powersync/worker/WASQLiteDB.umd.js'
  }),
  // If in a standard web browser, Next.js will serve these out of the public folder
  // which we copied using `powersync-web copy-assets`.
  sync: {
    worker: '/@powersync/worker/SharedSyncImplementation.umd.js'
  }
});

let connector: SupabaseConnector | null = null;

export const initPowerSync = async () => {
  if (connector) return; // Already initialized
  await powerSync.init();
  connector = new SupabaseConnector();
  await powerSync.connect(connector);
};
