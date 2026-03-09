"use strict";

const USERS_KEY = 'emarket_users';

function getUsers() {
  try {
    var raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const wrapper = document.querySelector('.wrapper');
const signUpLink = document.querySelector('.signUp-link');
const signInLink = document.querySelector('.signIn-link');

if (signUpLink) {
  signUpLink.addEventListener('click', function (e) {
    e.preventDefault();
    wrapper.classList.add('animate-signIn');
    wrapper.classList.remove('animate-signUp');
  });
}

if (signInLink) {
  signInLink.addEventListener('click', function (e) {
    e.preventDefault();
    wrapper.classList.add('animate-signUp');
    wrapper.classList.remove('animate-signIn');
  });
}

var loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = (document.getElementById('login-username') || {}).value.trim();
    var password = (document.getElementById('login-password') || {}).value;
    var users = getUsers();
    var found = users.find(function (u) {
      return (u.username || '').toLowerCase() === username.toLowerCase() && u.password === password;
    });
    if (found) {
      alert('Welcome back to Emarket!');
      window.location.href = 'index.html';
    } else {
      alert('Invalid username or password.');
    }
  });
}

var signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = (document.getElementById('signup-username') || {}).value.trim();
    var email = (document.getElementById('signup-email') || {}).value.trim();
    var password = (document.getElementById('signup-password') || {}).value;
    if (!username) {
      alert('Please enter a username.');
      return;
    }
    var users = getUsers();
    var exists = users.some(function (u) {
      return (u.username || '').toLowerCase() === username.toLowerCase();
    });
    if (exists) {
      alert('Username already exists. Please log in or choose another.');
      return;
    }
    users.push({ username: username, email: email, password: password });
    saveUsers(users);
    alert('You are now a member of Emarket!');
    wrapper.classList.add('animate-signUp');
    wrapper.classList.remove('animate-signIn');
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
  });
}
