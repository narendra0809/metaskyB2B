import { Link } from 'react-router-dom'
import Footer from '../components/footer'

const RefundPolicy = () => {
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
      <div className="text-center p-4 h3">Refund Policy for K1Travels</div>
      <div className="sitemap-page mb-4 p-2 p-md-5 m-auto ">
        <p className="small">
          Thank you for choosing K1Travels for your travel arrangements. We
          understand that plans can change, and we have outlined our refund
          policy below to help you understand how cancellations are handled.
        </p>

        <h5>Cancellation and Refund Policy</h5>
        <p>
          If you need to cancel your booking for any reason, we offer a tiered
          refund based on the number of days remaining until your scheduled
          travel date. The refund percentages are applied to the total cost of
          your booking, excluding any service charges, as those are
          non-refundable.
        </p>

        <h5>Refund Tiers</h5>
        <ul>
          <li>
            – **14 days or above before the scheduled travel date**: You are
            eligible for a refund of 50% of the total cost of your booking.
          </li>
          <li>
            – **7 to 14 days before the scheduled travel date**: You are
            eligible for a refund of 30% of the total cost of your booking.
          </li>
          <li>
            – **0 to 7 days before the scheduled travel date**: No refund will
            be provided.
          </li>
        </ul>

        <h5>Service Charges</h5>
        <p>
          Service charges included in your booking are non-refundable under any
          circumstances. This is to cover the costs associated with the planning
          and booking of your travel arrangements.
        </p>

        <h5>Unused Services</h5>
        <p>
          No refund, either in part or in full, will be made for any part of the
          services included in your package that remain unused once the service
          has commenced. This policy applies regardless of any modifications to
          your travel plans, including early departures or non-participation in
          scheduled activities.
        </p>

        <h5>How to Request a Refund</h5>

        <p>
          To request a refund, please contact our customer service team with
          your booking details and reason for cancellation. Our team will review
          your request and process refunds according to the policy outlined
          above.
        </p>

        <h5>Processing Time</h5>
        <p>
          Please allow up to 10 business days for your refund to be processed.
          Refunds will be issued to the original method of payment unless
          otherwise arranged.
        </p>
        <h5>Changes to This Policy</h5>
        <p>
          K1Travels reserves the right to modify or amend this Refund Policy at
          any time. Any changes will be effective immediately upon posting to
          our website. Your continued use of our services following any changes
          means you accept those changes.
        </p>
      </div>

      <Footer />
    </>
  )
}

export default RefundPolicy
