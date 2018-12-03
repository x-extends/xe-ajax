const XEAjax = require('../index')

describe('Ajax functions', () => {
  test('serialize()', () => {
    expect(XEAjax.serialize({ name: 'test1' })).toEqual('name=test1')
  })
})
