import { atom } from "recoil";

const activeModalState = atom({
  key: "activeModalState",
  default: -1,
});

export default activeModalState;
