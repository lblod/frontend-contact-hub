import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'frontend-organization-portal/config/environment';
import './config/custom-inflector-rules';
import { silenceEmptySyncRelationshipWarnings } from './utils/ember-data';

silenceEmptySyncRelationshipWarnings();

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
