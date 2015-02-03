/*global describe:false, it:false */

// Note: These tests require a functional Artifactory server to test against
'use strict';

var artifactoryUpload = require('../');

var through = require('through2');
require('should');

describe('gulp-artifactory-upload', function() {

	describe('attempt to supply invalid options:', function() {
		it('will fail with invalid URL', function(done) {
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
		it('file should exist on server', function(done) {
			done();
		});
		
		it('file can be downloaded then verified with the same checksum', function(done) {
			done();
		});
		
	});
	
	describe('Attempt upload with multiple files,', function() {
		it('all files should exist on server', function(done) {
			done();
		});
		
		it('all files can be downloaded then verified with the same checksum', function(done) {
			done();
		});
	});
			// // Arrange
			// var condition = true;
			// var called = 0;
			// var fakeFile = {
				// path: tempFile,
				// contents: new Buffer(tempFileContent)
			// };

			// var s = gulpif(condition, through.obj(function (file, enc, cb) {
				// // Test that file got passed through
				// (file === fakeFile).should.equal(true);

				// called++;
				// this.push(file);
				// cb();
			// }));

			// // Assert
			// s.once('finish', function(){

				// // Test that command executed
				// called.should.equal(1);
				// done();
			// });

			// // Act
			// s.write(fakeFile);
			// s.end();
});

