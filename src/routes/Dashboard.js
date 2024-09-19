import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Link } from "react-router-dom";

import { donationRequestsData } from "../state/dashboardData";
import { foundations } from "../utils/foundations";
import Button from "../components/Button";
import Modal from "../components/Modal";
import activeModalState from "../state/modalState";
import Chart from "../components/Chart";

export default function Dashboard() {
  const donationData = useRecoilValue(donationRequestsData);

  const [page, setPage] = useState(1);
  const maxPage = donationData.totalReqs / 10 + 1;
  const pageStartIndex = (page - 1) * 10;

  const [sortDirection, setSortDirection] = useState("asc");
  const [dataSorted, setDataSorted] = useState([...donationData.allRequests]);

  const [activeModal, setActiveModal] = useRecoilState(activeModalState);

  function getTableHeaders() {
    const headers = [];

    foundations.forEach((curr) => headers.push(curr.name));
    headers.push("date", "ip", " ");

    return headers;
  }

  function handleDeleteFromSheets(dateVal) {
    const deleteVal = dateVal.split(",").at(1).trim();

    deleteFromSheets(deleteVal);
  }

  // funkcija koja primi objekat u kom su svi podaci o requestu i ubaci ih u niz koji se moze renderovati
  function getAllProps(obj) {
    const allVals = [];

    // donacije svakoj fondaciji
    foundations.forEach((curr) => allVals.push(obj.amounts[curr.name]));

    // datum i ip requesta (stariji objekti u nizu nemaju ip)
    allVals.push(obj.date, obj?.ip);

    // button za brisanje iz sheetsa
    allVals.push(
      <span
        className="delete_btn"
        onClick={() => handleDeleteFromSheets(obj.date)}
      >
        Delete from Sheets
      </span>
    );

    return allVals;
  }

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

  async function deleteFromSheets(dateVal) {
    try {
      const res = await fetch(
        `https://sheetdb.io/api/v1/95ntroz7ueba2/date/${dateVal}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.error) throw new Error("already deleted");
      else setActiveModal(5);
    } catch (err) {
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
                  {getTableHeaders().map((curr, i) => (
                    <th key={`th-${i}`}>{curr}</th>
                  ))}
                </tr>

                {dataSorted
                  .slice(pageStartIndex, pageStartIndex + 10)
                  .map((curr, i) => (
                    <tr key={`tr-${i}`}>
                      {getAllProps(curr).map((amm, i) => (
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

          <Chart />
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
        text={"Already deleted from Sheets"}
        cssClass={`modal-${activeModal === 6 ? "6" : ""}__show`}
        onClick={hideModal}
      />
    </div>
  );
}
