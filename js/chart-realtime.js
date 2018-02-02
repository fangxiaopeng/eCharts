var realTime = function () {

    var realChart,      // eCharts对象
        intervaltoke;   // 刷新曲线定时器

    var yData = [],     // Y轴数据
        xAxisData = []; // X轴数据

    var lable = "实时数据",          // 图表lable
        unit = "C",                 // Y轴单位
        lineColor = ['#007aff'];    // 曲线颜色

    function init() {
        console.log("real time page init!");

        initData();

        initRealChart();

        showRealChart();
    }

    function initData() {
        console.log("initData");

        xAxisData = [];
        yData = [];
        for (var i = 0; i <= 60; i++) {
            xAxisData.push(-i + 60);
            yData.push("");
        }
        yData[60] = 0;
    }

    function initRealChart() {
        console.log("initRealChart");

        // 初始化eCharts对象
        realChart = echarts.init(document.getElementById("running_value_chart"));
        option.series[0].series = lable;
        // 设置曲线颜色
        option.color = lineColor;
        // 设置Y轴数据
        option.series[0].data = yData;
        // 设置X轴数据
        option.xAxis.data = xAxisData;
        // 设置无起始值
        yData[60] = "";
    }

    function showRealChart() {
        console.log("showRealChart");

        updateLine();

        // 定时刷新数据
        intervaltoke = setInterval(function () {
            updateLine();
        }, 1000);
    }

    function updateLine() {
        console.log("updateLine");

        var url = "../data/chart-realtime.json";
        utils.get(url, function (res) {
            var data = JSON.parse(res).data;
            if (data != null && data != undefined) {
                var val = parseFloat(data.real_value);
                if (!isNaN(val)) {
                    //如果有值更新
                    yData.shift();
                    // 使用接口数据
                    // yData.push(val);
                    // 使用模拟数据
                    yData.push(Math.random()*100 + 1);
                    option.series[0].data = yData;
                    realChart.setOption(option);
                }
            }
        }, function (error) {

        });
    }

    var option = {
        color: ['#007aff'],
        tooltip: {
            // 坐标轴触发
            trigger: 'axis',
            position: function (pt, params, dom, rect, size) {
                var left = pt[0]
                if (left > size.viewSize[0] / 2) {
                    left = left - 70;
                }
                return [left, '10%'];
            },
            formatter: function (params) {
                if (!params[0].value) {
                    return "";
                }
                return "<span>" + params[0].value + '</span><span style="padding:0 2px">' + unit + '</span>';
            }
        },
        grid: {
            left: '2%',
            right: '5%',
            containLabel: true
        },
        xAxis: {
            //type : 'category',
            boundaryGap: false,
            data: xAxisData,
            splitLine: {
                show: true
            },
            axisLabel: {
                textStyle: {
                    color: function (val) {
                        return '#666666';
                    }
                },
                interval: function (i, v) {
                    if (i % 10 === 0) {
                        return true;
                    } else return false;
                },
                formatter: function (v, i) {
                    var text = v;
                    if (v == 0 || v == 60) {
                        return text + 's';
                    } else {
                        return ''
                    }
                }
            },
            axisLine: {
                lineStyle: {
                    color: function (val) {
                        return '#666666';
                    }
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
                    color: function (val) {
                        return '#666666';
                    }
                }
            }
        },
        series: [
            {
                name: lable,
                type: 'line',
                smooth: true,
                sampling: 'average',
                data: yData,
                symbolSize: 0
                /*itemStyle : {
                    emphasis : {
                        borderWidth : 6
                    }
                }*/
            }
        ]
    };

    function destroy() {
        yData = [];
        realChart.clear();
        realChart = null;
        intervaltoke != null && clearInterval(intervaltoke);
    }

    return {
        init: init
    }
}();

realTime.init();