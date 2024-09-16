import { atom, selector } from "recoil";

const donationCap = 3000000;

// donacije za svake sanke
const donationsState = atom({
  key: "donationsState",
  default: new Array(4).fill(0),
});

// suma donacija
const donationsSelector = selector({
  key: "donationsSelector",
  get: ({ get }) => {
    const donations = get(donationsState);
    return donations.reduce((acc, curr) => acc + curr, 0);
  },
});

export { donationsState, donationsSelector, donationCap };
