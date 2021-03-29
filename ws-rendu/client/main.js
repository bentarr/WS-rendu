import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

var movies = new ReactiveVar();
var page = new ReactiveVar(1);

// [Template] Films

Template.films.onCreated(function filmsOnCreated() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/page/' + page.get(),
    {},
    (error, response) => {
      movies.set(JSON.parse(response.content).results)
    }
  );
});

Template.films.helpers({
  movies() {
    return movies.get()
  }
});

Template.films.events({
  'click button'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie, movies);
  }
});

function updateLikeMovie(idMovie, movies) {
  HTTP.call(
    'PUT', 
    'http://localhost:3000/api/like/' + idMovie,
    {},
    (error, response) => {
      let index = movies.get().findIndex(
        (item) => { return item.id === JSON.parse(response.content).id; }
      );
      let moviesList = movies.get();
      moviesList[index].like = JSON.parse(response.content).like;
      movies.set(moviesList);
    } 
  )
}

// [Template] Pagination

Template.pagination.helpers({
  page() {
    return page.get()
  }
});

Template.pagination.events({
  'click #pagePrecedente'() {
    if (page.get() > 1) {
      page.set(page.get() - 1);
      HTTP.call(
        'GET',
        'http://localhost:3000/api/page/' + page.get(),
        {},
        (error, response) => {
          movies.set(JSON.parse(response.content).results);
        }
      );
    }
  },
  'click #pageSuivante'() {
    if (page.get() < 500) {
      page.set(page.get() + 1);
      HTTP.call(
        'GET',
        'http://localhost:3000/api/page/' + page.get(),
        {},
        (error, response) => {
          movies.set(JSON.parse(response.content).results);
        }
      );
    }
  }
});