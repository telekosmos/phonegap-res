"use strict";

var fs = require('fs');
var xml2js = require('xml2js');
var ig = require('imagemagick');
var colors = require('colors');
var _ = require('underscore');
var Q = require('q');

var constants = require('./util').constants;
var settings = require('./util').settings;
var display = require('./util').display;

var RESOURCES_DIR = constants.RESOURCES_DIR;
var IOS_DIR = constants.IOS_DIR;
var AND_DIR = constants.ANDR_DIR;

/**
 * Check which platforms are added to the project and return their splash screen names and sizes.
 * Platforms are added to the project when the resources directories for them are created
 *
 * @return {Promise} resolves with an array of platforms
 */
var getPlatforms = function() {
	var deferred = Q.defer();
	var platforms = [];

	platforms.push({
		name: 'ios',
		// TODO:30 use async fs.exists
		isAdded: fs.existsSync(IOS_DIR), // fs.existsSync(IOS_DIR+'/splash') && fs.existsSync(IOS_DIR+'/icon'),
		resourceRoot: IOS_DIR,
		splashPath: IOS_DIR+'/splash',
		iconPath: IOS_DIR+'/icon',
		icon: [{
				name: 'icon.png',
				width: 57,
				height: 57
			}, {
				name: 'icon@2x.png',
				width: 114,
				height: 114
			}, {
				name: 'icon-40.png',
				width: 40,
				height: 40
			}, {
				name: 'icon-40@2x.png',
				width: 80,
				height: 80
			}, {
				name: 'icon-50.png',
				width: 50,
				height: 50
			}, {
				name: 'icon-50@2x.png',
				width: 100,
				height: 100
			}, {
				name: 'icon-60.png',
				width: 60,
				height: 60
			}, {
				name: 'icon-60@2x.png',
				width: 120,
				height: 120
			}, {
				name: 'icon-60@3x.png',
				width: 180,
				height: 180
			}, {
				name: 'icon-72.png',
				width: 72,
				height: 72
			}, {
				name: 'icon-72@2x.png',
				width: 144,
				height: 144
			}, {
				name: 'icon-76.png',
				width: 76,
				height: 76
			}, {
				name: 'icon-76@2x.png',
				width: 152,
				height: 152
			}, {
				name: 'icon-small.png',
				width: 29,
				height: 29
			}, {
				name: 'icon-small@2x.png',
				width: 58,
				height: 58
			}, {
				name: 'icon-small@3x.png',
				width: 87,
				height: 87
			}
		],
		splash: [{
				name: 'Default~iphone.png',
				width: 320,
				height: 480
			}, {
				name: 'Default-Landscape~iphone.png',
				width: 480,
				height: 320
			}, {
				name: 'Default@2x~iphone.png',
				width: 640,
				height: 960
			}, {
				name: 'Default-Portrait~ipad.png',
				width: 768,
				height: 1024
			}, {
				name: 'Default-568h@2x~iphone.png',
				width: 640,
				height: 1136
			}, {
				name: 'Default-667h@2x.png',
				width: 750,
				height: 1334
			}, {
				name: 'Default-Landscape-667h@2x.png',
				width: 1334,
				height: 750
			}, {
				name: 'Default-Portratit-736h@3x.png',
				width: 1242,
				height: 2208
			}, {
				name: 'Default-Landscape-736h@3x.png',
				width: 2208,
				height: 1242
			}, {
				name: 'Default-Landscape~ipad.png',
				width: 1024,
				height: 768
			}, {
				name: 'Default-Portrait~ipad.png',
				width: 768,
				height: 1024
			}, {
				name: 'Default-Landscape@2x~ipad.png',
				width: 2048,
				height: 1536
			}, {
				name: 'Default-Portrait@2x~ipad.png',
				width: 1536,
				height: 2048
			}
		]
	});
	/*
	Android Splash resolutions:
	ldpi = 320 x 426
	mdpi = 320 X 470
	hdpi = 480 x 640
	xhdpi = 720 x 960
	xxhdpi = 1080 X 1440

	Android Icon resolutions:
	192px (xxxhdpi)
	144px (xxhdpi)
	96px (xhdpi)
	72px (hdpi)
	48px (mdpi)
	36px (ldpi)
	512x512 pixel - only used in Android Market; resized to various sizes
 	*/
	platforms.push({
		name: 'android',
		isAdded: fs.existsSync(AND_DIR), // fs.existsSync(AND_DIR+'/splash') && fs.existsSync(AND_DIR+'/icon'),
		resourceRoot: AND_DIR,
		splashPath: AND_DIR+'/splash',
		iconPath: AND_DIR+'/icon',
		icon: [{
				name: 'drawable-ldpi-icon.png',
				width: 36,
				height: 36,
				density: 'ldpi'
			}, {
				name: 'drawable-mdpi-icon.png',
				width: 48,
				height: 48,
				density: 'mdpi'
			}, {
				name: 'drawable-hdpi-icon.png',
				width: 72,
				height: 72,
				density: 'hdpi'
			}, {
				name: 'drawable-xhdpi-icon.png',
				width: 96,
				height: 96,
				density: 'xhdpi'
			}, {
				name: 'drawable-xxhdpi-icon.png',
				width: 144,
				height: 144,
				density: 'xxhdpi'
			}, {
				name: 'drawable-xxxhdpi-icon.png',
				width: 192,
				height: 192,
				density: 'xxxhdpi'
			}
		],
		splash: [{
				name: 'drawable-land-ldpi-screen.png',
				width: 320,
				height: 200,
				density: 'land-ldpi'
			}, {
				name: 'drawable-port-ldpi-screen.png',
				width: 200,
				height: 320,
				density: 'port-ldpi'
			}, {
				name: 'drawable-land-mdpi-screen.png',
				width: 480,
				height: 320,
				density: 'land-mdpi'
			}, {
				name: 'drawable-port-mdpi-screen.png',
				width: 320,
				height: 480,
				density: 'port-mdpi'
			}, {
				name: 'drawable-land-hdpi-screen.png',
				width: 800,
				height: 480,
				density: 'land-hdpi'
			}, {
				name: 'drawable-port-hdpi-screen.png',
				width: 480,
				height: 800,
				density: 'port-hdpi'
			}, {
				name: 'drawable-land-xhdpi-screen.png',
				width: 1280,
				height: 720,
				density: 'land-xhdpi'
			}, {
				name: 'drawable-port-xhdpi-screen.png',
				width: 720,
				height: 1280,
				density: 'port-xhdpi'
			}, {
				name: 'drawable-land-xxhdpi-screen.png',
				width: 1600,
				height: 960,
				density: 'land-xxhdpi'
			}, {
				name: 'drawable-port-xxhdpi-screen.png',
				width: 960,
				height: 1600,
				density: 'port-xxhdpi'
			}, {
				name: 'drawable-land-xxxhdpi-screen.png',
				width: 1920,
				height: 1280,
				density: 'land-xxxhdpi'
			}, {
				name: 'drawable-port-xxxhdpi-screen.png',
				width: 1280,
				height: 1920,
				density: 'port-xxxhdpi'
			}
		]
	});
	// TODO:20 add remainder platforms
	deferred.resolve(platforms);
	return deferred.promise;
};


