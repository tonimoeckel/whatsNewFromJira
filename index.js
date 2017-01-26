var config = require('./config.json'),
	_ = require('underscore'),
	fs = require('fs'),
	JiraClient = require('jira-connector'),
	connectConfig = {
		host: process.env.HOST || config.host,
		port: process.env.PORT || config.port,
		protocol:	process.env.PROTOCOL || config.protocol
	};


if ((config.auth && (config.auth.username || config.auth.base64)) || process.env.USERNAME || process.env.BASE64){

	var auth = config.auth || {};
	var base64Auth = process.env.BASE64 || config.auth.base64;

	if (!base64Auth){

		var username = process.env.USERNAME || auth.username;
		var password = process.env.PASSWORD || auth.password;
		base64Auth = new Buffer(username+':'+password).toString('base64');
	}

	connectConfig.basic_auth = {
			base64: base64Auth
		};

}

var jira = new JiraClient( connectConfig );

jira.filter.getFilter({filterId: process.env.FILTER || config.filter}, function(err, result){

	if (err){
		console.error(err);
		return;
	}

	jira.search.search({
		method: 'GET',
		jql:result.jql
	}, function(err, searchResult){
		if (err){
			console.error(err);
			return;
		}

		createMarkdown(searchResult.issues);

	});


});

/**
 *
 * @param issues: Array of Jira issues
 */
function createMarkdown(issues){

	var titles = {};

	for (var i = 0, len = issues.length; i < len; i++) {
		var issue = issues[i],
				issueType = issue.fields.issuetype.name;
		if (!titles[issueType]){
			titles[issueType] = [];
		}
		titles[issueType].push({
			key: issue.key,
			summary: issue.fields.summary
		})

	}

	var template = fs.readFileSync('./markdown.tpl', "utf8");
	var resultString = _.template(template)({
		title: 'Title',
		issues: titles
	});

	fs.writeFileSync(process.env.EXPORT || config.export,resultString,"utf8");

}