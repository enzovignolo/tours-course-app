/* eslint-disabled */
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/log-in',
      data: { email, password }
    });

    console.log('here');
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Succesfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/log-out'
    });

    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Succesfully logged OUT');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'ERROR LOGGIN OUT');
  }
};