/**
 * Convert the 'local' format into xml2js format ready to be written to file. Builds up a list
 * of (asset) objects like
 * {
		"$": {
			"src": "...",
			"width": "...",
			"height": "..."
		}
	 }
 * where each object is an asset (icon or splash).
 * @param  {Object} list An object with a list of assets, type of asset and platform
 * @return {Promise} A promise which will be resolved to a new list
 */
var convert4xml = function(theList) {
	var deferred = Q.defer();
	var list = theList.list;
	var prefixSrc;
	prefixSrc = theList.platform == 'android'? constants.ANDR_DIR: constants.IOS_DIR;
	prefixSrc += theList.type == 'icon'? '/icon': '/splash';

	var newList = list.map(function(asset, index) {
		var newObj = {
			"$": {
				"src": prefixSrc+'/'+asset.name,
			}
		};
		if (asset.density !== undefined) {
			newObj.$.density = asset.density;
		}
		else {
			newObj.$.width = asset.width;
			newObj.$.height = asset.height;
		}
		return newObj;
	});
	deferred.resolve(newList);

	return deferred.promise;
};


/**
 * Just parses the config.xml file
 * @return {Promise} A promise which will be resolve to a POJO with the xml structure
 */
var parseConfigFile = function() {
	var deferred = Q.defer();
	var parser = new xml2js.Parser();
	fs.readFile(settings.CONFIG_FILE, function(err, data) {
		if (err) {
			display.error(err);
			deferred.reject(err);
		}
		parser.parseString(data, function(err, result) {
			if (err) {
				display.error(err);
				deferred.reject(err);
			}
			deferred.resolve(result);
		});
	});

	return deferred.promise;
};


/**
 * Get the icon list for a given platform
 * @param  {object} configObj the parsed config object
 * @param  {string} platform the platform to get the resources from
 * @param  {string} type Valid are icon or splash
 * @return {Promise} A promise which will be resolve with the list of icons found
 */
var getAssetsFromConfig = function(configObj, platform, type) {
	var defer = Q.defer();
	var platforms = configObj.widget.platform;
	var list;
	if (platforms) {
		var assets = _(platforms).where('$', {"name": platform});
		list = assets[0][type];
		defer.resolve(list);
	}
	else
		defer.reject();

	return defer.promise;
};


