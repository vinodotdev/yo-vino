import helpers from 'yeoman-test';
import assert from 'yeoman-assert';
import { expect } from 'chai';

import YoVino from '../app';

describe('vino generator', function () {
  it('should work from command line options', async () => {
    await helpers
      .run(YoVino)
      .withOptions({
        module: 'my-module',
        author: 'john doe',
        description: 'my desc',
        language: 'Rust',
      })
      .withLocalConfig({ lang: 'en' });
    assert.file(['README.md']);
  });
  it('should tolerate lowercase language', async () => {
    await helpers
      .run(YoVino)
      .withOptions({
        module: 'my-module',
        author: 'john doe',
        description: 'my desc',
        language: 'rust',
      })
      .withLocalConfig({ lang: 'en' });
    assert.file(['README.md']);
  });
  it('should create the project dir if specified via CLI arg', async () => {
    const instance = await helpers
      .run(YoVino)
      .withOptions({
        module: 'my-module',
        author: 'john doe',
        description: 'my desc',
        language: 'rust',
        create: true,
      })
      .withLocalConfig({ lang: 'en' });
    expect(instance.env.rootGenerator().destinationRoot().endsWith('my-module'));
  });
});
