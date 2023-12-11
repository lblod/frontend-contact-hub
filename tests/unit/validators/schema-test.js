import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { phone } from 'frontend-organization-portal/validators/schema';

module('Unit | Validator | schema', function (hooks) {
  setupTest(hooks);

  module('phone validation', function () {
    test('it returns true when phone is empty', function (assert) {
      const { error } = phone('Phone is wrong').validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns true when phone is valid', function (assert) {
      const { error } = phone('Phone is wrong').validate('+32412345678');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when phone number is wrong', function (assert) {
      const { error } = phone('Phone is wrong').validate(':32477');

      assert.strictEqual(error.details[0].message, 'Phone is wrong');
    });
  });
});
