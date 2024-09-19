import { atom, selector } from "recoil";

const donationCap = 3000000;

// donacije za svake sanke
const donationsState = atom({
  key: "donationsState",
  default: {
    "Autizmus alapitvany": 0,
    "Lampas '92 alapitvany": 0,
    "Noe allatotthon alapitvany": 0,
    "Szent Istvan Kiraly zenei alapitvany": 0,
  },
});

// suma donacija
const donationsSelector = selector({
  key: "donationsSelector",
  get: ({ get }) => {
    const donations = get(donationsState);
    return Object.values(donations).reduce((acc, curr) => acc + curr, 0);
  },
});

export { donationsState, donationsSelector, donationCap };
