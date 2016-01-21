"use strict";

var splashcon = require('../index.js');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
var fs = require('fs');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('splashcon', function() {

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

		
		it('for config.xml', function() {
			
		});

		it('for icon.png file', function() {

		});

		it('for splash.png file', function() {

		});
	});

});