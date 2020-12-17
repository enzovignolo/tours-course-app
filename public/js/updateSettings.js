import axios from 'axios';
import { hideAlert, showAlert } from './alert';

//type is either password or data

export const updateUserSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/update-${type === 'password' ? 'password' : 'user'}`,
      data
    });
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
