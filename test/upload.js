/*global describe:false, it:false */

// Note: These tests require a functional Artifactory server to test against
'use strict';

var artifactoryUpload = require('../');

var assert = require('stream-assert');
var gulp = require('gulp');
var path = require('path');
var File = require('gulp-util').File;
var test = require('./test-stream');
require('should');

var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); }
var workingServerUrl = "http://localhost:8088/artifactory/libs-release-local";


var uploadTest = function( url, src, buffered ) {
	return function( done ) {
		this.timeout(30 * 1000); // give it 30 seconds to upload
		gulp.src( fixtures( src ), { buffer: buffered } )
			.pipe( artifactoryUpload( url ) );
		done();
	};
};

var verifyTest = function( src, buffered ) {
	return function( done ) {
		done();
	};
};


describe('gulp-artifactory-upload', function() {

	describe('attempt to supply invalid options:', function() {
		it('will fail with no options', function(done) {
			(function() {
				var stream = artifactoryUpload();
				stream.end();
			}).should.throw( /^Invalid URL/ );
			done();
		});
		
		it('will fail with invalid URL', function(done) {
			(function() {
				var stream = artifactoryUpload( '12532588882ggg' );
				stream.end();
			}).should.throw( /^Invalid URL/ );
			done();
		});
		
		it('will fail with server that does not exist', function(done) {
			done();
		});
		
		it('will fail with server that does exist, but not an artifactory server', function(done) {
			done();
		});
		
		it('will fail with invalid username/password', function(done) {
			done();
		});
	});

	describe('Attempt upload with single file,', function() {
		
		describe('works with a single buffered file', function() {
			it('upload successful', uploadTest( workingServerUrl, 'BinaryImageFile.jpg', true ) );
			it('file can be downloaded and verified', verifyTest( 'BinaryImageFile.jpg', true ) );
		});
		
		describe('works with a single streamed file', function() {
			it('upload successful', uploadTest( workingServerUrl, 'BinaryImageFile.jpg', false ) );
			it('file can be downloaded and verified', verifyTest( 'BinaryImageFile.jpg', false ) );
		});
	});

	describe('Attempt upload with multiple files,', function() {
		
		describe('works with multiple buffered files', function() {
			it('upload successful', uploadTest( workingServerUrl, '*', true ) );
			it('files can be downloaded and verified', verifyTest( '*', true ) );
		});
		
		describe('works with multiple streamed files', function() {
			it('upload successful', uploadTest( workingServerUrl, '*', false ) );
			it('files can be downloaded and verified', verifyTest( '*', false ) );
		});
	});
});

