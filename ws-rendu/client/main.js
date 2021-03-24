import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

Template.home.onCreated(function homeOnCreated() {
  let ctrl = this;
  this.movies = new ReactiveVar()

  HTTP.call(
    'GET',
    'http://localhost:3000/api/discover/movies',
    {},
    (error, response) => {
      ctrl.movies.set(JSON.parse(response.content).results)
    }
  );
});

Template.home.helpers({
  movies() {
    return Template.instance().movies.get()
  }
});

Template.home.events({
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