"use strict";

var fs = require('fs');
var xml2js = require('xml2js');
var ig = require('imagemagick');
var colors = require('colors');
var _ = require('underscore');
var Q = require('q');

var constants = require('./util').constants;
var platformsMngr = require('./platforms-mngr');

var settings = require('./util').settings;

var RESOURCES_DIR = constants.RESOURCES_DIR;
var IOS_DIR = constants.IOS_DIR;
var IOS_PREFIX_ICON = constants.IOS_PREFIX_ICON;
var IOS_PREFIX_SPLASH = constants.IOS_PREFIX_SPLASH;
var AND_DIR = constants.AND_DIR;
var AND_PREFIX_ICON = constants.AND_PREFIX_ICON;
var AND_PREFIX_SPLASH_LAND = constants.AND_PREFIX_SPLASH_LAND;
var AND_PREFIX_SPLASH_PORT = constants.AND_PREFIX_SPLASH_PORT;



/**
 * Check which platforms are added to the project and return their splash screen names and sizes
 *
 * @param  {String} projectName
 * @return {Promise} resolves with an array of platforms
 */
var getPlatforms = platformsMngr.getPlatforms;

var display = require('./util').display;

/**
 * read the config file and get the project name
 *
 * @return {Promise} resolves to a string - the project's name
 */
var getProjectName = function() {
	var deferred = Q.defer();
	var parser = new xml2js.Parser();
	var data = fs.readFile(settings.CONFIG_FILE, function(err, data) {
		if (err) {
			display.error(err);
			deferred.reject(err);
		}
		parser.parseString(data, function(err, result) {
			if (err) {
				display.error(err);
				deferred.reject(err);
			}
			var projectName = result.widget.name[0];
			// display.success(JSON.stringify(result));
			display.success(projectName);
			deferred.resolve(projectName);
		});
	});
	return deferred.promise;
};


/**
 * Make the directories for icons and resources
 * @param  {Array} platforms List of platforms
 * @param  {String} resource Type of resouce (one of icon, splash)
 * @return {[type]}           [description]
 */
var makeResourceDir = function(platforms, resource) {
	var readFileAsync = Q.denodeify(fs.readFile);
	var mkdirAsync = function(path) {
		var deferred = Q.defer();
		fs.mkdir(path, function(err) {
			if (err)
				deferred.rejected();
			else
				deferred.resolve(path);
		});
		return deferred.promise;
	};

	mkdirAsync = Q.denodeify(fs.mkdir);
	var accessAsync = Q.denodeify(fs.access);
	var promises = [];

	_(platforms).where({
		isAdded: true
	}).forEach(function(platform) {
		var path = resource == 'splash'? platform.splashPath: platform.iconPath;
		fs.access(path, fs.R_OK|fs.W_OK, function(err) {
			if (err) {
				console.log('Making resource dir for '+path.yellow);
				promises.push(mkdirAsync(path));
			}
			else 
				return;
		});		
		// promises.push(promise);
	});

	return Q.all(promises);
};


/**
 * Crops and creates a new splash in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} splash
 * @return {Promise}
 */
var generateSplash = function(platform, splash) {
	var deferred = Q.defer();
	ig.crop({
		srcPath: settings.SPLASH_FILE,
		dstPath: platform.splashPath+'/'+splash.name,
		quality: 1,
		format: 'png',
		width: splash.width,
		height: splash.height
	}, function(err, stdout, stderr) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve();
			display.success(splash.name + ' created');
		}
	});
	return deferred.promise;
};


/**
 * Crops and creates a new icon in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} icon
 * @return {Promise}
 */
var generateIcon = function(platform, icon) {
	var deferred = Q.defer();
	// display.info('Icon '+settings.ICON_FILE+ ' -> '.cyan+platform.iconPath+'/'+icon.name);
	ig.crop({
		srcPath: settings.ICON_FILE,
		dstPath: platform.iconPath +'/'+icon.name,
		quality: 1,
		format: 'png',
		width: icon.width,
		height: icon.height
	}, function(err, stdout, stderr) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve();
			display.success(icon.name + ' created');
		}
	});
	return deferred.promise;
};

/**
 * Generates splash based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateSplashForPlatform = function(platform) {
	var deferred = Q.defer();
	display.header('Generating splash screen for ' + platform.name);
	var all = [];
	var splashes = platform.splash;
	splashes.forEach(function(splash) {
		all.push(generateSplash(platform, splash));
	});
	Q.all(all).then(function() {
		deferred.resolve();
	}).catch(function(err) {
		console.log(err);
	});
	return deferred.promise;
};

/**
 * Generates icon based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateIconForPlatform = function(platform) {
	var deferred = Q.defer();
	display.header('Generating icon for ' + platform.name);
	var all = [];
	var icons = platform.icon;
	icons.forEach(function(icon) {
		all.push(generateIcon(platform, icon));
	});
	Q.all(all).then(function() {
		deferred.resolve();
	}).catch(function(err) {
		console.log(err);
	});
	return deferred.promise;
};


/**
 * Goes over all the platforms and triggers splash screen generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateSplashes = function(platforms) {
	var deferred = Q.defer();
	var sequence = Q();
	var all = [];
	makeResourceDir(platforms, 'splash').then(function() {
		_(platforms).where({
			isAdded: true
		}).forEach(function(platform) {
			sequence = sequence.then(function() {
				return generateSplashForPlatform(platform);
			});
			all.push(sequence);
		});
		Q.all(all).then(function() {
			deferred.resolve();
		});
	});
	return deferred.promise;
};


/**
 * Goes over all the platforms and triggers icon generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateIcons = function(platforms) {
	var deferred = Q.defer();
	var sequence = Q();
	var all = [];
	makeResourceDir(platforms, 'icon').then(function(){
		_(platforms).where({
			isAdded: true
		}).forEach(function(platform) {
			display.info('About to generate icon for '+platform.name);
			sequence = sequence.then(function() {
				return generateIconForPlatform(platform);
			});
			all.push(sequence);
		});
		Q.all(all).then(function() {
			deferred.resolve();
		});	
	});
	
	return deferred.promise;
};

/**
 * Checks if at least one platform was added to the project
 *
 * @return {Promise} resolves if at least one platform was found, rejects otherwise
 */
