import { Ionic1ServeRunner } from '../serve';

describe('@ionic/cli-utils', () => {

  describe('lib/project/ionic1/serve', () => {

    describe('Ionic1ServeRunner', () => {

      describe('createOptionsFromCommandLine', () => {

        const defaults = {
          '--': [],
          address: '0.0.0.0',
          browser: undefined,
          browserOption: undefined,
          consolelogs: false,
          devapp: true,
          engine: 'browser',
          externalAddressRequired: false,
          lab: false,
          labHost: 'localhost',
          labPort: 8200,
          livereload: true,
          livereloadPort: 35729,
          notificationPort: 53703,
          open: false,
          port: 8100,
          proxy: true,
          serverlogs: false,
          ssl: false,
          project: undefined
        };

        it('should provide defaults with no options', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], {});
          expect(result).toEqual(defaults);
        });

        it('should provide options from negations of cli flag defaults', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], { livereload: false, proxy: false, devapp: false, lab: true, open: true, externalAddressRequired: true });
          expect(result).toEqual({ ...defaults, livereload: false, proxy: false, devapp: false, lab: true, open: true, externalAddressRequired: true });
        });

        it('should turn off devapp for cordova', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], { engine: 'cordova' });
          expect(result).toEqual({ ...defaults, devapp: false, engine: 'cordova' });
        });

        it('should allow overrides of default values', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], { address: 'localhost', port: '1111', 'livereload-port': '2222', 'dev-logger-port': '3333' });
          expect(result).toEqual({ ...defaults, address: 'localhost', port: 1111, livereloadPort: 2222, notificationPort: 3333 });
        });

        it('should respect --local flag', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], { local: true });
          expect(result).toEqual({ ...defaults, address: 'localhost', devapp: false });
        });

        it('should pass on separated args', () => {
          const runner = new Ionic1ServeRunner({});
          const result = runner.createOptionsFromCommandLine([], { '--': ['foo', '--bar'] });
          expect(result).toEqual({ ...defaults, '--': ['foo', '--bar'] });
        });

      });

    });

  });

});
