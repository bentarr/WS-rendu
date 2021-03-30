import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

var movies = new ReactiveVar();
var page = new ReactiveVar(1);
var filtrePopulariteDecroissant = new ReactiveVar(false);
var filtrePopulariteCroissant = new ReactiveVar(false);

// [Template] Films

Template.films.onCreated(function filmsOnCreated() {
  recupererTousLesFilms();
});

Template.films.helpers({
  movies() {
    return movies.get();
  }
});

Template.films.events({
  'click button'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie);
  }
});

// [Template] Pagination

Template.pagination.helpers({
  page() { return page.get(); }
});

Template.pagination.events({
  'click #pagePrecedente'() {
    if (page.get() > 1) {
      page.set(page.get() - 1);
      let filterType = '';
      if (filtrePopulariteCroissant.get()) {
        filterType = 'poc';
      } else if (filtrePopulariteDecroissant.get()) {
        filterType = 'pod';
      } else {
        recupererTousLesFilms();
        return;
      }
      filmsAvecFiltreEtPage(filterType);
    }
  },
  'click #pageSuivante'() {
    if (page.get() < 500) {
      page.set(page.get() + 1);
      let filterType = '';
      if (filtrePopulariteCroissant.get()) {
        filterType = 'poc';
      } else if (filtrePopulariteDecroissant.get()) {
        filterType = 'pod';
      } else {
        recupererTousLesFilms();
        return;
      }
      filmsAvecFiltreEtPage(filterType);
    }
  },

});

function recupererTousLesFilms() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/page/' + page.get(),
    {},
    (error, response) => { movies.set(JSON.parse(response.content).results); }
  );
}

function filmsAvecFiltreEtPage(filtreActif) {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/filtre/' + filtreActif + '/' + page.get(),
    {},
    (error, response) => { movies.set(JSON.parse(response.content).results); }
    );
  }

function updateLikeMovie(idMovie) {
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

Template.filterselect.events({
  'change #filter'(event) {
    let id = event.target.value;
    let filterType = '';
    filtrePopulariteCroissant.set(false);
    filtrePopulariteDecroissant.set(false);
    if (id == 0) {
      recupererTousLesFilms();
      return;
    } else if (id == 3) {
      // Popularité : par ordre croissant
      filtrePopulariteCroissant.set(true);
      filterType = 'poc';
    } else if (id == 4) {
      // Popularité : par ordre décroissant
      filtrePopulariteDecroissant.set(true);
      filterType = 'pod';
    }
    filmsAvecFiltreEtPage(filterType);
  }
})