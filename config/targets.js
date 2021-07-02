'use strict';

let browsers = [
  'Chrome >= 78',
  'last 1 Firefox versions',
  'last 1 Safari versions',
];

const isCI = Boolean(process.env.CI);
const isProduction = process.env.EMBER_ENV === 'production';

if (isCI || isProduction) {
  browsers = [
    'Chrome >= 78',
    'last 3 Firefox versions',
    'last 3 Safari versions',
  ];
}

module.exports = {
  browsers,
  node: 'current',
};
