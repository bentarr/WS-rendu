import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import { SERVER_CONFIG } from './server-config.js';

Meteor.startup(() => {});

WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
  let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
  let language = SERVER_CONFIG.themoviedb_api_config.language;

  let apiResult = JSON.parse(
    HTTP.call(
      'GET', 
      baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language
    ).content
  )

  res.writeHead(200);
  res.end(JSON.stringify(apiResult));
});