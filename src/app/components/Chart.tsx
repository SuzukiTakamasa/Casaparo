import {Line} from 'react-chartjs-2'

const LineChartComponent = ({data, options}: any) => {
    return <Line data={data} options={options} />
}

export default LineChartComponent