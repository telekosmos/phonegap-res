var fs = require('fs');
var xml2js = require('xml2js');
var ig = require('imagemagick');
var colors = require('colors');
var _ = require('underscore');
var Q = require('q');

/**
 * Check which platforms are added to the project and return their splash screen names and sizes
 *
 * @param  {String} projectName
 * @return {Promise} resolves with an array of platforms
 */
var getPlatforms = function(projectName) {
    var deferred = Q.defer();
    var platforms = [];
    platforms.push({
        name: 'ios',
        // TODO: use async fs.exists
        isAdded: fs.existsSync('www/res/screen/ios') && fs.existsSync('www/res/icon/ios'),
        splashPath: 'www/res/screen/ios/',
        iconPath: 'www/res/icon/ios/',
        splash: [{
                name: 'screen-iphone-portrait.png',
                width: 320,
                height: 480
            }, {
                name: 'screen-iphone-portrait-2x.png',
                width: 640,
                height: 960
            }, {
                name: 'screen-iphone-portrait-568h-2x.png',
                width: 640,
                height: 1136
            }, {
                name: 'screen-ipad-landscape.png',
                width: 1024,
                height: 768
            }, {
                name: 'screen-ipad-portrait.png',
                width: 768,
                height: 1024
            }, {
                name: 'screen-ipad-landscape-2x.png',
                width: 2048,
                height: 1496
            }, {
                name: 'screen-ipad-portrait-2x.png',
                width: 1536,
                height: 2008
            }, {
                name: 'screen-iphone6-portrait.png',
                width: 750,
                height: 1334
            }, {
                name: 'screen-iphone6-landscape.png',
                width: 1334,
                height: 750
            }, {
                name: 'screen-iphone6-plus-portrait.png',
                width: 1242,
                height: 2208
            }, {
                name: 'screen-iphone6-plus-landscape.png',
                width: 2208,
                height: 1242
            },
        ],        
        icon: [{
                name: 'icon-57.png',
                width: 57,
                height: 57
            }, {
                name: 'icon-72.png',
                width: 72,
                height: 72
            }, {
                name: 'icon-57-2x.png',
                width: 114,
                height: 114
            }, {
                name: 'icon-72-2x.png',
                width: 144,
                height: 144
            },
        ]
    });
    platforms.push({
        name: 'android',
        isAdded: fs.existsSync('www/res/screen/android') && fs.existsSync('www/res/icon/android'),
        splashPath: 'www/res/screen/android/',
        iconPath: 'www/res/icon/android/',
        splash: [{
	            name: 'screen-hdpi-landscape.png',
	            width: 800,
	            height: 480
	        }, {
	            name: 'screen-hdpi-portrait.png',
	            width: 480,
	            height: 800
	        }, {
	            name: 'screen-ldpi-landscape.png',
	            width: 320,
	            height: 200
	        }, {
	            name: 'screen-ldpi-portrait.png',
	            width: 200,
	            height: 320
	        }, {
	            name: 'screen-mdpi-landscape.png',
	            width: 480,
	            height: 320
	        }, {
	            name: 'screen-mdpi-portrait.png',
	            width: 320,
	            height: 480
	        }, {
	            name: 'screen-xhdpi-landscape.png',
	            width: 1280,
	            height: 720
	        }, {
	            name: 'screen-xhdpi-portrait.png',
	            width: 720,
	            height: 1280
	        }, 
        ],
        icon: [{
                name: 'icon-36-ldpi.png',
                width: 36,
                height: 36
            }, {
                name: 'icon-48-mdpi.png',
                width: 48,
                height: 48
            }, {
                name: 'icon-72-hdpi.png',
                width: 72,
                height: 72
            }, {
                name: 'icon-96-xhdpi.png',
                width: 96,
                height: 96
            },
        ]
    });
    // TODO: add all platforms
    deferred.resolve(platforms);
    return deferred.promise;
};


/**
 * @var {Object} settings - names of the config file and of the splash/icon image
 * TODO: add option to get these values as CLI params
 */
var settings = {};
settings.CONFIG_FILE = 'config.xml';
settings.SPLASH_FILE = 'www/splash.png';
settings.ICON_FILE = 'www/icon.png';

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

/**
 * read the config file and get the project name
 *
 * @return {Promise} resolves to a string - the project's name
 */
var getProjectName = function() {
    var deferred = Q.defer();
    var parser = new xml2js.Parser();
    data = fs.readFile(settings.CONFIG_FILE, function(err, data) {
        if (err) {
            deferred.reject(err);
        }
        parser.parseString(data, function(err, result) {
            if (err) {
                deferred.reject(err);
            }
            var projectName = result.widget.name[0];
            deferred.resolve(projectName);
        });
    });
    return deferred.promise;
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
        dstPath: platform.splashPath + splash.name,
        quality: 1,
        format: 'png',
        width: splash.width,
        height: splash.height,
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
    ig.crop({
        srcPath: settings.ICON_FILE,
        dstPath: platform.iconPath + icon.name,
        quality: 1,
        format: 'png',
        width: icon.width,
        height: icon.height,
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
    _(platforms).where({
        isAdded: true
    }).forEach(function(platform) {
        sequence = sequence.then(function() {
            return generateIconForPlatform(platform);
        });
        all.push(sequence);
    });
    Q.all(all).then(function() {
        deferred.resolve();
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
            display.success('platforms found: ' + _(activePlatforms).pluck('name').join(', '));
            deferred.resolve();
        } else {
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
            deferred.resolve();
        } else {
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
            deferred.resolve();
        } else {
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
        } else {
            display.error('phonegap\'s ' + settings.CONFIG_FILE + ' does not exist in the root folder');
            deferred.reject();
        }
    });
    return deferred.promise;
};

display.header('Checking Project & Splash');

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
