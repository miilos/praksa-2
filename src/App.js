import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import Button from "./components/Button";
import { Track, activeModalState } from "./components/Track";
import Header from "./components/Header";
import { foundations } from "./foundations";
import Modal from "./components/Modal";

const donationsState = atom({
  key: "donationsState",
  default: new Array(4).fill(0),
});

const donationsSelector = selector({
  key: "donationsSelector",
  get: ({ get }) => {
    const donations = get(donationsState);
    return donations.reduce((acc, curr) => acc + curr, 0);
  },
});

const donationCap = 3000000;

function App() {
  const setDonations = useSetRecoilState(donationsState);
  const totalDonationsAmount = useRecoilValue(donationsSelector);
  const [activeModal, setActiveModal] = useRecoilState(activeModalState);

  function resetDonations() {
    setDonations((currDonations) => currDonations.map((curr) => 0));
  }

  function submitDonations() {
    resetDonations();
    setActiveModal(4);
  }

  function hideModal() {
    setActiveModal(-1);
  }

  return (
    <div className="App">
      <Header />

      <div className="tracks__container">
        {foundations.map((curr) => (
          <Track
            foundationName={curr.name}
            key={`Foundation ${curr.id}`}
            trackNo={curr.id}
            modalText={curr.text}
          />
        ))}
      </div>

      <div className="buttons">
        <Button cssClass={"btn btn-secondary"} onClick={resetDonations}>
          Visszaalitas
        </Button>
        <Button
          cssClass={`btn btn-primary ${
            totalDonationsAmount === donationCap ? "" : "btn-primary--disabled"
          }`}
          onClick={submitDonations}
          disabled={totalDonationsAmount < donationCap}
        >
          Elkuldom
        </Button>
      </div>

      <Modal
        title={"Donation successful!"}
        text={"Thank you!"}
        cssClass={`modal-${activeModal === 4 ? "4" : ""}__show`}
        onClick={hideModal}
      />
    </div>
  );
}

export { App, donationsState, donationsSelector, donationCap };
