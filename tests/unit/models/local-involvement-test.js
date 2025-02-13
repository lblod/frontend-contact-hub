import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';
import sinon from 'sinon';

module('Unit | Model | local involvement', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it returns error when required fields are missing', async function (assert) {
      const model = this.store().createRecord('local-involvement');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        administrativeUnit: { message: 'Selecteer een lokaal bestuur' },
        involvementType: { message: 'Selecteer een type betrokkenheid' },
      });
    });

    test('it forbids ADVISORY as involvementType when administrativeUnit is a province', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        {
          ...CLASSIFICATION.PROVINCE,
        },
      );
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        {
          classification,
        },
      );
      const involvementType = this.store().createRecord('involvement-type', {
        id: INVOLVEMENT_TYPE.ADVISORY,
      });
      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
        percentage: '100',
      });

      const getOtherLocalInvolvementsStub = sinon.stub(
        model,
        'getOtherLocalInvolvements',
      );
      getOtherLocalInvolvementsStub.resolves([]);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        involvementType: {
          message: 'Adviserend is geen geldige keuze voor een provincie',
        },
      });
    });

    [
      ['0', 'Het percentage moet groter zijn dan 0'],
      ['not a number', 'Vul het percentage in'],
      ['', 'Vul het percentage in'],
      [undefined, 'Vul het percentage in'],
    ].forEach(([percentage, errorMessage]) => {
      test(`it returns error when involvementType is SUPERVISORY and percent is ${percentage}`, async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const involvementType = this.store().createRecord('involvement-type', {
          id: INVOLVEMENT_TYPE.SUPERVISORY,
        });
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([]);

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.propContains(model.error, {
          percentage: {
            message: errorMessage,
          },
        });
      });
    });

    test('it does not validate the sum of percentages', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
      );
      const involvementType = this.store().createRecord('involvement-type', {
        id: INVOLVEMENT_TYPE.SUPERVISORY,
      });
      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
        percentage: 50,
      });

      const midFinancialInvolvementType = this.store().createRecord(
        'involvement-type',
        {
          id: INVOLVEMENT_TYPE.MID_FINANCIAL,
        },
      );
      const otherModel = this.store().createRecord('local-involvement', {
        administrativeUnit,
        midFinancialInvolvementType,
        percentage: 30,
      });

      const getOtherLocalInvolvementsStub = sinon.stub(
        model,
        'getOtherLocalInvolvements',
      );
      getOtherLocalInvolvementsStub.resolves([otherModel]);

      let isValid = await model.validate();
      assert.true(
        isValid,
        'the validation succeeds even if the total percentage is below a 100',
      );

      model.percentage = 90;
      isValid = await model.validate();
      assert.true(
        isValid,
        'the validation succeeds even if the total percentage is above a 100',
      );
    });

    module('existsOtherSupervisoryLocalInvolvement', function () {
      test('it returns true when there is another SUPERVISORY local involvement', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const involvementType = this.store().createRecord('involvement-type', {
          id: INVOLVEMENT_TYPE.SUPERVISORY,
        });

        const percentage = '50';
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType,
          percentage,
        });

        const otherModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([otherModel]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.ok(result);
      });

      test('it returns false when there is no other local involvement', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const involvementType = this.store().createRecord('involvement-type', {
          id: INVOLVEMENT_TYPE.SUPERVISORY,
        });

        const percentage = '50';
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.notOk(result);
      });

      test('it returns false when there is only another ADVISORY local involvement', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const supervisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.SUPERVISORY,
          },
        );
        const advisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.ADVISORY,
          },
        );

        const percentage = '50';
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: supervisoryInvolvementType,
          percentage,
        });

        const otherModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: advisoryInvolvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([otherModel]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.notOk(result);
      });

      test('it returns false when there is only another MID_FINANCIAL local involvement', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const supervisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.SUPERVISORY,
          },
        );
        const midFinancialInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.MID_FINANCIAL,
          },
        );

        const percentage = '50';
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: supervisoryInvolvementType,
          percentage,
        });

        const otherModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: midFinancialInvolvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([otherModel]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.notOk(result);
      });

      test('it returns false when there are other non-supervisory local involvements', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const supervisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.SUPERVISORY,
          },
        );
        const advisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.ADVISORY,
          },
        );
        const midFinancialInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.MID_FINANCIAL,
          },
        );
        const percentage = '50';

        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: supervisoryInvolvementType,
          percentage,
        });

        const midFinancialModel = this.store().createRecord(
          'local-involvement',
          {
            administrativeUnit,
            involvementType: midFinancialInvolvementType,
            percentage,
          },
        );

        const advisoryModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: advisoryInvolvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([
          midFinancialModel,
          advisoryModel,
        ]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.notOk(result);
      });

      test('it returns true when there is at least one other SUPERVISORY local involvement', async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit',
        );
        const supervisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.SUPERVISORY,
          },
        );
        const advisoryInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.ADVISORY,
          },
        );
        const midFinancialInvolvementType = this.store().createRecord(
          'involvement-type',
          {
            id: INVOLVEMENT_TYPE.MID_FINANCIAL,
          },
        );
        const percentage = '50';

        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: supervisoryInvolvementType,
          percentage,
        });

        const otherModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: supervisoryInvolvementType,
          percentage,
        });

        const midFinancialModel = this.store().createRecord(
          'local-involvement',
          {
            administrativeUnit,
            involvementType: midFinancialInvolvementType,
            percentage,
          },
        );

        const advisoryModel = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType: advisoryInvolvementType,
          percentage,
        });

        const getOtherLocalInvolvementsStub = sinon.stub(
          model,
          'getOtherLocalInvolvements',
        );
        getOtherLocalInvolvementsStub.resolves([
          midFinancialModel,
          advisoryModel,
          otherModel,
        ]);

        const result = await model.existsOtherSupervisoryLocalInvolvement();
        assert.ok(result);
      });
    });

    test('it returns an error when there is already a SUPERVISORY local involvement', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
      );
      const involvementType = this.store().createRecord('involvement-type', {
        id: INVOLVEMENT_TYPE.SUPERVISORY,
      });

      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
        percentage: '50',
      });
      const otherModel = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
        percentage: '50',
      });

      const getOtherLocalInvolvementsStub = sinon.stub(
        model,
        'getOtherLocalInvolvements',
      );
      getOtherLocalInvolvementsStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        involvementType: {
          message:
            'Er kan slechts één gemeente- of provincieoverheid optreden als hoofdtoezichthouder',
        },
      });
    });

    test('it returns an error when there is no SUPERVISORY local involvement', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
      );
      const involvementType = this.store().createRecord('involvement-type', {
        id: INVOLVEMENT_TYPE.ADVISORY,
      });

      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
        percentage: '100',
      });

      const getOtherLocalInvolvementsStub = sinon.stub(
        model,
        'getOtherLocalInvolvements',
      );
      getOtherLocalInvolvementsStub.resolves([]);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        involvementType: {
          message: 'U dient een toezichthoudende overheid aan te duiden',
        },
      });
    });

    test('it properly handles numbers with a decimal point', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
      );
      const supervisoryInvolvementType = this.store().createRecord(
        'involvement-type',
        {
          id: INVOLVEMENT_TYPE.SUPERVISORY,
        },
      );

      const midFinancingInvolvementType = this.store().createRecord(
        'involvement-type',
        {
          id: INVOLVEMENT_TYPE.MID_FINANCING,
        },
      );

      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType: supervisoryInvolvementType,
        percentage: '45.5',
      });

      const otherModel = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType: midFinancingInvolvementType,
        percentage: '54.5',
      });

      const getOtherLocalInvolvementsStub = sinon.stub(
        model,
        'getOtherLocalInvolvements',
      );
      getOtherLocalInvolvementsStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
    });
  });
});
