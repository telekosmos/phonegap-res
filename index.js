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
 * Read the config file and get the project name
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
		// display.info(settings.CONFIG_FILE+' data: '+data+' & err: '+err);
		parser.parseString(data, function(err, result) {
			if (err) {
				display.error(err);
				deferred.reject(err);
			}
			var projectName = result.widget.name[0];
			// display.success(JSON.stringify(result));
			display.success('Project name: '+projectName);
			deferred.resolve(projectName);
		});
	});
	return deferred.promise;
};


/**
 * Make the directories for icons and splashes
 * 
 * 
 * /*
	_(platforms).where({
		isAdded: false
	}).forEach(function(platform) {
		var pathPlatform = platform.name == 'ios'? IOS_DIR: AND_DIR;
		fs.access(pathPlatform, fs.R_OK|fs.W_OK, function(err) {
			if (err) {
				display.info('Creating resource folder '+pathPlatform.yellow);
				platformsPromises.push(mkdirAsync(pathPlatform));
				platform.isAdded = true;
			}
			else
				return;
		})
	});
*
	// return Q.all(platformPromises).then(function() {

 *
 * @param  {Array} platforms List of platforms
 * @param  {String} resource Type of resouce (one of icon, splash)
 * @return {Promise} A promise resolved with nothing (as mkdir returns undefined)
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

	mkdirAsync = Q.denodeify(fs.mkdir); // lets try this
	var promises = [];
	
	_(platforms).where({
		isAdded: true
	})
	.forEach(function(platform, idx) {
		var path = resource == 'splash'? platform.splashPath: platform.iconPath;
		fs.access(path, fs.R_OK|fs.W_OK, function(err) {
			if (err) {
				display.info('Creating resource folder '+path.yellow);
				promises.push(mkdirAsync(path));				
			}
			else
				return;
		});
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
	var transformFunc = settings.options.resize? ig.resize: ig.crop;
	transformFunc({
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
	var transformFunc = settings.options.resize? ig.resize: ig.crop;
	transformFunc({
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
	display.info('Generating splash screen for ' + platform.name);
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
	display.info('Generating icon for ' + platform.name);
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
	var platformsSelected = [];
	makeResourceDir(platforms, 'splash')
		.then(function() {
			_(platforms).where({
				isAdded: true
			}).forEach(function(platform) {
				sequence = sequence.then(function() {
					platformsSelected.push(platform.name);
					return generateSplashForPlatform(platform);
				});
				all.push(sequence);
			});
			Q.all(all).then(function() {
				deferred.resolve({platforms: platformsSelected, type: 'splash'});
			});
		});
	return deferred.promise;
};


/**
 * Goes over all the platforms and triggers icon generation
 *
 * @param  {Array} platforms The platformas as defined elsewhere in getPlatforms/settings
 * @return {Promise} The promise is resolve with the platforms which icons which generated for
 */
