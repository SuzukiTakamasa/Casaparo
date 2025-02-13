import { Line, Pie } from 'react-chartjs-2'
import { Chart, registerables } from "chart.js"
import { HouseholdMonthlySummaryResponse } from "@/app/utils/interfaces"

Chart.register(...registerables)

type LineChartComponentProps = {
    expenses: HouseholdMonthlySummaryResponse
}

type PieChartComponentProps = {
    expenses: HouseholdMonthlySummaryResponse
    month: number
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

export const PieChartComponent = ({ expenses, month }: PieChartComponentProps) => {
    const backgroundColors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
    ]
      
    const borderColors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
    ]

    const labels = expenses.map(h => h.detail_name)
    const dataValues = expenses.map(h => h.detail_amount)

    const backgroundColorLastIndex = backgroundColors.length - 1
    const borderColorLastIndex = borderColors.length - 1

    const specifyColor = (eachColorlastIndex: number, dataIndex: number) => {
        return (dataIndex > eachColorlastIndex ?
                dataIndex - eachColorlastIndex * Math.floor(dataIndex / 6) :
                dataIndex)
    }

    const backgroundColor = expenses.map((_, i) => backgroundColors[specifyColor(backgroundColorLastIndex, i)])
    const borderColor = expenses.map((_, i) => borderColors[specifyColor(borderColorLastIndex, i)])

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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#ffffff'
                }
            }
        },
        layout: {
            padding: {
                right: 20
            }
        }
    }

    return (
        <div className="w-full max-w-md mx-auto aspect-square">
            {expenses.length !== 0 ?
            <Pie data={data} options={options}/> :
            <div className="flex justify-center text-gray-500 mt-4">表示データなし</div>}
        </div>
    )
}