# [gulp](http://gulpjs.com)-sendgrid 

Create [SendGrid](https://sendgrid.com/) templates and versions. Works great with [Foundation Emails](https://github.com/zurb/foundation-emails)

## Install

```bash
$ npm install gulp-sendgrid
```


## Usage

```js
var gulp = require('gulp');
var sendgrid = require('gulp-sendgrid');

var config = {
    apiKey: "YOUR-API-KEY"
}

gulp.task('default', function () {
	return gulp.src('src/**/*.html')
		.pipe(sendgrid(config))
		.pipe(gulp.dest('dist'));
});
```


## API

### sendgrid(config)

#### config

##### config.apiKey

Type: `String`  
Default: ' '  
Required: `yes`

SendGrid API Key


## License

MIT © [Kevin Kirchner](https://github.com/kevnk)
