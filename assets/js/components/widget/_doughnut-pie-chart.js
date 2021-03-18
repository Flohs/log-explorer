import React, {Component} from 'react';
import Chart from 'admin-lte/plugins/chart.js/Chart';
import PropTypes from 'prop-types';
import {WIDGET_TYPE} from "../../utils";

export class DoughnutPieChart extends Component {
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    componentDidMount() {
        const {data, type = WIDGET_TYPE.doughnut, id = 'new'} = this.props;

        if (data && data.length > 0) {
            if (type === WIDGET_TYPE.doughnut || type === WIDGET_TYPE.pie) {
                const doughnutChartCanvas = $(`#chart${id}`).get(0).getContext('2d')
                const charData = {
                    labels: data.map(item => item.label),
                    datasets: [
                        {
                            data: data.map(item => item.value),
                            backgroundColor: data.map(() => this.getRandomColor()),
                        }
                    ]
                }
                const chartOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    legend: {
                        align: 'start',
                        position: 'right',
                    }
                }

                const chart = new Chart(doughnutChartCanvas, {
                    //'pie', 'doughnut'
                    type: WIDGET_TYPE.doughnut === type ? 'doughnut' : 'pie',
                    data: charData,
                    options: chartOptions
                })
            }
        }
    }

    render() {
        const {id = 'new', type, minHeight = '250', height = '250', className, data} = this.props;
        return (
            <>
                <div className="card-body pt-0 pb-2">
                    {data && data.length > 0 ?
                        <div className={`doughnut-pie-chart ${className || ''}`}>
                            {type ?
                                <canvas id={`chart${id}`}
                                        min-height={minHeight}
                                        height={height}
                                >
                                </canvas> :
                                <p>Widget not available</p>
                            }
                        </div> :
                        <p>No data</p>
                    }
                </div>

            </>
        )
            ;
    }
}

Chart.propTypes = {
    dataWidget: PropTypes.array,
    chart: PropTypes.string,
    minHeight: PropTypes.number,
    height: PropTypes.number,
};
