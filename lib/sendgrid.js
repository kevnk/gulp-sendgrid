    var mail      = require('nodemailer').mail,
        cheerio   = require('cheerio'),
        builder   = require('xmlbuilder'),
        Table     = require('cli-table'),
        SendGridAPI = require('sendgrid'),
        chalk     = require('chalk'),
        _         = require('lodash');


function SendGrid(options){
  this.options = options;
  this.initVars();
}

// Initialize variables
SendGrid.prototype.initVars = function() {
  this.sg = new SendGridAPI(this.options.apiKey);
};

/**
 * GET request to SendGrid to retrieve available templates
 * @return {Promise}
 */
SendGrid.prototype.getTemplates = function() {
  var that = this;
  var promise = new Promise(function(res, rej) {
    if (_.isArray(that.templates)) {
      return res();
    }

    // Get the templates
    var request = that.sg.emptyRequest();
    request.method = 'GET';
    request.path = '/v3/templates';

    return that.sg.API(request)
      .then(function(response) {
        that.templates = response.body ? response.body.templates || [] : [];
      })
      .catch(function(e){
        that.logErr('gulp-sendgrid: ' + e);
      })
      .then(res);
  })

  return promise
};

/**
 * Promise method to set this.template from this.templates or from one newly created
 * @return {Promise}
 */
SendGrid.prototype.getTemplate = function(res, rej) {
  var that = this;
  var matchingTemplates = this.templates.filter(function(tpl) {
    return tpl.name === that.templateName;
  });

  if (matchingTemplates.length) {
    that.template = matchingTemplates[0];
    return res();
  } else {
    // Make a template
    var request = that.sg.emptyRequest();
    request.body = {
      name: templateName
    };
    request.method = "POST";
    request.path = "/v3/templates";

    return that.sg.API(request)
      .then(function(response) {
        if (response.statusCode === 201) {
          that.template = response.body;
          return res();
        }
      })
      .catch(function(e){
        that.logErr('gulp-sendgrid: ' + e);
      });
  }
};

/**
 * Promise method to create or update SendGrid version with latest html and properties
 * @return {Promise}
 */
SendGrid.prototype.createVersion = function(res, rej) {
  if (this.template && this.template.id) {
    var that = this;

    // Setup request for creating a new version
    var request = this.sg.emptyRequest();
    request.body = {
      active: 1,
      html_content: this.html.toString(),
      name: this.versionName,
      plain_content: this.plainText,
      subject: this.title,
      template_id: this.template.id
    };
    request.method = 'POST';
    request.path = '/v3/templates/' + this.template.id + '/versions';

    // Update version if it already exists
    if (this.template.versions && this.template.versions.length) {
      var matchingVersions = this.template.versions.filter(function(version) {
        return version.name === that.versionName;
      });
      if (matchingVersions.length) {
        var version = matchingVersions[0];
        request.method = 'PATCH';
        request.path += '/' + version.id;
      }
    }

    // Create a new version
    return that.sg.API(request)
      .catch(function (e) {
        that.logErr('gulp-sendgrid: ' + e);
      });
  } else {
    return rej('No template created for "' + this.templateName + '"');
  }
}

/**
 * Initial method to create/update a version for the html submitted
 * @param  {File.contents} html
 * @param  {String} plainText     Plain text for html email
 * @param  {String} templateName
 * @param  {String} versionName
 * @param  {String} title         Used for version's subject line
 * @return {Promise}              Eventually returns the html
 */
SendGrid.prototype.run = function(html, plainText, templateName, versionName, title) {
  var that = this;
  this.html = html
  this.plainText = plainText
  this.templateName = templateName
  this.versionName = versionName
  this.title = title
  var promise = new Promise(this.getTemplate.bind(this))
    .then(this.createVersion.bind(this))
    .catch(function(e) {
      that.logErr('gulp-sendgrid: ' + e);
    })
    .then(function() {
      return html;
    });

  return promise;
};


// LOGGING HELPERS

SendGrid.prototype.log = function(str) {
  return console.log(chalk.cyan(str));
};


SendGrid.prototype.logSuccess = function(str) {
  return console.log(chalk.green(str));
};


SendGrid.prototype.logWarn = function(str) {
  return console.log(chalk.yellow(str));
};

SendGrid.prototype.logErr = function(str) {
  return console.log(chalk.red(str));
};

module.exports = SendGrid;
