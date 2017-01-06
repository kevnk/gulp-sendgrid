'use strict';
var gutil = require('gulp-util');
var es = require('event-stream');
var SendGrid = require('./lib/sendgrid');
var cheerio = require('cheerio');
var dateFormat = require('dateformat');
var kebabCase = require('lodash.kebabcase');
var startCase = require('lodash.startcase');
var toLower = require('lodash.tolower');

function sendSendGrid(options){

    if (!options) {
        throw new gutil.PluginError('gulp-sendgrid', 'options required');
    }

    var now = new Date();
    var date = dateFormat(now, 'yyyy-mm-dd');
    var sendgrid, html, $, title, finalHtml, templateName, versionName, versionPrefix;

    sendgrid = new SendGrid(options);


    return es.map(function (file, cb) {

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-sendgrid', 'Streaming not supported'));
            return cb();
        }

        if (file.isBuffer()) {
            sendgrid.getTemplates()
            .then(function() {
                var templateName = file.dirname.replace(file.cwd, '').substring(1).split('/');
                html = file.contents;
                $ = cheerio.load(html);
                title = $('title').text().trim();
                templateName.shift();
                templateName.push(file.stem);
                templateName = startCase(toLower(templateName.join(' ')));
                versionPrefix = options.versionPrefix || '';
                versionName = kebabCase(versionPrefix + ' ' + templateName);

                if (title.length === 0) {
                    title = date;
                }

                // Send SendGrid template
                sendgrid.run(html, templateName, versionName, title);
            });
        }

        cb(null, file);

    });

}

module.exports = sendSendGrid;
