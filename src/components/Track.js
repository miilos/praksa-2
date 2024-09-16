import { useRecoilState, useRecoilValue } from "recoil";
import Modal from "./Modal";
import activeModalState from "../state/modalState";
import {
  donationsState,
  donationsSelector,
  donationCap,
} from "../state/donationState";

export default function Track({ foundationName, trackNo, modalText }) {
  const [donations, setDonations] = useRecoilState(donationsState);
  const [activeModal, setActiveModal] = useRecoilState(activeModalState);
  const donation = donations.at(trackNo);
  const totalDonationAmount = useRecoilValue(donationsSelector);

  function updateDonations(amount, trackNo) {
    if (totalDonationAmount - donation + amount <= donationCap)
      setDonations((currDonations) =>
        currDonations.map((curr, i) => (i === trackNo ? amount : curr))
      );
  }

  function showModal() {
    setActiveModal(trackNo);
  }

  function hideModal() {
    setActiveModal(-1);
  }

  return (
    <>
      <div className={`track track--${trackNo + 1}`}>
        <h2 className="heading-2 track__row-top">{donation} ft</h2>

        <input
          type="range"
          className="track__slider track__row-middle"
          min={0}
          max={donationCap}
          step={250000}
          value={donation}
          onChange={(e) => {
            updateDonations(Number(e.target.value), trackNo);
          }}
        />

        <div className="track__row-bottom">
          <div className="track__icons" onClick={showModal}>
            <img
              src="./img/info-icon.png"
              className="track__icons-icon"
              alt="Info icon"
            />
            <img
              src="./img/website-icon.png"
              className="track__icons-icon"
              alt="Website icon"
            />
          </div>

          <h3 className="heading-3">{foundationName}</h3>
        </div>
      </div>

      <Modal
        title={foundationName}
        text={modalText}
        cssClass={`modal-${activeModal === trackNo ? trackNo : ""}__show`}
        onClick={hideModal}
      />
    </>
  );
}
