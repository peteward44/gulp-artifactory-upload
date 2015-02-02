# gulp-artifactory-upload
Gulp plugin to deploy files to a JFrog Artifactory server.

Example usage

```
var artifactoryUpload = require('gulp-artifactory-upload');

var artifactoryDeployFunc = function() {
	return gulp.src( 'test.zip' )
		.pipe( artifactoryUpload( {
				url: 'http://artifactory.server.com:8081/artifactory/libs-release-local/test.zip',
				username: 'user', // optional
				password: 'password' // optional
			} ) );
};
```

