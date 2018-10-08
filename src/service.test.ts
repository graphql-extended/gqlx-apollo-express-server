import { createService } from './service';

describe('createService', () => {
  it('can create a simple service with no API usage', () => {
    const source = `
      type Query {
        hello(name: String): String {
          name ? 'Hello ' + name : 'Hello World'
        }
      }
    `;
    const data = {};
    const service = createService('default', source, data);
    expect(service.name).toBe('default');
    expect(service.data).toBe(data);
  });

  it('cannot create a service with invalid (empty) schema', () => {
    const source = ``;
    const data = {};

    expect(() => createService('default', source, data)).toThrow();
  });
});
