'use strict';

const { Device } = require('homey');
const Polestar = require('@andysmithfal/polestar.js');
const HomeyCrypt = require('../../lib/homeycrypt')

var polestar = null;

class PolestarVehicle extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('PolestarVehicle has been initialized');
    await this.fixCapabilities();
    this.update_loop_timers();
  }

  update_loop_timers() {
    this.updateVehicleState();
    let interval = 60000;
    this._timerTimers = setInterval(() => {
        this.updateVehicleState();
    }, interval);
  }

  async fixCapabilities()
  {
    if(!this.hasCapability('measure_battery'))
      await this.addCapability('measure_battery');
    // if(!this.hasCapability('measure_current'))
    //   await this.addCapability('measure_current');
    // if(!this.hasCapability('measure_power'))
    //   await this.addCapability('measure_power');
    if(!this.hasCapability('chargetimeremaining'))
      await this.addCapability('chargetimeremaining');
    if(!this.hasCapability('odometer'))
      await this.addCapability('odometer');
    if(!this.hasCapability('range'))
      await this.addCapability('range');
    if(!this.hasCapability('charging'))
      await this.addCapability('charging'); 
    if(!this.hasCapability('chargeportconnected'))
      await this.addCapability('chargeportconnected');
       
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('PolestarVehicle has been added');
  }

  async updateVehicleState()
  {
    console.log('Rerieve device details');
    if(this.polestar==null)
    {
      let PolestarUser = this.homey.settings.get('user_email');
      let PolestarPwd = await HomeyCrypt.decrypt(this.homey.settings.get('user_password'),PolestarUser);
      this.polestar = new Polestar(PolestarUser,PolestarPwd);
      await this.polestar.login();
      await this.polestar.setVehicle(this.getData().vin);
    }
    var odometer = await this.polestar.getOdometer();
    console.log(JSON.stringify(odometer));
    var odo = odometer.odometerMeters;
    try
    {
      odo = odo/1000; //Convert to KM instead of M
    }
    catch{
      odo = null;
    }
    console.log('KM:'+odo)
    var batteryInfo = await this.polestar.getBattery();
    console.log(JSON.stringify(batteryInfo));

    this.setCapabilityValue('measure_battery', batteryInfo.batteryChargeLevelPercentage);
    // this.setCapabilityValue('measure_current', batteryInfo.chargingCurrentAmps);
    // this.setCapabilityValue('measure_power', batteryInfo.chargingPowerWatts);
    this.setCapabilityValue('odometer', odo);
    this.setCapabilityValue('chargetimeremaining', batteryInfo.estimatedChargingTimeToFullMinutes);
    this.setCapabilityValue('range', batteryInfo.estimatedDistanceToEmptyKm);
    if(batteryInfo.chargingStatus=='CHARGING_STATUS_CHARGING')
      this.setCapabilityValue('charging', true);
    else
      this.setCapabilityValue('charging', false);
    if(batteryInfo.chargerConnectionStatus=='CHARGER_CONNECTION_STATUS_CONNECTED')
      this.setCapabilityValue('chargeportconnected', true);
    else
      this.setCapabilityValue('chargeportconnected', false);
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('PolestarVehicle settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('PolestarVehicle was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('PolestarVehicle has been deleted');
  }

}

module.exports = PolestarVehicle;
