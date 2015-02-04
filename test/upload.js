/*global describe:false, it:false */

// Note: These tests require a functional Artifactory server to test against
'use strict';

var artifactoryUpload = require('../');

var assert = require('stream-assert');
var gulp = require('gulp');
var path = require('path');
var tap = require('gulp-tap');
var File = require('gulp-util').File;
var should = require('should');
var request = require('request');
var crc = require('crc');
var glob = require("glob");
var fs = require('fs');

var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); };
//var workingServerUrl = "http://localhost:8088/artifactory/libs-release-local";
var workingServerUrl = "http://192.168.0.250:8081/artifactory/libs-release-local";


var uploadTest = function( testName, url, src, buffered ) {

	it( testName, function( done ) {

		gulp.src( fixtures( src ), { buffer: buffered } )
			.pipe( artifactoryUpload( { url: url, username: 'admin', password: 'password' } ) )
			.on( 'error', function( err ) { err.should.equal( undefined ); } )
			.pipe( assert.end( done ) );
	} );
};


var verifyFile = function( file, url, src, done ) {
	var req = request( url + "/" + path.basename( file ) );
	var data = '';
	req.on('data', function(response){
		data += response;
	}); 
	req.on('end', function(string){
		var downloadedCrc = crc.crc32( data );
		var originalCrc = crc.crc32( fs.readFileSync( file ) );
		downloadedCrc.should.equal( originalCrc );
		done();
	});
};


var verifyTest = function( testName, url, src, buffered ) {
	it( testName, function( done ) {
	
		glob( fixtures( src ), {}, function( err, files ) {
		
			var index = 0;
			var recurse = function() {
				verifyFile( files[ index ], url, src, function() {
					index++;
					if ( index < files.length ) {
						recurse( files[ index ], url, src, recurse );
					} else {
						done();
					}
				} );
			};
			recurse();
		} );
	} );
};


describe('gulp-artifactory-upload', function() {

	this.timeout(4 * 1000); // give it 30 seconds to upload
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
			uploadTest( 'upload successful', workingServerUrl, 'BinaryImageFile.jpg', true );
			verifyTest( 'file can be downloaded and verified', workingServerUrl, 'BinaryImageFile.jpg', true );
		});
		
		describe('works with a single streamed file', function() {
			uploadTest( 'upload successful', workingServerUrl, 'BinaryImageFile.jpg', false );
			verifyTest( 'file can be downloaded and verified', workingServerUrl, 'BinaryImageFile.jpg', false );
		});
	});

	describe('Attempt upload with multiple files,', function() {
		
		describe('works with multiple buffered files', function() {
			uploadTest( 'upload successful', workingServerUrl, '*', true );
			verifyTest( 'file can be downloaded and verified', workingServerUrl, '*', true );
		});
		
		describe('works with multiple streamed files', function() {
			uploadTest( 'upload successful', workingServerUrl, '*', false );
			verifyTest( 'file can be downloaded and verified', workingServerUrl, '*', false );
		});
	});
});

