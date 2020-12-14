import axios from 'axios';
import { hideAlert, showAlert } from './alert';

//type is either password or data

export const updateUserSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/update-${
        type === 'password' ? 'password' : 'user'
      }`,
      data
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} UPDATED!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
