import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

// [Template] Films

Template.films.onCreated(function filmsOnCreated() {
  this.movies = new ReactiveVar()

  HTTP.call(
    'GET',
    'http://localhost:3000/api/discover/movies',
    {},
    (error, response) => {
      this.movies.set(JSON.parse(response.content).results)
    }
  );
});

Template.films.helpers({
  movies() {
    return Template.instance().movies.get()
  }
});

Template.films.events({
  'click button'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie, Template.instance().movies);
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

Template.pagination.onCreated(function paginationOnCreated() {
  this.page = new ReactiveVar(1);
});

Template.pagination.helpers({
  page() {
    return Template.instance().page.get()
  }
});