var atLeastOnePlatformFound = function() {
	var deferred = Q.defer();
	getPlatforms().then(function(platforms) {
		var activePlatforms = _(platforms).where({
			isAdded: true
		});
		if (activePlatforms.length > 0) {
			display.success('Platforms found: ' + _(activePlatforms).pluck('name').join(', '));
			deferred.resolve(activePlatforms);
		} 
		else {
			display.error('No phonegap platforms found. Make sure you are in the root folder of your phonegap project and add platforms with \'phonegap platform add\'');
			deferred.reject();
		}
	});
	return deferred.promise;
};

/**
 * Checks if a valid splash file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validSplashExists = function() {
	var deferred = Q.defer();
	fs.exists(settings.SPLASH_FILE, function(exists) {
		if (exists) {
			display.success(settings.SPLASH_FILE + ' exists');
			deferred.resolve(true);
		} 
		else {
			display.error(settings.SPLASH_FILE + ' does not exist in the root folder');
			deferred.reject();
		}
	});
	return deferred.promise;
};

/**
 * Checks if a valid icon file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validIconExists = function() {
	var deferred = Q.defer();
	fs.exists(settings.ICON_FILE, function(exists) {
		display.header('Checking Project & Icon');
		if (exists) {
			display.success(settings.ICON_FILE + ' exists');
			deferred.resolve(true);
		} 
		else {
			display.error(settings.ICON_FILE + ' does not exist in the root folder');
			deferred.reject();
		}
	});
	return deferred.promise;
};

/**
 * Checks if a config.xml file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var configFileExists = function() {
	var deferred = Q.defer();
	fs.exists(settings.CONFIG_FILE, function(exists) {
		if (exists) {
			display.success(settings.CONFIG_FILE + ' exists');
			deferred.resolve();
		} 
		else {
			display.error('phonegap\'s ' + settings.CONFIG_FILE + ' does not exist in the root folder');
			deferred.reject();
		}
	});
	return deferred.promise;
};



/**
 * Update the config.xml file with the resources markup if it doesn't
 *
 * @return {Promise} resolve if update was ok, false otherwise 
 *
var updateConfigFile = function() {
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
			var platforms = result.widget.platform;
			// check if any platform has attr name=ios|android
			// for
			
			deferred.resolve(true);
		});
	});

	return deferred.promise;
};
*/

display.header('Checking Project & Splash');

var version = function() {
	var deferred = Q.defer();
	setTimeout(function() {
		// console.log('deferred resolve'.underline.red);
		deferred.resolve('0.1');
	}, 1000);

	// console.log(colors.blue('phonegap-res')+' '+colors.yellow('enhanced version'));
	return deferred.promise;
}; // EO version function



var iconsGeneration = function() {
	getProjectName()
	.then(getPlatforms)
	.then(generateIcons)
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	}).then(function() {
		console.log('');
	});
};


var splashGeneration = function() {
	atLeastOnePlatformFound()
	.then(validSplashExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateSplashes)
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	}).then(function() {
		console.log('');
	});
};


var main = function() {
	atLeastOnePlatformFound()
	.then(validSplashExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateSplashes)
	.catch(function(err) {
		if (err) {
			display.error(err);
		}
	})
	.then(function() {
		display.success('Splashes generation ended');
	})
	.then(validIconExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateIcons)
	.then(function() {
		display.success('Icons generation ended');
	})
	.catch(function(err) {
		if (err) {
			display.error(err);
		}
	})
	.then(platformsMngr.updateConfigFile)
	.catch(function(err) {
		if (err)
			display.error(err);
	})
	.then(function() {
		display.success('End or resources generation');
	});
};

module.exports = {
	version: version,
	main: main,
	icons: iconsGeneration,
	splashes: splashGeneration,
	configFileExists: configFileExists,
	validIconExists: validIconExists,
	validSplashExists: validSplashExists,
	getProjectName: getProjectName,
	getPlatforms: getPlatforms,
	atLeastOnePlatformFound: atLeastOnePlatformFound,
	generateSplahes: generateSplashes,
	generateIcons: generateIcons
};

/* MAIN //////////////////
atLeastOnePlatformFound()
	.then(validSplashExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateSplashes)
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	}).then(function() {
		console.log('');
	})
	.then(validIconExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateIcons)
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	}).then(function() {
		console.log('');
	});
*/