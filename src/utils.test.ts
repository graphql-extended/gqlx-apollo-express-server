import { tryParseJson } from './utils';

describe('tryParseJson', () => {
  it('parses legit JSON without problems', () => {
    const json = '{ "foo": "bar" }';
    const result = tryParseJson(json);
    expect(result).toEqual({
      foo: 'bar',
    });
  });

  it('parses illegal JSON by falling back to the message', () => {
    const json = 'hello';
    const result = tryParseJson(json);
    expect(result).toBe(json);
  });
});
