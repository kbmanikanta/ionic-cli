import { CommandGroup } from '@ionic/cli-framework';
import { CommandLineInputs, CommandLineOptions, CommandMetadata, isCommand } from '@ionic/cli-utils';
import { Command } from '@ionic/cli-utils/lib/command';
import chalk from 'chalk';

export class HelpCommand extends Command {
  async getMetadata(): Promise<CommandMetadata> {
    return {
      name: 'help',
      type: 'global',
      summary: 'Provides help for a certain command',
      exampleCommands: ['start'],
      inputs: [
        {
          name: 'command',
          summary: 'The command you desire help with',
        },
      ],
      options: [
        {
          name: 'json',
          summary: 'Print help in JSON format',
          type: Boolean,
        },
      ],
      groups: [CommandGroup.Hidden],
    };
  }

  async run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void> {
    const { CommandSchemaHelpFormatter, CommandStringHelpFormatter, NamespaceSchemaHelpFormatter, NamespaceStringHelpFormatter } = await import('@ionic/cli-utils/lib/help');
    const location = await this.namespace.locate(inputs);

    if (isCommand(location.obj)) {
      const formatterOptions = { location, command: location.obj };
      const formatter = options['json'] ? new CommandSchemaHelpFormatter(formatterOptions) : new CommandStringHelpFormatter(formatterOptions);
      this.env.log.rawmsg(await formatter.format());
    } else {
      if (location.args.length > 0) {
        this.env.log.error(
          `Unable to find command: ${chalk.green(inputs.join(' '))}` +
          (this.project ? '' : '\nYou may need to be in an Ionic project directory.')
        );
      }

      const isLoggedIn = await this.env.session.isLoggedIn();
      const now = new Date();
      const prefix = isLoggedIn ? chalk.blue('PRO') + ' ' : '';
      const version = this.env.ctx.version;
      const suffix = now.getMonth() === 9 && now.getDate() === 31 ? ' 🎃' : '';

      const formatterOptions = {
        inProject: this.project ? true : false,
        version: prefix + version + suffix,
        location,
        namespace: location.obj,
      };

      const formatter = options['json'] ? new NamespaceSchemaHelpFormatter(formatterOptions) : new NamespaceStringHelpFormatter(formatterOptions);
      this.env.log.rawmsg(await formatter.format());
    }
  }
}
