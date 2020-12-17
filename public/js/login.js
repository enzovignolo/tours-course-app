/* eslint-disabled */
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/log-in',
      data: { email, password }
    });

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
      url: '/api/v1/users/log-out'
    });

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
