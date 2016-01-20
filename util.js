"use strict";

var RESOURCES_DIR = 'resources'; // originally www

/**
 * @var {Object} settings - names of the config file and of the splash/icon image
 * TODO: add option to get these values as CLI params
 */
var settings = {};
settings.CONFIG_FILE = './config.xml';
settings.SPLASH_FILE = RESOURCES_DIR+'/splash.png';
settings.ICON_FILE = RESOURCES_DIR+'/icon.png';

/**
 * @var {Object} console utils
 */
var display = {};
display.success = function(str) {
	str = '✓  '.green + str;
	console.log('  ' + str);
};
display.error = function(str) {
	str = '✗  '.red + str;
	console.log('  ' + str);
};
display.header = function(str) {
	console.log('');
	console.log(' ' + str.cyan.underline);
	console.log('');
};
display.info = function(str) {
	str = 'i  '.yellow + str;
	console.log('  '+str);
};

module.exports = {
	constants: {
		RESOURCES_DIR: RESOURCES_DIR,
		IOS_DIR: RESOURCES_DIR+'/ios',
		IOS_ICON_DIR: RESOURCES_DIR+'/ios/icon',
		IOS_SPLASH_DIR: RESOURCES_DIR+'/ios/splash',
		ANDR_DIR: RESOURCES_DIR+'/android',
		// AND_PREFIX_ICON: 'drawable-',
		// AND_PREFIX_SPLASH_LAND: 'drawable-land',
		// AND_PREFIX_SPLASH_PORT: 'drawable-port',	
		ANDR_ICON_DIR: RESOURCES_DIR+'/android/icon',
		ANDR_SPLASH_DIR: RESOURCES_DIR+'/android/splash'
	},
	settings: settings,
	display: display
};
