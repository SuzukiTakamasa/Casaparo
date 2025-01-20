import { Line, Pie } from 'react-chartjs-2'
import { Chart, registerables } from "chart.js"
import { HouseholdResponse, HouseholdMonthlySummaryResponse } from "@/app/utils/interfaces"

Chart.register(...registerables)

type LineChartComponentProps = {
    expenses: HouseholdMonthlySummaryResponse
}

type PieChartComponentProps = {
    households: HouseholdResponse
}

export const LineChartComponent = ({ expenses }: LineChartComponentProps) => {
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

export const PieChartComponent = ({ households }: PieChartComponentProps) => {
    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ]
      
    const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    ]

    const labels = households.map(h => h.name)
    const dataValues = households.map(h => h.amount)
    const month = households[0]?.month ?? 0

    const backgroundColorLastIndex = backgroundColors.length - 1
    const borderColorLastIndex = borderColors.length - 1

    const backgroundColor = households.map((_, i) => backgroundColors[i > backgroundColorLastIndex ? i - backgroundColorLastIndex : i])
    const borderColor = households.map((_, i) => borderColors[i > borderColorLastIndex ? i - borderColorLastIndex : i])

    const data = {
        labels: labels,
        datasets: [
            {
            label: `${month}月の家計簿`,
            data: dataValues,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
            },
        ],
    }

    return (
    <div className="w-64 h-64">
        <Pie data={data} />
    </div>
    )
}