import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

var movies = new ReactiveVar();
var genres = new ReactiveVar();
var page = new ReactiveVar(1);
var idGenreActif = new ReactiveVar(0);
var filtrePopulariteDecroissant = new ReactiveVar(false);
var filtrePopulariteCroissant = new ReactiveVar(false);
var filtreGenre = new ReactiveVar(false);

// [Template] Films

Template.films.onCreated(function filmsOnCreated() {
  recupererTousLesFilms();
  recupererTousLesGenres();
});

Template.films.helpers({
  movies() { return movies.get(); }
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
        filmsAvecFiltreEtPage(filterType);
      } else if (filtrePopulariteDecroissant.get()) {
        filterType = 'pod';
        filmsAvecFiltreEtPage(filterType);
      } else if (filtreGenre.get()) {
        filmsAvecGenreEtPage(idGenreActif.get());
      } else {
        recupererTousLesFilms();
      }
    }
  },
  'click #pageSuivante'() {
    if (page.get() < 500) {
      page.set(page.get() + 1);
      let filterType = '';
      if (filtrePopulariteCroissant.get()) {
        filterType = 'poc';
        filmsAvecFiltreEtPage(filterType);
      } else if (filtrePopulariteDecroissant.get()) {
        filterType = 'pod';
        filmsAvecFiltreEtPage(filterType);
      } else if (filtreGenre.get()) {
        filmsAvecGenreEtPage(idGenreActif.get());
      } else {
        recupererTousLesFilms();
      }
    }
  },

});

// [Template] Filtres

Template.filterselect.helpers({
  genres() { return genres.get(); }
})

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
  },
  'change #genres'(event) {
    idGenreActif.set(event.target.value);
    if (idGenreActif.get() == 0) {
      filtreGenre.set(false);
      recupererTousLesFilms();
    } else {
      filtreGenre.set(true);
      filmsAvecGenreEtPage(idGenreActif.get());
    }
  }
})

// Fonctions

function recupererTousLesFilms() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/movies/' + page.get(),
    {},
    (error, response) => { movies.set(JSON.parse(response.content).results); }
  );
}

function recupererTousLesGenres() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/genres',
    {},
    (error, response) => { genres.set(JSON.parse(response.content).genres); }
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
  );
}

function filmsAvecFiltreEtPage(filtreActif) {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/films/filtre/' + filtreActif + '/' + page.get(),
    {},
    (error, response) => { movies.set(JSON.parse(response.content).results); }
  );
}

function filmsAvecGenreEtPage(idGenreActif) {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/films/genre/' + idGenreActif + '/' + page.get(),
    {},
    (error, response) => { movies.set(JSON.parse(response.content).results); }
  );
}