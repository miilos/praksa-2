import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Button from "../components/Button";
import Track from "../components/Track";
import Header from "../components/Header";
import { foundations } from "../utils/foundations";
import Modal from "../components/Modal";
import activeModalState from "../state/modalState";
import {
  donationsState,
  donationsSelector,
  donationCap,
} from "../state/donationState";
import { donationRequestsData } from "../state/dashboardData";

export default function Root() {
  const [donations, setDonations] = useRecoilState(donationsState);
  const totalDonationsAmount = useRecoilValue(donationsSelector);
  const setDonationRequestData = useSetRecoilState(donationRequestsData);
  const [activeModal, setActiveModal] = useRecoilState(activeModalState);

  const [timedOutIp, setTimedOutIp] = useState(null);

  useEffect(() => {
    if (timedOutIp !== null) {
      setTimeout(() => {
        setTimedOutIp(null);
      }, 30000);
    }
  }, [timedOutIp]);

  /* const [clientToken, setClientToken] = useState(function () {
    const token = JSON.parse(localStorage.getItem("client-token"));
    return token ? token : null;
  }); */

  // initialize gapi client to write to google sheets
  /* useEffect(function () {
    global google gapi
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: "API_KEY",
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
      });
    });
  }, []); */

  // dodaje nove donacije na ukupnu kolicinu za svaku fondaciju kada user klikne send btn
  function calcTotalDonations(oldTotal) {
    const newTotal = { ...donations };

    for (const [key, value] of Object.entries(donations)) {
      newTotal[key] += oldTotal[key];
    }

    return newTotal;
  }

  function resetDonations() {
    setDonations(() => {
      return {
        "Autizmus alapitvany": 0,
        "Lampas '92 alapitvany": 0,
        "Noe allatotthon alapitvany": 0,
        "Szent Istvan Kiraly zenei alapitvany": 0,
      };
    });
  }

  async function submitDonations() {
    const reqIp = await getIpAdress();

    /* if (reqIp === timedOutIp) {
      setActiveModal(7);
    } else { */
    // get access token to write data to google sheets
    /* const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "CLIENT_ID",
      scope: "https://www.googleapis.com/auth/spreadsheets",
      callback: async (res) => {
        console.log("tokenClient response: " + res);
      },
    });

    if (clientToken === null) {
      const newClientToken = gapi.client.getToken();

      tokenClient.requestAccessToken({ prompt: "consent" });

      setClientToken(() => {
        localStorage.setItem("client-token", JSON.stringify(newClientToken));
        return newClientToken;
      });
    } */

    //if (clientToken !== null) {

    // update data object for dashboard analytics page
    setDonationRequestData((curr) => {
      let newObj = JSON.parse(JSON.stringify(curr));

      newObj.totalReqs++;
      newObj.totalRaisedAmount = calcTotalDonations(curr.totalRaisedAmount);
      newObj.allRequests = [
        ...curr.allRequests,
        {
          date: new Date().toLocaleString(),
          amounts: { ...donations },
          ip: reqIp,
        },
      ];

      localStorage.setItem("donation-req-data", JSON.stringify(newObj));

      return newObj;
    });

    // update google sheet
    const reqTime = new Date().toLocaleTimeString();
    const body = [
      {
        ...donations,
        date: reqTime,
        ip: reqIp,
      },
    ];

    await fetch("https://sheetdb.io/api/v1/95ntroz7ueba2", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: body,
      }),
    });

    // build request and write data to sheets
    /* const reqIp = await getIpAdress();
      const reqTime = new Date().toLocaleTimeString();
      const body = {
        values: [[...donations, reqTime, reqIp]],
      };

      try {
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: "SPREADSHEET_ID",
          range: "A2:F2",
          resource: body,
          valueInputOption: "USER_ENTERED",
        });
      } catch (err) {
        console.log(err);
      } */

    // reset donation and modal state for this page
    setActiveModal(4);
    resetDonations();

    // time out ip
    setTimedOutIp(reqIp);
    //}
    //}
  }

  async function getIpAdress() {
    const res = await fetch("https://api.ipify.org/?format=json");
    const data = await res.json();
    return data.ip;
  }

  function hideModal() {
    setActiveModal(-1);
  }

  return (
    <div className="App">
      <div className="container">
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
              totalDonationsAmount === donationCap
                ? ""
                : "btn-primary--disabled"
            }`}
            onClick={submitDonations}
            disabled={totalDonationsAmount < donationCap}
          >
            Elkuldom
          </Button>
          <Button cssClass={"btn btn-primary"}>
            <Link to={"/dashboard"}>Dashboard</Link>
          </Button>
        </div>

        <Modal
          title={"Donation successful!"}
          text={"Thank you!"}
          cssClass={`modal-${activeModal === 4 ? "4" : ""}__show`}
          onClick={hideModal}
        />

        <Modal
          title={"Error!"}
          text={"You can only make 1 request every 30 seconds!"}
          cssClass={`modal-${activeModal === 7 ? "7" : ""}__show`}
          onClick={hideModal}
        />
      </div>
    </div>
  );
}
