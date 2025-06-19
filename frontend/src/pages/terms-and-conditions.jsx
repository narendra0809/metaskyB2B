import { Link } from 'react-router-dom'
import Footer from '../components/footer'

const TermsAndConditions = () => {
  return (
    <>
      <div className="text-center mt-4">
        <Link to="/">
          <img
            src="https://thailand.k1travels.com/admin/images/l1.png"
            alt="B2B"
            className="detail-logo"
          />
        </Link>
      </div>
      <div className="text-center p-4 h3">
        Terms and Conditions for K1Travels
      </div>
      <div className="sitemap-page mb-4 p-2 p-md-5 m-auto ">
        <p className="small">
          Welcome to K1Travels. These Terms and Conditions govern your use of
          our services and the booking of travel packages through K1Travels. By
          initiating a booking with us, you agree to be bound by these Terms and
          Conditions.
        </p>

        <h5>1. Booking and Payment</h5>
        <ol>
          <li>
            <h6>Initial Deposit</h6>
          </li>
          <p>
            A non-refundable deposit of 50% of the total cost of the travel
            package is required to initiate a booking. This deposit is used to
            secure reservations for accommodations, tours, and other services
            included in the travel package.
          </p>

          <li>
            <h5>Confirmation of Booking</h5>
          </li>
          <p>
            To confirm a booking within 0 to 7 days of the scheduled departure,
            100% of the total cost is required. This payment must be made in
            full to finalize the booking and ensure all travel arrangements are
            confirmed.
          </p>

          <li>
            <h5>Payment Methods</h5>
          </li>
        </ol>
        <p>
          Payments can be made via UPI, bank transfer, credit/debit card.
          Detailed instructions for payment will be provided at the time of
          booking.
        </p>

        <h5>2. Documentation</h5>
        <p>
          Photocopies of the passport (specifically the First & Address Page
          copy) are mandatory for all destinations. This documentation is
          required for booking flights, hotels, and other travel-related
          services. Failure to provide the necessary documentation in a timely
          manner may result in delays or cancellations of your bookings.
        </p>

        <h5>3. Cancellation Policy</h5>
        <p>
          Please refer to our Refund Policy for details on cancellations and
          refunds. Note that the initial deposit is non-refundable, and specific
          cancellation charges apply as per the policy outlined.
        </p>

        <h5>4. Liability and Insurance</h5>
        <p>
          K1Travels acts as an intermediary between you and various travel
          service providers. We are not liable for the acts, errors, omissions,
          representations, warranties, breaches, or negligence of any travel
          service providers or for any personal injuries, death, property
          damage, or other damages or expenses resulting therefrom.
        </p>
        <p>
          We recommend that you purchase comprehensive travel insurance to cover
          any unforeseen circumstances that may occur during your trip.
        </p>

        <h5>5. Changes to Terms and Conditions</h5>
        <p>
          K1Travels reserves the right to update or modify these Terms and
          Conditions at any time without prior notice. Your continued use of our
          services following any such changes constitutes your agreement to
          follow and be bound by the Terms and Conditions as updated.
        </p>

        <h5>6. Governing Law</h5>
        <p>
          These Terms and Conditions shall be governed by and construed in
          accordance with the laws of Haryana, India. Any disputes arising under
          or in connection with these Terms and Conditions shall be subject to
          the exclusive jurisdiction of the courts of Haryana, India.
        </p>
        <div className="fw-bold">
          Thank you for choosing K1Travels for your travel needs.
        </div>
      </div>

      <Footer />
    </>
  )
}

export default TermsAndConditions
