import Component from '@glimmer/component';

export default class AddressesRegisterBusNumberSelectorComponent extends Component {
  get placeholder() {
    return this.disabled ? 'Geen busnummer beschikbaar bij dit adres.' : '';
  }
}
