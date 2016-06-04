/*jslint node: true */
'use strict';
// Uses Artifactory's REST API to upload a file to an artifactory repository

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var request = require('request');
var streamifier = require('streamifier');
var validUrl = require('valid-url');

	
var PLUGIN_NAME = 'gulp-artifactory-upload';

var parseResponse = function( responseData, callback ) {

//	console.log( responseData );
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
		parseResponse( responseData, callback );
	});
};


var processFile = function( url, options, stream, callback ) {
	var req = request.put( url, options.request );
	if ( options.username && options.password ) {
		req.auth(options.username, options.password, true);
	}
	
	var called = false;

	req.on( 'error', function( err ) {
			if ( !called ) {
				called = true;
				callback( err );
			}
		} )
		.on( 'response', function( response ) {
			handleResponse( response, function( err ) {
				callback( err );
			} );
		} );

	stream.pipe( req );
};


var appendUrl = function( url, options, filename ) {
	if ( url.length === 0 ) {
		return url;
	}
	if ( url[ url.length-1 ] !== '/' ) {
		url += '/';
	}
	url += ( options.rename ? options.rename( filename ) : filename );
    if ( options.properties ) {
        url += Object.keys( options.properties ).reduce(function( str, key ) {
            return str + ';' + key + '=' + options.properties[ key ];
        }, '');
    }
    return url;
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
		throw new Error( "Invalid URL: '" + url + "'" );
	}

	var func = function(file, enc, callback) {

		var filename = path.basename( file.path );
		if (file.isStream()) {
			processFile( appendUrl( url, options, filename ), options, file.contents, callback );
		} else if (file.isBuffer()) {
			processFile( appendUrl( url, options, filename ), options, streamifier.createReadStream( file.contents ), callback);
		} else if ( file.isNull() ) {
			callback();
		}
	};

	return through.obj(func);
};


module.exports = deploy;