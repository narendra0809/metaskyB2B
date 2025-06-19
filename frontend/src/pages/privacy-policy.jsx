import { Link } from 'react-router-dom'
import Footer from '../components/footer'

const PrivacyPolicy = () => {
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

      <div className="text-center p-4 h3">Privacy Policy for K1Travels</div>
      <div className="sitemap-page mb-4 p-2 p-md-5 m-auto ">
        <h4>Introduction</h4>
        <p className="small">
          Welcome to K1Travels. We specialize in providing comprehensive B2B
          travel solutions for Thailand, including hotel bookings, sightseeing
          tours, and transfer services. This Privacy Policy outlines how we
          collect, use, protect, and share information gathered from our
          business clients and their representatives through our website and
          services.
        </p>

        <h4>Information Collection</h4>
        <p>
          We collect information that is necessary to book travel packages and
          facilitate seamless travel experiences for your clients. This
          includes:
        </p>
        <ul>
          <li>– Business contact information (name, email, phone number)</li>
          <li>– Payment and billing information</li>
          <li>– Travel preferences and requirements of your clients</li>
          <li>
            – Any other information provided through communication with our team
          </li>
        </ul>
        <p>
          Information is collected through our website forms, emails, and the
          use of our services.
        </p>

        <h4>Use of Information</h4>
        <p>The information we collect is used to:</p>
        <ul>
          <li>– Process and manage travel bookings</li>
          <li>– Communicate with you about bookings and inquiries</li>
          <li>– Improve our offerings and services</li>
          <li>– Comply with legal obligations</li>
        </ul>

        <h4>Information Sharing and Disclosure.</h4>
        <p>We share information with:</p>
        <ul>
          <li>
            – Hotels, tour operators, and transportation providers involved in
            fulfilling the travel services
          </li>
          <li>
            – Payment processors and financial institutions for billing purposes
          </li>
          <li>
            – Law enforcement or other government agencies if required by law
          </li>
        </ul>

        <p>
          We require all third parties to respect the security of your data and
          to treat it in accordance with the law.
        </p>

        {/*  */}

        <h4>Data Retention</h4>
        <p>
          We retain your information for as long as necessary to provide our
          services and as required by law.
        </p>
        <h4>Rights of Data Subjects</h4>
        <p>You have the right to:</p>
        <ul>
          <li>– Request access to your personal information</li>
          <li>– Request correction or deletion of your personal information</li>
          <li>
            – Object to processing and request restriction of processing your
            personal information
          </li>
          <li>
            – Withdraw consent at any time where we are relying on consent to
            process your personal information
          </li>
        </ul>

        <p>Please contact us if you wish to exercise these rights.</p>
        {/*  */}
        <h4>Use of Cookies</h4>
        <p>
          We use cookies and similar tracking technologies to track activity on
          our service and hold certain information. Cookies are files with a
          small amount of data which may include an anonymous unique identifier.
          You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent.
        </p>
        <h4>Changes to This Privacy Policy</h4>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page.
        </p>
      </div>
      <Footer />
    </>
  )
}

export default PrivacyPolicy
