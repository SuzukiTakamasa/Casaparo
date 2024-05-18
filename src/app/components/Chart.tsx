import { Line } from 'react-chartjs-2'
import { Chart, registerables } from "chart.js"
import { Expenses } from "@utils/constants"

Chart.register(...registerables)

type LineChartComponentProps = {
    expenses: Expenses
}

const LineChartComponent = ({ expenses }: LineChartComponentProps) => {
    const labels: string[] = expenses.map( e => `${e.month}月`)
    const datasets_total_amount: number[] = expenses.map( e => e.total_amount)
    const datasets_billing_amount: number[] = expenses.map( e => e.billing_amount)
    const data = {
        labels: labels,
        datasets: [
            {
                label: "合計金額",
                data: datasets_total_amount,
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)'
            },
            {
                label: "請求金額",
                data: datasets_billing_amount,
                fill: false,
                backgroundColor: 'rgb(132, 99, 255)',
                borderColor: 'rgba(132, 99, 255, 0.2)'
            }
        ]
    }

    const options = {
        scales: {
            x: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)'
                  },
                ticks: {
                    color: 'white'
                }
            },
            y: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)'
                  },
                beginAtZero: true,
                ticks: {
                    color: 'white'
                }
            }
        },
        plugins: {
            legend: {
              display: true,
              labels: {
                color: '#ffffff'
              }
            }
          }
    }

    return <Line data={data} options={options} />
}

export default LineChartComponent