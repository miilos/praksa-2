import { atom } from "recoil";

const donationRequestsData = atom({
  key: "donationRequestsData",
  default: {
    totalReqs: 0,
    totalRaisedAmount: {
      "Autizmus alapitvany": 0,
      "Lampas '92 alapitvany": 0,
      "Noe allatotthon alapitvany": 0,
      "Szent Istvan Kiraly zenei alapitvany": 0,
    }, // ukupne donacije za svaku fondaciju
    allRequests: [], // niz objekata: { date: datum requesta, amounts: kolicine za svaku fondaciju }
  },
  effects: [
    ({ setSelf }) => {
      const localStorageKey = "donation-req-data";

      const storedVal = localStorage.getItem(localStorageKey);

      if (storedVal) setSelf(JSON.parse(storedVal));
    },
  ],
});

export { donationRequestsData };
