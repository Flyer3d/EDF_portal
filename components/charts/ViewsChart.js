// ViewsChart.js
import {Line} from 'vue-chartjs';

const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem) {
                return tooltipItem.yLabel;
            }
        }
    }
};

export default {
    extends: Line,
    props: {

        data: {
            type: Array,
            required: true
        },
        labels: {
            type: Array,
            required: true
        },
        options: {
            type: Object
        }
    },
    watch: {
        data: {
            handler (value) {
                console.log('LineChart CHANGED!!!!!!!');

                console.dir(this.data);
                console.dir(this.labels);
                this.renderChart({
                        labels: this.labels,
                        datasets: [
                            {
                                backgroundColor: '#0f7acd',
                                data: this.data,
                                fill: false,
                                lineTension: 0,
                                borderColor: '#0f7acd'
                            }
                        ]
                    },
                    defaultOptions);
            },
            deep: true
        }
    },
    mounted () {
        console.log('LineChart mounted!!!');

        console.dir(this.data);
        console.dir(this.labels);
        // Overwriting base render method with actual data.
        this.renderChart({
                labels: this.labels,
                datasets: [
                    {
                        backgroundColor: '#0f7acd',
                        data: this.data,
                        fill: false,
                        lineTension: 0,
                        borderColor: '#0f7acd'
                    }
                ]
            },
            defaultOptions);
    }
};
