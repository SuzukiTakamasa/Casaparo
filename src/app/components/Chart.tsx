import { Line } from 'react-chartjs-2'
import { Chart, registerables } from "chart.js"
import { Expenses } from "@utils/constants"

Chart.register(...registerables)

type LineChartComponentProps = {
    expenses: Expenses
}

const LineChartComponent = ({ expenses }: LineChartComponentProps) => {
    const labels: string[] = expenses.map( e => `${e.month}月`)
    const datasets: number[] = expenses.map( e => e.total_amount)
    const data = {
        labels: labels,
        datasets: [
            {
                label: "出費",
                data: datasets,
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)'
            }
        ]
    }

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }

    return <Line data={data} options={options} />
}

export default LineChartComponent