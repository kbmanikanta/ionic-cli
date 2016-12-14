import * as os from 'os';
import * as path from 'path';

import * as inquirer from 'inquirer';
import * as minimist from 'minimist';

import { isSuperAgentError } from '@ionic/cli-utils';

import { IonicNamespace } from './commands';
import { App } from '@ionic/cli-utils';
import { Config } from '@ionic/cli-utils';
import { FatalException } from '@ionic/cli-utils';
import { formatError as formatSuperAgentError, Client } from '@ionic/cli-utils';
import { Project } from '@ionic/cli-utils';
import { Session } from '@ionic/cli-utils';
import { Shell } from '@ionic/cli-utils';
import { TASKS } from '@ionic/cli-utils';
import { Logger } from '@ionic/cli-utils';


const CONFIG_FILE = 'config.json';
const CONFIG_DIRECTORY = path.resolve(os.homedir(), '.ionic');
const PROJECT_FILE = 'ionic.config.json';

function cleanup() {
  for (let task of TASKS) {
    if (task.running) {
      task.fail();
    }

    task.clear();
  }
}

export async function run(pargv: string[], env: { [k: string]: string }) {
  let exitCode = 0;
  let err: Error | undefined;

  // Check version?
  pargv = pargv.slice(2);
  const argv = minimist(pargv);

  const log = new Logger();
  const config = new Config(env['IONIC_DIRECTORY'] || CONFIG_DIRECTORY, CONFIG_FILE);

  try {
    if (argv['log-level']) {
      log.level = argv['log-level'];
    }

    const c = await config.load();

    const client = new Client(c.urls.api);
    const project = new Project('.', PROJECT_FILE);
    const session = new Session(config, project, client);
    const app = new App(session, project, client);
    const shell = new Shell();

    const ns = new IonicNamespace({
      app,
      client,
      config,
      inquirer,
      log,
      pargv,
      project,
      session,
      shell
    });

    await ns.run(pargv, { showCommand: false });
  } catch (e) {
    err = e;
  }

  cleanup();

  if (err) {
    exitCode = 1;

    if (isSuperAgentError(err)) {
      console.error(formatSuperAgentError(err));
    } else if (err instanceof FatalException) {
      exitCode = err.exitCode;

      if (err.message) {
        log.error(err.message);
      }
    } else {
      console.error(err);
    }
  }

  await config.save();

  process.exit(exitCode);
}