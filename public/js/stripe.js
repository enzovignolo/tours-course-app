import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Hyb7iFdrvCnvRLyyVDq9vPEb0lAWVPlQqawqOiR7A1qmBgsPQL1XaLusJt2eeoHukExWOzH5k19CFM7GRnxI2rD0090rtDwUG'
);

export const bookTour = async (tourID) => {
  try {
    // Get session from the server
    const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);

    // Create checkout form + charge de creditcard
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