/**
 * Gets the list of right assets from the predefined platforms and resource type
 * @param  {String} platform One of android/ios
 * @param  {String} type One of icon/splash
 * @return {Promise} a promise which will be resolved with the list of assets
 */
var getAssetsFromSettings = function(platform, type) {
	var deferred = Q.defer();
	getPlatforms().then(function(platforms) {
		var chosen = _(platforms).where({'name': platform});
		var list = chosen[0][type];
		deferred.resolve({
			list: list,
			type: type,
			platform: platform
		});
	});

	return deferred.promise;
};


/**
 * Get all item assets from platform settings above
 * @return {Promise} A promise resolve with an array of assets lists
 */
var getAllAssets = function() {
	// display.info('Getting all settings assets...');
	var iosIcon = getAssetsFromSettings('ios', 'icon');
	var iosSplash = getAssetsFromSettings('ios', 'splash');
	var andrIcon = getAssetsFromSettings('android', 'icon');
	var andrSplash = getAssetsFromSettings('android', 'splash');

	return Q.all([iosIcon, iosSplash, andrIcon, andrSplash]);
};


/**
 * Write the resulting xml from the (updated) config object to a file
 * @param  {Object} configObj The configuration object
 * @return {Promise} A promise which will be rejected upon file writing error
 */
var writeToFile = function(configObj) {
	var defer = Q.defer();
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(configObj);
	fs.writeFile(settings.CONFIG_FILE, xml, function(err) {
		if (err)
			defer.reject(err);
		else {
			display.success('File updated: '+settings.CONFIG_FILE);
			defer.resolve();
		}
	});
	return defer.promise;
};


/**
 * Convert all (four/two per platform) predefined assets to the format needed to be written into xml
 * @param  {Array} assets The assets for every platform an every platform
 * @return {Promise} A promise resolved with all results or rejected if one promise is reject
 */
var convertAllAssets = function(assets) {
	var promiseArray = assets.map(function(asset) {
		return convert4xml(asset);
	});
	return Q.all(promiseArray);
};


/**
 * Update the config.xml file with the resources markup if it didn't.
 * Parse config.xml -> configObj
 * Get reference to platform: configObj.widget.platorm -> delete
 * Get assets for ios/icon; convert to xml2js JSON format
 * Get assets for ios/splash; convert to xml2js JSON format
 * Get assets for android/icon; convert to xml2js JSON format
 * Get assets for android/splash; convert to xml2js JSON format
 * Make JSON for platform and replace in configObj
 * Write to file the new JSON
 *
 * @param {Object} resources An object such {platforms: [...], type: 'icon|splash' }
 * @return {Promise} resolve if update was ok, false otherwise
 */
var updateConfigFile = function(resources) {
	var configObj;
	return parseConfigFile()
		.then(function(cfgObj) {
			configObj = cfgObj;
			return getAllAssets();
		})
		.then(convertAllAssets)
		.then(function(newAssets) { // JSON object formatted to be used by xml2js
			/*
				configObj.widget.platform = [{
					$: {
						name: 'ios'
					},
					icon: [],
					splash: []
				}, {
					$: {
						name: 'android'
					},
					icon: [],
					splash: []
				}];
			*/
			resources.platforms.forEach(function(platform) {
				var configPlatform;
				if (!!configObj.widget.platform) {
				 	configPlatform = configObj.widget.platform.filter(function(el) {
						return el.$.name === platform;
					})[0];
				}
				else {
					configObj.widget.platform = [];
				}

				if (configPlatform === undefined) {
					var newLength = configObj.widget.platform.push({
						$: {
							name: platform
						},
						icon: [],
						splash: []
					});
					configPlatform = configObj.widget.platform[newLength-1];
				}
				newAssets.forEach(function(newAsset) {
					if (newAsset[0].$.src.indexOf(platform) != -1) {
						if (newAsset[0].$.src.indexOf(resources.type) != -1) {
							configPlatform[resources.type] = newAsset;
						}
					}
				});
			}); // EO loop platforms with generated resources
			// display.info('Assets embedded in config object: '+JSON.stringify(configObj.widget.platform));
			return configObj;
		})
		.then(writeToFile);
};



var testMain = function() {
	var resources = {platforms: ['ios', 'android'], type: 'icon'};
	updateConfigFile(resources);
};

module.exports = {
	test: testMain,
	updateConfigFile: updateConfigFile,
	parseConfigFile: parseConfigFile,
	getAssetsFromConfig: getAssetsFromConfig,
	getAssetsFromSettings: getAssetsFromSettings,
	getAllAssets: getAllAssets,
	convert4xml: convert4xml,
	convertAllAssets: convertAllAssets,
	getPlatforms: getPlatforms,
};
