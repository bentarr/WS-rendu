import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { localDatas } from './local-data.js';

Meteor.startup(() => {});

WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  res.writeHead(200);
  res.end(JSON.stringify(localDatas));
});