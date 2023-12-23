'use strict';

const Homey = require('homey');

class PolestarBevVehicles extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('PolestarBevVehicles has been initialized');
  }

}

module.exports = PolestarBevVehicles;
