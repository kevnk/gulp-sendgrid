# [gulp](http://gulpjs.com)-sendgrid [![npm version](https://img.shields.io/npm/v/gulp-sendgrid.svg?style=flat)](https://www.npmjs.com/package/gulp-sendgrid)

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
	return gulp.src(['src/**/*.html','!src/index.html'])
		.pipe(sendgrid(config))
		.pipe(gulp.dest('dist'));
});
```


## API

### sendgrid(config)

#### config

##### config.apiKey

Type: `String`  
Default: ''  
Required: `yes`

SendGrid API Key. It should be about 69 characters long. It is __NOT__ your "API Key ID". SendGrid only shows the full API Key once, so if you don't know it, you'll need to create another one.


##### config.versionPrefix

Type: `String`  
Default: ''  
Required: `no`

If you want to prefix your versions coming from this plugin. The final version name would end up `version-prefix-file-name`


## Troubleshooting
1. Make sure you've included [your SendGrid API Key](https://app.sendgrid.com/settings/api_keys) — it should be about 69 characters long. It is __NOT__ your "API Key ID" (you'll need to create a new "General" API token if all you see is "API Key ID").
2. Make sure you've set the API Key to have "Full Access" to "Transactional Templates"
3. Try [white-listing your IP from the SendGrid admin](https://app.sendgrid.com/settings/access)

## License

MIT © [Kevin Kirchner](https://github.com/kevnk)
