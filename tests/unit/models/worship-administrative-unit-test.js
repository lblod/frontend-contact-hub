import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';

module('Unit | Model | worship administrative unit', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when model is empty', async function (assert) {
      const model = this.store().createRecord('worship-administrative-unit');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });

    test('it validates the sum of the local involvements percentages', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const recognizedWorshipType = this.store().createRecord(
        'recognized-worship-type',
        RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      );
      const organizationStatus = this.store().createRecord(
        'organization-status-code',
        ORGANIZATION_STATUS.ACTIVE,
      );
      const localInvolvementA = this.store().createRecord('local-involvement', {
        percentage: 51,
      });
      const localInvolvementB = this.store().createRecord('local-involvement', {
        percentage: 50,
      });
      const worshipAdminUnit = this.store().createRecord(
        'worship-administrative-unit',
        {
          legalName: 'Foo',
          classification,
          organizationStatus,
          recognizedWorshipType,
          involvements: [localInvolvementA, localInvolvementB],
        },
      );

      let isValid = await worshipAdminUnit.validate();

      assert.true(
        isValid,
        "it doesn't validate the involvement percentages by default",
      );

      isValid = await worshipAdminUnit.validate({
        involvementsPercentage: true,
      });

      assert.false(isValid);
      assert.propContains(worshipAdminUnit.error, {
        involvements: {
          message: 'Het totaal van alle percentages moet gelijk zijn aan 100',
        },
      });

      localInvolvementA.percentage = 50;
      isValid = await worshipAdminUnit.validate({
        involvementsPercentage: true,
      });
      assert.true(isValid);
    });
  });

  module('classification', function () {
    test(`it should return true for worship service`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.true(result);
    });

    test(`it should return true for a central worship service`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      );
      const model = this.store().createRecord('central-worship-service', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.true(result);
    });

    test('it should return false for a representative body', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.REPRESENTATIVE_BODY,
      );
      const model = this.store().createRecord('representative-body', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.notOk(result);
    });
  });
});
