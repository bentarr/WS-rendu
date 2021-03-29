import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

var movies = new ReactiveVar();
var page = new ReactiveVar(1);
var filtreDateDecroissant = new ReactiveVar(false);
var filtreDateCroissant = new ReactiveVar(false);
var filtrePopulariteDecroissant = new ReactiveVar(false);
var filtrePopulariteCroissant = new ReactiveVar(false);

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
  page() { return page.get(); },
  filtreDateDecroissant() { return filtreDateDecroissant.get(); },
  filtreDateCroissant() { return filtreDateDecroissant.get(); },
  filtrePopulariteDecroissant() { return filtreDateDecroissant.get(); },
  filtrePopulariteCroissant() { return filtreDateDecroissant.get(); }
});

Template.pagination.events({
  'click #pagePrecedente'() {
    if (page.get() > 1) {
      page.set(page.get() - 1);
      HTTP.call(
        'GET',
        // ajouter un switch case pour le filtre actif
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
  },
  'change #filter'(event) {
    let id = event.target.value;
    let filterType = '';
    filtreDateCroissant.set(false);
    filtreDateDecroissant.set(false);
    filtrePopulariteCroissant.set(false);
    filtrePopulariteDecroissant.set(false);
    if (id == 0) {
      HTTP.call(
        'GET',
        'http://localhost:3000/api/page/' + page.get(),
        {},
        (error, response) => {
          movies.set(JSON.parse(response.content).results)
        }
      );
    } else if (id == 1) {
      // Date : par ordre croissant
      filtreDateCroissant.set(true);
      filterType = 'doc';
    } else if (id == 2) {
      // Date : par ordre décroissant
      filtreDateDecroissant.set(true);
      filterType = 'dod';
    } else if (id == 3) {
      // Popularité : par ordre croissant
      filtrePopulariteCroissant.set(true);
      filterType = 'poc';
    } else if (id == 4) {
      // Popularité : par ordre décroissant
      filtrePopulariteDecroissant.set(true);
      filterType = 'pod';
    }
    HTTP.call(
      'GET',
      'http://localhost:3000/api/filtre/' + filterType + '/' + page.get(),
      {},
      (error, response) => {
        movies.set(JSON.parse(response.content).results);
      }
    );
  }
});