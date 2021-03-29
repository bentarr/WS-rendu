import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import { Mongo } from 'meteor/mongo'
import { SERVER_CONFIG } from './server-config.js';

const Like = new Mongo.Collection('like');

let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
let language = SERVER_CONFIG.themoviedb_api_config.language;
const urlDeBase = baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language;

Meteor.startup(() => {});

WebApp.connectHandlers.use('/api/like', (req, res, next) => {
    switch (req.method) {
      case 'GET':
        break;
      case 'PUT':
        let idMovie = req.url.split('/')[1];
        let newMovieLikes = updateLikeMovie(parseInt(idMovie));
        res.writeHead(200);
        res.end(JSON.stringify(newMovieLikes));
        break;
      default:
        break;
    }
  }
);

WebApp.connectHandlers.use('/api/page', (req, res, next) => {
  HTTP.call(
    'GET', 
    urlDeBase + '&page=' + req.url.split('/')[1],
    {},
    (error, response) => {
      let newResp = response.data;
      newResp.results.forEach((movie) => {
        let resource = Like.findOne({ id: movie.id });
        movie.like = resource ? resource.like : 0;
      });
      res.writeHead(200);
      res.end(JSON.stringify(newResp));
    }
  );
});

WebApp.connectHandlers.use('/api/filtre', (req, res, next) => {
  let filtreActif = req.originalUrl.split('/')[3];
  let numeroPage = req.originalUrl.split('/')[4];
  let filtreUrl = '';
  switch (filtreActif) {
    case 'doc':
      filtreUrl = 'release_date.asc';
      break;
    case 'dod':
      filtreUrl = 'release_date.desc';
      break;
    case 'poc':
      filtreUrl = 'popularity.asc';
      break;
    case 'pod':
      filtreUrl = 'popularity.desc';
      break;
    default:
      break;
  }
  HTTP.call(
    'GET', 
    urlDeBase + '&sort_by=' + filtreUrl + '&page=' + numeroPage,
    {},
    (error, response) => {
      let newResp = response.data;
      newResp.results.forEach((movie) => {
        let resource = Like.findOne({ id: movie.id });
        movie.like = resource ? resource.like : 0;
      });
      res.writeHead(200);
      res.end(JSON.stringify(newResp));
    }
  );
});

function updateLikeMovie(idMovie) {
  let resource = Like.findOne({ id: idMovie });
  if (resource) {
    Like.update(
      { id: idMovie }, 
      { $inc: { like: 1 } }
    );
  } else {
    Like.insert(
      { id: idMovie,
        like: 1 }
    );
  }

  return Like.findOne({ id: idMovie });
}