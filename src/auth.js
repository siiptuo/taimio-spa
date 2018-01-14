import { postRequest } from './api';

let onChange = () => {};

export function setOnChange(func) {
  onChange = func;
}

export function login(username, password) {
  return postRequest('login', JSON.stringify({ username, password })).then(
    data => {
      localStorage.token = data.token;
      onChange(true);
    },
  );
}

export function logout() {
  delete localStorage.token;
  onChange(false);
}

export function getToken() {
  return localStorage.token;
}

export function isLoggedIn() {
  return !!localStorage.token;
}
