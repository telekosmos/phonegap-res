"use strict";
var Q = require('q');

var configObj = require('./common').configObj;
var platformMngr = require('../platforms-mngr');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
var fs = require('fs');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(require('chai-things'));


describe('platformMngr', function() {

	describe('parse config.xml', function() {
		var promise;
		beforeEach(function() {
			promise = platformMngr.parseConfigFile();
		});

		it('should get an object from parsing file', function() {
			// parse config.xml and return an object -> configObj
			return promise.should.eventually.be.an('object');
		});

		it('should the parsed object root with widget', function() {
			return promise.should.eventually.to.include.keys('widget');
		});
	});

	describe('retrive items from parsed config.xml', function() {
		var promiseIcon, promiseSplash;
		beforeEach(function() {
			promiseIcon = platformMngr.getAssetsFromConfig(configObj, 'ios', 'icon');
			promiseSplash = platformMngr.getAssetsFromConfig(configObj, 'ios', 'splash');
		});

		it('should return a promise', function() {
			should.exist(configObj);
			configObj.should.include.keys('widget');
			return promiseIcon.should.eventually.be.fulfilled;
		});

		it('should get a list of iOS icons from file', function() {
			// mock the JSON with a file or so...
			// get the list of ios icons from configObj.platform.ios -> getAssetsFromConfig
			return promiseIcon.should.eventually.have.length.above(0);
		});

		it('should any element of list has a src attribute', function() {
			return promiseIcon.then(function(list) {
				var icon = list[0]['$'];
				should.exist(icon);
				icon.should.include.keys('src');
				list.should.all.have.property('$');
			});
			// chai-things and chai-as-promised dont get on well each other...
			// return promiseIcon.should.eventually.all.have.property('$');
		});

		it('should get a list of iOS splashes from config.xml file', function() {
			// get the list of splashes
			return promiseSplash.should.eventually.have.length.above(0);
		});

		it('should any splash have width and height attributes', function() {
			return promiseSplash.then(function(list) {
				should.exist(list);
				var splash = list['0']['$'];
				splash.should.include.keys('src');
				splash.should.include.keys('width');
				splash.src.should.contains('splash');
			});
		});
	});


	describe('get resources for platforms', function() {
		var promiseIOS, promiseAndroid;
		beforeEach(function() {
			promiseIOS = platformMngr.getAssetsFromSettings('ios', 'icon');
			promiseAndroid = platformMngr.getAssetsFromSettings('android', 'splash');
		});

		it ('should resolve to assets', function() {
			return promiseIOS.should.eventually.to.be.fulfilled &&
				promiseAndroid.should.eventually.to.be.fulfilled;
		});

		it('should retrieve a list of icons from iOS platform', function() {
			// get list of icons from getPlatforms
			// should.exist(promiseIOS);
			return promiseIOS.then(function(theList) {
				should.exist(theList);
				theList.should.have.property('type', 'icon');

				var list = theList.list;
				list.should.all.have.property('width');
				list.should.all.have.property('height');
				list.should.all.have.property('name');
				list.should.all.be.instanceof(Object);
			});
		});

		it('should retrieve a list of splashes from Android platform', function() {
			// should.exist(promiseAndroid);
			return promiseAndroid.then(function(theList) {
				should.exist(theList);
				theList.should.have.property('platform', 'android');
				var list = theList.list;
				list.should.all.have.property('width');
				list.should.all.have.property('height');
				list.should.all.have.property('name');
			});
		});

		it('should retrieve all predefined assets', function() {
			var promise = platformMngr.getAllAssets();
			return promise.then(function(values) {
				should.exist(values);
				values.should.have.length(4);
				values.should.all.be.instanceof(Object);
				values.should.all.have.property('list');
			});
		});

	});


	describe('predefined assets', function() {
		var promiseIcon, promiseSplash, promiseConvert,
			iconsMock = require('./common').iosIcons,
			splashAndr = require('./common').andrSplashes;

		beforeEach(function() {
			promiseIcon = platformMngr.getAssetsFromSettings('ios', 'icon');
			promiseSplash = platformMngr.getAssetsFromSettings('android', 'splash');
		});

		it ('should resolve to assets', function() {
			return promiseIcon.should.eventually.to.be.fulfilled &&
				promiseSplash.should.eventually.to.be.fulfilled;
		});

		it('should convert icon to xml2js format', function() {
			should.exist(iconsMock);
			promiseConvert = platformMngr.convert4xml(iconsMock);
			return promiseConvert.then(function(newList) {
				should.exist(newList);
				newList.should.be.instanceof(Array);
				newList.should.all.be.instanceof(Object);
				newList.should.all.have.property('$');
				var elem = newList[0];
				elem.$.should.have.property('src');
				elem.$.should.have.property('width');
				elem.$.should.have.property('height'); // height
			});
		});

		it('should convert splash to xml2js format', function() {
			should.exist(splashAndr);
			promiseConvert = platformMngr.convert4xml(splashAndr);
			return promiseConvert.then(function(list) {
				should.exist(list);
				list.should.be.instanceof(Array);
				list.should.have.length.above(0);
				list.should.all.be.instanceof(Object);
				list.should.all.have.property('$');
				var item = list[0];
				item.$.should.have.property('density');
			});
		});

		it('should convert all assets', function() {
			var allAssets = [iconsMock, splashAndr];
			promiseConvert = platformMngr.convertAllAssets(allAssets);
			return promiseConvert.then(function(newAssets) {
				should.exist(newAssets);
				newAssets.length.should.be.equal(allAssets.length);
				newAssets.should.all.be.instanceof(Array);
				var iconAsset = newAssets[0];
				iconAsset.should.be.instanceof(Array);
				iconAsset.length.should.be.equal(iconsMock.list.length);
				iconAsset.should.all.have.property('$');
				iconAsset[0].$.should.have.property('src');
			});
		});
	});



	// TODO:
	describe('missing items fix', function() {
		if('should get a list of missing icons', function() {

		});

		it('should fill the parsed object with missings', function() {

		});

	});
});
