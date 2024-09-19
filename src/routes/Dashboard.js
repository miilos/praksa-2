import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import { PieChart } from "@mui/x-charts";

import { donationRequestsData } from "../state/dashboardData";
import { foundations } from "../utils/foundations";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import activeModalState from "../state/modalState";
import useWindowSize from "../hooks/useWindowSize";

export default function Dashboard() {
  const donationData = useRecoilValue(donationRequestsData);

  const [page, setPage] = useState(1);
  const maxPage = donationData.totalReqs / 10 + 1;
  const pageStartIndex = (page - 1) * 10;

  const [sortDirection, setSortDirection] = useState("asc");
  const [dataSorted, setDataSorted] = useState([...donationData.allRequests]);

  const [activeModal, setActiveModal] = useRecoilState(activeModalState);

  const chartPalette = ["#13647a", "#55d2e3", "#f3fbff", "#0d304b"];

  // custom hook koji vraca dimenzije prozora, potreban je zato sto je chart svg i legenda se moze sakriti jedino u js
  const { width } = useWindowSize();

  // pagination u tabeli
  function goToNextPage() {
    setPage((curr) => curr + 1);
  }

  function goToPrevPage() {
    setPage((curr) => curr - 1);
  }

  // sortiranje tabele
  function sortDataAsc() {
    setDataSorted((currData) => {
      return currData.slice().sort((a, b) => {
        const aDate = Date.parse(a.date);
        const bDate = Date.parse(b.date);

        return aDate - bDate;
      });
    });

    setSortDirection("desc");
  }

  function sortDataDesc() {
    setDataSorted((currData) => {
      return currData.slice().sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);

        return bDate - aDate;
      });
    });

    setSortDirection("asc");
  }

  // racunanje procenata za pie chart
  function calculatePercentages() {
    const percentages = [];
    const totalAmount = Object.values(donationData.totalRaisedAmount).reduce(
      (acc, curr) => acc + curr,
      0
    );

    for (const [key, value] of Object.entries(donationData.totalRaisedAmount)) {
      const pct = (value / totalAmount) * 100;

      // chart komponenta koristi ova property imena
      percentages.push({
        label: key,
        value: pct,
      });
    }

    return percentages;
  }

  async function deleteFromSheets(input) {
    const [column, value] = input.split(",").map((curr) => curr.trim());

    if (column && value) {
      try {
        await fetch(
          `https://sheetdb.io/api/v1/95ntroz7ueba2/${column}/${value}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        setActiveModal(5);
      } catch (err) {
        console.log(err);
      }
    } else {
      setActiveModal(6);
    }
  }

  function hideModal() {
    setActiveModal(-1);
  }

  return (
    <div className="dashboard">
      <div className="back-btn">
        <Link to={"/"}>
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      <div className="container dashboard__container">
        <h1 className="heading-1">Dashboard</h1>

        <div className="dashboard__general-info">
          <div className="dashboard__general-info-item">
            <h3 className="heading-3">Total requests:</h3>
            <p className="dashboard__general-info-item-p">
              {donationData.totalReqs}
            </p>
          </div>

          <div>
            <h3 className="heading-3">Total amounts raised: </h3>
            <table className="dashboard__general-info-donation-table">
              <tbody>
                <tr>
                  {foundations.map((curr, i) => (
                    <th key={`th-${i}`}>{curr.name}</th>
                  ))}
                </tr>
                <tr>
                  {foundations.map((curr, i) => (
                    <td key={`td-${i}`}>
                      {donationData.totalRaisedAmount[curr.name]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dashboard__general-info-item">
            <h3 className="heading-3">Last request:</h3>
            <p className="dashboard__general-info-item-p">
              {donationData.allRequests.at(-1)?.date}
            </p>
          </div>

          <div>
            <h3 className="heading-3">Previous requests: </h3>
            <table className="dashboard__general-info-donation-table">
              <tbody>
                <tr>
                  {foundations.map((curr, i) => (
                    <th key={`th-${i}`}>{curr.name}</th>
                  ))}
                </tr>

                {dataSorted
                  .slice(pageStartIndex, pageStartIndex + 10)
                  .map((curr, i) => (
                    <tr key={`tr-${i}`}>
                      {curr.amounts.map((amm, i) => (
                        <td key={`td-${i}`}>{amm}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="pagination-controls">
              <div className="pagination-controls__btn" onClick={goToPrevPage}>
                {page > 1 && (
                  <>
                    <span className="material-symbols-outlined">
                      arrow_back_ios
                    </span>
                    <span className="pagination-controls__btn-text">
                      Previous page
                    </span>
                  </>
                )}
              </div>
              <div className="pagination-controls__btn" onClick={goToNextPage}>
                {page < maxPage && (
                  <>
                    <span className="pagination-controls__btn-text">
                      Next page
                    </span>
                    <span className="material-symbols-outlined">
                      arrow_forward_ios
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="sort-btn__container">
              <Button
                cssClass={"btn btn-primary btn-sort"}
                onClick={sortDirection === "asc" ? sortDataAsc : sortDataDesc}
              >{`Sort ${sortDirection}`}</Button>
            </div>
          </div>

          <div className="chart-container">
            <PieChart
              colors={chartPalette}
              series={[
                {
                  data: calculatePercentages(),
                },
              ]}
              height={200}
              slotProps={{
                legend: {
                  hidden: width < 600,
                  position: {
                    vertical: "middle",
                    horizontal: "right",
                  },
                },
              }}
            />
          </div>

          <div className="delete-input-container">
            <h3 className="heading-3">Delete from Sheets: </h3>

            <div className="delete-input">
              <Input
                placeholder={"Enter column name and value..."}
                btnText={"Delete"}
                onClick={deleteFromSheets}
              />
            </div>
          </div>
        </div>
      </div>

      {/* deleting from sheets success modal */}
      <Modal
        title={"Success!"}
        text={"Deleted from sheets"}
        cssClass={`modal-${activeModal === 5 ? "5" : ""}__show`}
        onClick={hideModal}
      />

      {/* deleting from sheets error modal */}
      <Modal
        title={"Error!"}
        text={"Input must be comma seperated list: columnName, value"}
        cssClass={`modal-${activeModal === 6 ? "6" : ""}__show`}
        onClick={hideModal}
      />
    </div>
  );
}
