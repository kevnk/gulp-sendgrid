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


SendGrid.prototype.getTemplates = function() {
  var that = this
  var promise = new Promise(function(res, rej) {
    if (_.isArray(that.templates)) return res()

    // Get the templates
    var request = that.sg.emptyRequest()
    request.method = 'GET'
    request.path = '/v3/templates'

    return that.sg.API(request)
      .then(function(response) {
        that.templates = response.body ? response.body.templates || [] : []
      })
      .catch(function(e){
        that.logErr('gulp-sendgrid: ' + e)
      })
      .then(res)
  })

  return promise
};


SendGrid.prototype.run = function(html, templateName, versionName, title) {
  var that = this
  var matchingTemplates = this.templates.filter(function(tpl) { return tpl.name === templateName })
  var template
  var promise = new Promise(function(res, rej) {
    if (matchingTemplates.length) {
      template = matchingTemplates[0]
      return res(template)
    } else {
      // Make a template
      var request = that.sg.emptyRequest()
      request.body = {
        name: templateName
      }
      request.method = "POST"
      request.path = "/v3/templates"

      return that.sg.API(request)
      .then(function(response){
        if (response.statusCode === 201) {
          template = response.body
          return res(template)
        }
      }).catch(function(e){
        that.logErr('gulp-sendgrid: ' + e)
      })
    }
  }).then(function(template){
    if (template && template.id) {
      // Post a new version
      var request = that.sg.emptyRequest()
      request.body = {
        active: 1,
        html_content: html.toString(),
        name: versionName,
        plain_content: title,
        subject: title,
        template_id: template.id
      };
      request.method = 'POST'
      request.path = '/v3/templates/' + template.id + '/versions'
      if (template.versions && template.versions.length) {
        var matchingVersions = template.versions.filter(function(version) { return version.name === versionName })
        if (matchingVersions.length) {
          var version = matchingVersions[0]
          request.method = 'PATCH'
          request.path += '/' + version.id
        }
      }

      return that.sg.API(request)
      .catch(function (e) {
        that.logErr('gulp-sendgrid: ' + e)
      }).then(function(){
        return html
      })
    }
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
