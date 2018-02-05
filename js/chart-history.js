var historyLine = function () {

    var startTime,          // 历史数据起始时间
        endTime,            // 历史数据截止时间
        chartJson = {};     // 图表数据缓存

    var historyChart,       // eCharts对象
        historyAjax,        // 控制ajax请求，避免频繁请求导致混乱
        historyData = [];   // 图表数据

    var lable = "历史数据",          // 图表lable
        unit = "C",                 // Y轴单位
        lineColor = ['#007aff'];    // 曲线颜色

    var interval = 500 * 60 * 1000;     // X轴间隔

    function init() {

        initData();

        initHistoryCharts();

        showHistoryChart();
    }

    function initData() {
        var now = new Date();
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endTime = now;
        historyData = [];
    }

    function initHistoryCharts() {
        historyChart = echarts.init(document.getElementById("history_value_chart"));

    }

    function showHistoryChart() {

        historyChart.showLoading();

        // 执行当前ajax请求时，把上一个ajax请求终止。避免ajax请求频繁导致混乱
        if (historyAjax != null) {
            historyAjax.abort();
        }

        var url = "../data/chart-history.json";
        historyAjax = utils.get(url, function (res) {

            assembleChartData(res, startTime, endTime);

        }, function (error) {

        });
    }

    /**
     * 组装图表渲染数据
     *
     * @param res       图表源数据
     * @param startTime 起始时间
     * @param endTime   截止时间
     */
    function assembleChartData(res, startTime, endTime) {

        chartJson = JSON.parse(res).data.data;
        for (var n = 0; n < chartJson[0].data_list.length; n++) {
            // 点的X轴、Y轴数据
            var dot = [];
            dot.push(chartJson[0].data_list[n].time * 1000);
            dot.push(chartJson[0].data_list[n].value);
            historyData.push(dot);
        }
        interval = 500 * 60 * 1000;

        if (historyData.length == 0) {
            historyData.push([startTime.getTime(), '']);
            historyData.push([endTime.getTime(), '']);
            historyData.push([endTime.getTime(), 0]);
            chartOption.series[0].symbolSize = 0;
        } else if (historyData.length == 1) {
            historyData.unshift([startTime.getTime(), '']);
            historyData.push([endTime.getTime(), '']);
            chartOption.series[0].symbolSize = 6;
        } else {
            chartOption.series[0].symbolSize = 0;
        }
        interval = (historyData[historyData.length - 1][0] - historyData[0][0]) / 5;

        renderHistoryLine(historyData, interval);
    }

    /**
     * 渲染历史图表
     *
     * @param data      图表线条数据
     * @param xInterval X轴间距
     */
    function renderHistoryLine(data, xInterval) {
        chartOption.series[0].data = data;
        chartOption.xAxis.interval = xInterval;
        chartOption.xAxis.max = data[data.length - 1][0];
        chartOption.xAxis.min = data[0][0];
        historyChart.clear();
        historyChart.setOption(chartOption);
        historyChart.hideLoading();
    }

    var chartOption = {
        color: lineColor,
        tooltip: {
            // 坐标轴触发
            trigger: 'axis',
            position: function (pt, params, dom, rect, size) {
                var left = pt[0]
                if (left > size.viewSize[0] / 2) {
                    left = left - 120;
                }
                return [left, '10%'];
            },
            formatter: function (params) {
                if (!params[0].value) {
                    return "";
                }
                // return new Date(params[0].value[0]).Format("yyyy-MM-dd hh:mm:ss") + "<br /> 值: " + params[0].value[1] + '<span style="padding:0 2px">' + unit + '</span>';
                return new Date(params[0].value[0]) + "<br /> 值: " + params[0].value[1] + '<span style="padding:0 2px">' + unit + '</span>';
            }
        },
        grid: {
            left: '4%',
            right: '8%',
            containLabel: true
        },
        legend: {
            orient: 'horizontal',
            bottom: '15px',
            data: [lable],
            textStyle: {
                color: 'black'
            },
            formatter: function (name) {
                if (unit != "" && unit != undefined) {
                    return name + "(" + unit + ")";
                } else {
                    return name;
                }
            }
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            splitLine: {
                show: true
            },
            interval: 5000 * 60 * 1000,
            axisLabel: {
                textStyle: {
                    color: function (val) {
                        return '#666666';
                    }
                },
                formatter: function (value, index) {
                    // return new Date(value).format("hh:mm:ss");
                    return value;
                }
            },
            axisLine: {
                lineStyle: {
                    color: function () {
                        return '#666666';
                    }
                }
            },
            splitNumber: 5,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
                //value: new Date().Format("yyyy-MM-dd"),
                snap: true,
                lineStyle: {
                    color: '#004E52',
                    opacity: 0.5,
                    width: 2
                },
                label: {
                    show: true,
                    formatter: function (params) {
                        // var text = new Date(params.value).Format("hh:mm:ss");
                        // return text;
                        return new Date(params.value);
                    },
                    backgroundColor: '#004E52'
                },
                handle: {
                    show: true,
                    color: '#004E52'
                }
            }
        },
        yAxis: {
            axisTick: {show: false},
            type: 'value',
            name: unit,
            boundaryGap: [0, '10%'],
            axisLabel: {
                textStyle: {
                    color: function (val) {
                        return '#666666';
                    }
                }
            },
            axisLine: {
                lineStyle: {
                    color: function () {
                        return '#666666';
                    }
                }
            }
        },
        dataZoom: [{             //滑块样式固定，可通过height设置滑块大小
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100
        }/*,{
            start : 0,
            end : 100,
            backgroundColor : '#c7e8ff',
            fillerColor : '#4ea6ed',
            height : 16,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5, 3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2, 10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '100%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
            bottom : 35,
            textStyle : {
                color : '#333'
            },
            showDataShadow : false
        }*/],
        series: [
            {
                name: lable,
                type: 'line',
                smooth: true,
                sampling: 'average',
                data: historyData,
                symbolSize: 0/*,
                itemStyle : {
                    emphasis : {
                        borderWidth : 6
                    }
                }*/
            }
        ]
    };

    return {
        init: init
    }
}();

historyLine.init();