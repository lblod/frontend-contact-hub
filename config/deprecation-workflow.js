/* eslint-disable no-undef */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    // ember-focus-trap < v0.6.0 triggers this, which is bundled by ember-appuniversum
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' },
    { handler: 'silence', matchId: 'this-property-fallback' }, // AuDataTable triggers this
    { handler: 'silence', matchId: 'implicit-injections' }, // FastBoot triggers this
    // ember-inspector triggers this
    {
      handler: 'silence',
      matchId: 'deprecated-run-loop-and-computed-dot-access',
    },
    {
      handler: 'silence',
      matchId: 'ember.built-in-components.import',
    },
    { handler: 'silence', matchId: 'ember.component.reopen' }, // ember-test-selectors < v6 triggers this which is included by ember-appuniversum
    { handler: 'silence', matchId: 'ember-global' },
  ],
};
