/*jslint node: true */
'use strict';
// Uses Artifactory's REST API to upload a file to an artifactory repository

var through = require('through2')
	, gutil = require('gulp-util')
	, request = require('request')
	, es = require('event-stream')
	, BufferStreams = require('bufferstreams')
	, validUrl = require('valid-url');

	
var PLUGIN_NAME = 'gulp-artifactory-upload';

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


var process = function( url, options, contentsBuffer, callback ) {
			
	var req = request.put( url );
	if ( options.username && options.password ) {
		req.auth(options.username, options.password, true);
	}
	req.on( 'error', function( err ) {
			callback( err );
		} )
		.on( 'response', function( response ) {
			handleResponse( response, function( err ) {
				callback( err );
			} );
		} );

	req.write( contentsBuffer );
};


var deploy = function(options) {
	var url;
	var optionsType = typeof options;
	if ( optionsType === 'string' ) {
		url = options;
	} else if ( optionsType === 'object' ) {
		url = options.url;
	}
	
	if ( url === undefined || !validUrl.isUri(url) ) {
		throw new Error( "Invalid URL: '" + url + "'" )
	}
	
	var func = function(file, callback) {
		
		if (file.isNull()) {
			// Nothing to do if no contents
			callback(null, file);
		}
		else if (file.isStream()) {
			file.contents = file.contents.pipe(new BufferStreams(function(err, buf, cb) {
				try {
					if (err) {
						return cb(new gutil.PluginError(PLUGIN_NAME, err.message));
					}
					process(url, options, buf, cb);
				}
				catch (err) {
					cb(new gutil.PluginError(PLUGIN_NAME, err.message));
				}
			}));
		}
		else if (file.isBuffer()) {
			try {
				process(url, options, file.contents, callback);
			}
			catch (err) {
				callback(err, null);
			}
		}
	};

	return es.map( func );
};


module.exports = deploy;
