# gulp-artifactory-upload
Gulp plugin to deploy files to a JFrog Artifactory server.
Unlike grunt-artifactory-artifact, works on Windows/Mac/Linux

```
npm install gulp-artifactory-upload --save-dev
```

Example usage

```
var artifactoryUpload = require('gulp-artifactory-upload');

gulp.task( 'deploy', function() {
	return gulp.src( 'test.zip' )
		.pipe( artifactoryUpload( {
				url: 'http://artifactory.server.com:8081/artifactory/libs-release-local',
				username: 'user', // optional
				password: 'password', // optional,
				rename: function( filename ) { return filename + "1"; }, // optional
				properties: {
					// artifact properties to be appended to the URL
				},
				request: {
					// options that are passed to request.put()
				}
			} ) )
		.on('error', gutil.log);
} );
```

To create zip files, i would recommend archiver https://www.npmjs.com/package/archiver or gulp-zip for integration with gulp https://www.npmjs.com/package/gulp-zip

