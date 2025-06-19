import { Link, useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'

const WhatsappCustomer = () => {
  const { data, loading } = useFetch('/data/dummydata.json')
  const { id } = useParams()

  // const item = data.filter((item) => item.ID == id)

  if (loading) {
    return (
      <>
        <div className="title">Whatsapp Customer</div>
        <section className="page-section">
          <div className="px-2 py-2 px-md-4 mb-4">Loading...</div>
        </section>
      </>
    )
  }
  return (
    <>
      <div className="title">Whatsapp Customer</div>
      <section className="page-section">
        <div className="px-2 py-2 px-md-4 mb-4 col-12 col-lg-11">
          <div className="row mb-3">
            <div className="col-12 col-sm-3 col-md-4 col-lg-3">
              <p className="fw-bold mb-0">Customer Name:</p>
            </div>
            <div className="col-12 col-sm-9 col-md-8 col-lg-9">Some Name</div>
          </div>
          <div className="row mb-3">
            <div className="col-12 col-sm-3 col-md-4 col-lg-3">
              <p className="fw-bold mb-0">Phone Number:</p>
            </div>
            <div className="col-12 col-sm-9 col-md-8 col-lg-9">9876543210</div>
          </div>
          <div className="row mb-3">
            <div className="col-12 col-sm-3 col-md-4 col-lg-3">
              <p className="fw-bold mb-0">Ref #:</p>
            </div>
            <div className="col-12 col-sm-9 col-md-8 col-lg-9">K154036</div>
          </div>
          <div className="row mb-3">
            <div className="col-12 col-sm-3 col-md-4 col-lg-3">
              <p className="fw-bold mb-0">Message:</p>
            </div>
            <div className="col-12 col-sm-9 col-md-8 col-lg-9">
              <textarea className="form-control mt-2" rows="15">
                *Your Thailand Package* Ref. No.: K154036 Dear Rohit Singh, as
                per our discussion, please find the package details below.
                *Travel Date: 04 Mar 2025* Total Person (2 Adult + 1 Child)
                *Includes* ✨4 island Tour on Speed Boat with lunch including
                National park fee Sic (2 Adult, 1 Child) ✨Phuket City Tour +
                Big Buddha Sic (2 Adult, 1 Child) ✨Phi Phi island Tour on Speed
                Boat with Lunch including National Park Fee Sic (2 Adult, 1
                Child) ✨Tiger Kingdom Medium Size + Dolphin Show Regular Seat
                Tickets (Phuket) (2 Adult, 1 Child) ✨Chao Phraya Dinner Cruise
                Sic (Bangkok) (2 Adult, 1 Child) ✨Dream world Super Visa + Snow
                Town Tickets (Bangkok) (2 Adult, 1 Child) *Transfer* ✨01 Way
                Taxi From Phuket Airport To Krabi Hotel ✨01 Way Taxi From Krabi
                Hotel To Phuket Hotel ✨02 Way Taxi For Tiger Kingdom + Dolphin
                Show ✨01 Way Taxi From Phuket Hotel to Phuket Airport ✨02 Way
                Taxi For Dream World + Snow Park (Bangkok) ✨01 Way Taxi From
                Bangkok Hotel to BKK Airport ✨01 Way Taxi From DMK Airport to
                Bangkok Hotel *All transfers on private basis and sightseeing on
                SIC basis.* 😍 Package cost 27,630/- INR per adult, 15,860/- INR
                per child 😍 *Total Package cost 71,120/- INR Excluding GST*
                *Note:-* *Kindly check the final price at the time of payment.
                Final price may change due to conversion rate.* *All Hotels are
                Subject to Availability*
              </textarea>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-12 col-sm-3 col-md-4 col-lg-3"></div>
            <div className="col-12 col-sm-9 col-md-8 col-lg-9">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <Link className="btn btn-sm btn-primary">
                  Open Whatsapp With Message
                </Link>
                <Link className="btn btn-sm btn-primary">Edit Information</Link>
                <Link className="btn btn-sm btn-primary">Make Payment</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
export default WhatsappCustomer
