import helpers from 'yeoman-test';
import assert from 'yeoman-assert';

import YoVino from '../src';

describe('rust project generator', function () {
  it('should populate basic project', async () => {
    await helpers
      .run(YoVino)
      .withOptions({
        module: 'my-module',
        author: 'john doe',
        description: 'my desc',
        language: 'rust',
      })
      .withLocalConfig({ lang: 'en' });
    assert.file([
      '.gitignore',
      '.cargo/config.toml',
      '.github/workflows/build.yml',
      '.vscode/extensions.json',
      '.vscode/launch.json',
      '.vscode/settings.json',
      '.vscode/tasks.json',
      'LICENSE',
      'README.md',
      'Makefile',
      'Cargo.toml',
      'schemas/my-component.widl',
      'src/lib.rs',
    ]);
  });
});
