import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateUserSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM ELEMENTS

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserBtn = document.querySelector('.form-user-data');
const updatePasswordBtn = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// MAP FUNCTIONS

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// LOGIN FUNCTIONS

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

//LOGOUT FUNCTIONS
if (logOutBtn) {
  logOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('logging out');
    logout();
  });
}

//UPDATE USER
if (updateUserBtn) {
  updateUserBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(); // THIS WILL CREATE A MULTIPART FORM DATA THAT WE NEED TO FILL UP WITH INFO BEFORE PASSING TO updateUserSettings
    form.append('name', document.getElementById('name').value); //grab name
    form.append('email', document.getElementById('email').value); // grab email
    form.append('photo', document.getElementById('photo').files[0]); // grab photo
    console.log(form);
    //const email = document.getElementById('email').value;
    //const name = document.getElementById('name').value;
    updateUserSettings(form, 'data');
  });
}

//UPDATE PASSWORD
if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'UPDATING ...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('password-confirm')
      .value;
    await updateUserSettings(
      { password, newPassword, passwordConfirmation },
      'password'
    );
    document.querySelector('.btn-save-password').textContent = 'SAVE PASSWORD';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourID = e.target.dataset.tourid;
    console.log(e.target);
    bookTour(tourID);
  });
}
