import { PieChart } from "@mui/x-charts";
import { useRecoilValue } from "recoil";

import useWindowSize from "../hooks/useWindowSize";
import { donationRequestsData } from "../state/dashboardData";

export default function Chart() {
  const donationData = useRecoilValue(donationRequestsData);

  const chartPalette = ["#13647a", "#55d2e3", "#f3fbff", "#0d304b"];
  // custom hook koji vraca dimenzije prozora, potreban je zato sto je chart svg i legenda se moze sakriti jedino u js
  const { width } = useWindowSize();

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

  return (
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
  );
}
