import { postRequest } from './api';

let onChange = () => {};

export function setOnChange(func) {
  onChange = func;
}

export function login(username, password) {
  return postRequest('login', JSON.stringify({ username, password })).then(
    data => {
      localStorage.taimioToken = data.token;
      onChange(true);
    },
  );
}

export function logout() {
  delete localStorage.taimioToken;
  onChange(false);
}

export function getToken() {
  return localStorage.taimioToken;
}

export function isLoggedIn() {
  return !!localStorage.taimioToken;
}
