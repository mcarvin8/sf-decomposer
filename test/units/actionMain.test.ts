'use strict';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getInputSpy, setFailedSpy, runDecomposeSpy, runRecomposeSpy, runVerifySpy } = vi.hoisted(() => ({
  getInputSpy: vi.fn(),
  setFailedSpy: vi.fn(),
  runDecomposeSpy: vi.fn(),
  runRecomposeSpy: vi.fn(),
  runVerifySpy: vi.fn(),
}));

vi.mock('@actions/core', () => ({
  getInput: getInputSpy,
  setFailed: setFailedSpy,
}));

vi.mock('../../src/action/decompose.js', () => ({ runDecompose: runDecomposeSpy }));
vi.mock('../../src/action/recompose.js', () => ({ runRecompose: runRecomposeSpy }));
vi.mock('../../src/action/verify.js', () => ({ runVerify: runVerifySpy }));

const { run } = await import('../../src/action/main.js');

describe('run', () => {
  beforeEach(() => {
    getInputSpy.mockReset();
    setFailedSpy.mockReset();
    runDecomposeSpy.mockReset().mockResolvedValue(undefined);
    runRecomposeSpy.mockReset().mockResolvedValue(undefined);
    runVerifySpy.mockReset().mockResolvedValue(undefined);
  });

  it('dispatches to runDecompose for mode "decompose"', async () => {
    getInputSpy.mockReturnValue('decompose');
    await run();
    expect(runDecomposeSpy).toHaveBeenCalledOnce();
    expect(runRecomposeSpy).not.toHaveBeenCalled();
    expect(runVerifySpy).not.toHaveBeenCalled();
    expect(setFailedSpy).not.toHaveBeenCalled();
  });

  it('dispatches to runRecompose for mode "recompose"', async () => {
    getInputSpy.mockReturnValue('recompose');
    await run();
    expect(runRecomposeSpy).toHaveBeenCalledOnce();
    expect(runDecomposeSpy).not.toHaveBeenCalled();
    expect(setFailedSpy).not.toHaveBeenCalled();
  });

  it('dispatches to runVerify for mode "verify"', async () => {
    getInputSpy.mockReturnValue('verify');
    await run();
    expect(runVerifySpy).toHaveBeenCalledOnce();
    expect(setFailedSpy).not.toHaveBeenCalled();
  });

  it('fails with a clear message for an unrecognized mode', async () => {
    getInputSpy.mockReturnValue('bogus');
    await run();
    expect(setFailedSpy).toHaveBeenCalledWith('Invalid mode "bogus". Expected "decompose", "recompose", or "verify".');
    expect(runDecomposeSpy).not.toHaveBeenCalled();
    expect(runRecomposeSpy).not.toHaveBeenCalled();
    expect(runVerifySpy).not.toHaveBeenCalled();
  });

  it('catches an Error thrown by the handler and calls setFailed with its message', async () => {
    getInputSpy.mockReturnValue('decompose');
    runDecomposeSpy.mockRejectedValue(new Error('boom'));
    await run();
    expect(setFailedSpy).toHaveBeenCalledWith('boom');
  });

  it('catches a non-Error thrown value and stringifies it for setFailed', async () => {
    getInputSpy.mockReturnValue('decompose');
    runDecomposeSpy.mockRejectedValue('not an Error instance');
    await run();
    expect(setFailedSpy).toHaveBeenCalledWith('not an Error instance');
  });
});
