"use strict";

var splashcon = require('../index.js');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
var fs = require('fs');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('splashcon', function() {

	describe('basic functions', function() {
		it('should get the version', function() {
			should.exist(splashcon.version);
			return splashcon.version().should.eventually.be.eql('0.1');
		});
	});


	describe('should check files existence', function() {
		var existsStub, existsSyncStub;
		beforeEach(function() {
			// mock fs object
			existsStub = sinon.stub(fs, 'exists');
			existsStub.yields(false);
		});

		afterEach(function() {
			fs.exists.restore();
			// fs.existsSync.restore();
		});

		it('for test', function() {
			var promise = splashcon.version();
			// promise.should.be.fulfilled;
			return promise.should.eventually.equal('0.1');
		});

		it('for config.xml', function() {
			
		});

		it('for icon.png file', function() {

		});

		it('for splash.png file', function() {

		});
	});


	describe('should check project props', function() {
		it('for project name', function() {

		});

		it('for iOS platform registered', function() {

		});

		it('for android platform registered', function() {

		});
	});

	describe('should generate', function() {
		it('splashes from splash.png', function() {

		});

		it('icons from icon.png', function() {

		});
	});
});