var generateIcons = function(platforms) {
	var deferred = Q.defer();
	var sequence = Q();
	var all = [];
	var platformsSelected = [];
	makeResourceDir(platforms, 'icon')
		.then(function() {			
			_(platforms).where({
				isAdded: true
			}).forEach(function(platform) {
				// display.info('About to generate icon for '+platform.name);
				sequence = sequence.then(function() {
					platformsSelected.push(platform.name);
					return generateIconForPlatform(platform);
				});
				all.push(sequence);
			});
			Q.all(all).then(function() {
				deferred.resolve({platforms: platformsSelected, type: 'icon'});
			});
		})

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
			display.success('Platforms found: ' + _(activePlatforms).pluck('name').join(', ').yellow);
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
	display.header('Splash');
	var deferred = Q.defer();
	fs.exists(settings.SPLASH_FILE, function(exists) {
		if (exists) {
			display.success('File '+settings.SPLASH_FILE + ' exists');
			deferred.resolve(true);
		}
		else {
			display.error('File '+settings.SPLASH_FILE + ' was not found');
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
	display.header('Icons');
	var deferred = Q.defer();
	fs.exists(settings.ICON_FILE, function(exists) {
		if (exists) {
			display.success('File '+settings.ICON_FILE + ' exists');
			deferred.resolve(true);
		}
		else {
			display.error('File '+settings.ICON_FILE + ' was not found');
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
			display.success('Cordova/Phonegap\'s'+settings.CONFIG_FILE + ' exists');
			deferred.resolve();
		}
		else {
			display.error('Cordova/Phonegap\'s ' + settings.CONFIG_FILE + ' was not found in the root folder');
			deferred.reject();
		}
	});
	return deferred.promise;
};


var iconsGeneration = function() {
	display.header('Icons generation. Checking...');
	var startProcess;
	startProcess = settings.options.ignorePlatforms
		? validIconExists()
		: atLeastOnePlatformFound().then(validIconExists)
	// return atLeastOnePlatformFound()
	// .then(validIconExists)
	// return validIconExists()
	return startProcess
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateIcons)
	.then(platformsMngr.updateConfigFile)
	.then(function() {
		display.success('Icon generation ended'.green);
	})
	/*
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	});
	*/
};

var splashGeneration = function() {
	display.header('Splash generation. Checking...');
	var startProcess;
	startProcess = settings.options.ignorePlatforms
		? validIconExists()
		: atLeastOnePlatformFound().then(validIconExists)
	// return atLeastOnePlatformFound()
	// .then(validSplashExists)
	// return validSplashExists()
	return startProcess
	.then(configFileExists)
	.then(getProjectName)
	.then(getPlatforms)
	.then(generateSplashes)
	.then(platformsMngr.updateConfigFile)
	.then(function() {
		display.success('Splash generation ended'.green);
	})
	
};

var main = function() {
	settings.options = getCLIOpts()
	console.log(' '+"splash'n'icons".yellow.underline+' (short)');
	display.header('Checking Project & Resources');
	iconsGeneration()
	.then(splashGeneration);
};


/**
 * Parse CLI options and store in settings object<br/>
 * Options are (-r, --resize, -h --help, -i --ignore-platforms, -iconfile, -splashfile)
 * @returns {Object} an options plain object or false if error
 */
var getCLIOpts = function() {
	var yargs; // = require('yargs') // (['--help']);
	yargs = (arguments.length > 0)
		? require('yargs')(arguments[0])
		: require('yargs');

	var argv = yargs.usage('$0 [options]')
		.command('generate', 'Generate assets for platforms iOS/Android')
		.demand(1)
    .example('$0 generate', 'Generate the assets')
		.showHelpOnFail(false, "Specify --help for available options")
		.option('resize', {
			alias: 'r',
			describe: 'Use imagemagick resize method instead crop',
			type: 'boolean'
		})
		.option('ignorePlaforms', {
			alias: 'i',
			describe: 'Do not check platforms and generate assets anyway'
		})
		.option('iconfile', {
			describe: 'The name of the icon file in the resources directory',
			type: 'string'
		})
		.option('splashfile', {
			describe: 'The name of the splash icon file in the resources directory',
			type: 'string'
		})		
		.help('h')
		.alias('h', 'help')
		.argv;
		
	if (argv.iconfile)
		settings.ICON_FILE = settings.ICON_FILE.replace('icon.png', argv.iconfile)
	if (argv.splashfile)
		settings.SPLASH_FILE = settings.SPLASH_FILE.replace('splash.png', argv.splashfile)

	// console.log('2. getCLIOpts: '+JSON.stringify(argv));
	return argv;
}


module.exports = {
	main: main,
	icons: iconsGeneration,
	splashes: splashGeneration,
	configFileExists: configFileExists,
	validIconExists: validIconExists,
	validSplashExists: validSplashExists,
	getProjectName: getProjectName,
	getPlatforms: getPlatforms,
	atLeastOnePlatformFound: atLeastOnePlatformFound,
	getCLIOpts: getCLIOpts
	// generateSplahes: generateSplashes,
	// generateIcons: generateIcons
};
