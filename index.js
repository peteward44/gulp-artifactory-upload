/*jslint node: true */
'use strict';
// Uses Artifactory's REST API to upload a file to an artifactory repository

var through = require('through2')
	, gutil = require('gulp-util')
	, request = require('request')
	, streamifier = require('streamifier');

	
var parseResponse = function( responseData, callback ) {

	var response = JSON.parse( responseData );
	if ( response.errors ) {
		var errStr = '';
		response.errors.forEach( function( err ) {
			if ( errStr.length > 0 ) {
				errStr += ", ";
			}
			errStr += err.status + ": " + err.message;
		} );
		callback( errStr );
	} else {
		gutil.log('Successfully uploaded ' + response.size + " bytes to " + response.uri );
		callback();
	}
};

	
var handleResponse = function( response, callback ) {
	var responseData = '';
	response.on('data', function(data) {
		responseData += data;
	});
	response.on('end', function() {
		try {
			parseResponse( responseData, callback );
		}
		catch ( err ) {
			callback( err );
		}
	});
};


var deploy = function(options) {
	options = options || {};
	
	if ( typeof options.url !== 'string' ) {
		throw new Error( "Artifactory upload plugin requires url parameter" );
	}

	var func = function(file, enc, callback) {
		var that = this;
		
		if ( file.isNull() ) {
			callback(null, file);
			return;
		}
			
		var req = request.put( options.url );
		if ( options.username && options.password ) {
			req.auth(options.username, options.password, true);
		}
		req.on( 'error', function( err ) {
				callback( err );
			} )
			.on( 'response', function( response ) {
				handleResponse( response, function( err ) {
					if ( !err ) {
						that.push(file);
					}
					callback( err );
				} );
			} );
		
		var stream = file.contents;
		if ( file.isBuffer() ) {
			stream = streamifier.createReadStream( file.contents );
		}
		stream.pipe( req );
	};

	return through.obj(func);
};


module.exports = deploy;
