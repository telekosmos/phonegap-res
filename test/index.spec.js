"use strict";

var splashcon = require('../index.js');
var settings = require('../util').settings;

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

	describe('should check platforms', function() {
		it('by default', function() {

		})

		it('skipped with --ignore-platforms', function() {

		})
	})

	describe('should check results', function() {
		it('icon files created', function() {

		})

		it('splash files created', function() {

		})
	})

	describe('cli params', function() {
		/*
		before(function() {
			process.argv = ['node', 'program', 'generate', 
				'--iconfile', 'newicon.png',
				'--splashfile', 'newsplash.png',
				'-r']
		});
		*/

		afterEach(function() {
			process.argv = [];
		})

		it('needs genereate command to work', function() {
			// console.log('BEFORE: '+process.argv)
			// console.log('AFTER: '+process.argv)
			process.argv = ['node', 'program', 'generate'];
			var res = splashcon.getCLIOpts(process.argv);
			should.exist(res);
			res.should.have.property('_');
			res._.should.have.property('length');
			res._.should.include('generate');
		})

		it('new icon filenames', function() {
			process.argv = ['node', 'program', 'generate', 
				'--iconfile', 'newicon.png'];

			var res = splashcon.getCLIOpts(process.argv);
			should.exist(res);
			res.should.have.property('_');
			res.should.have.property('iconfile');
			res.should.have.property('iconfile', 'newicon.png');
			settings.ICON_FILE.should.include(res.iconfile);			
		})

		it('--splashfile gives a new splash file name', function() {
			process.argv = ['node', 'program', 'generate', 
				'--splashfile', 'newsplash.png'];
			var res = splashcon.getCLIOpts(process.argv);
			should.exist(res);
			res.should.have.property('_');
			res.should.have.property('splashfile', 'newsplash.png');

			settings.SPLASH_FILE.should.include(res.splashfile);
			
		})


		it('-r is for using resize method', function() {
			process.argv = ['node', 'program', 'generate', '-r']
			var res = splashcon.getCLIOpts(process.argv);
			should.exist(res);
			res.should.have.property('resize', true);
		})

	})

});