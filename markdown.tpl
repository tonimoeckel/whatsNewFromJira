#<%= title %>
<% for(var i=0, keys = Object.keys(issues), len = keys.length; i < len ; i++){ var group = issues[keys[i]]; %>
**<%= keys[i] %>**
<% for(var j=0; j < group.length ; j++){ var issue = group[j] %>- <%= issue.key %>: <%= issue.summary %>
<% } %>
<% } %>