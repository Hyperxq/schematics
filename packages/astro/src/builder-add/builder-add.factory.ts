import { Rule, noop } from '@angular-devkit/schematics';
import { logger, spawnAsync } from '../../../../utils';

export function addFactory({
  installCli,
  packageManager,
}: {
  installCli: boolean | string;
  packageManager: string;
}): Rule {
  return () => {
    const shouldInstallCli = installCli === 'false' ? false : !!installCli;
    return shouldInstallCli ? installCliDev(packageManager) : noop();
  };
}

function installCliDev(packageManager: string): Rule {
  return async () => {
    const packageManagerCommands = {
      npm: 'install',
      yarn: 'add',
      pnpm: 'add',
      cnpm: 'install',
      bun: 'add',
    };

    try {
      await spawnAsync(
        packageManager,
        [packageManagerCommands[packageManager], `--save-dev --save-exact @pbuilder/astro-cli -g`],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
      );
    } catch (e) {
      logger.error(e.message);
    }
  };
}
