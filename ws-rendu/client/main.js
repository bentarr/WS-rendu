import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

Template.home.onCreated(function homeOnCreated() {
  let ctrl = this;
  this.movies = new ReactiveVar()

  HTTP.call('GET', 'http://localhost:3000/api/discover/movies', {}, (error, response) => {
    ctrl.movies.set(JSON.parse(response.content).results)
  });
});

Template.home.helpers({
  movies() {
    return Template.instance().movies.get()
  }
});