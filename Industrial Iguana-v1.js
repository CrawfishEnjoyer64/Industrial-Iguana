// ==UserScript==
// @name         Industrial Iguana
// @namespace    http://tampermonkey.net/
// @version      2026-07-13
// @description  A new and improved version of my 2024 program "Economic Iguana" with more functionality
// @author       Mechanocracy
// @match        https://*.nationstates.net/nation=*/detail=economy
// @icon         data:image/gif;base64,R0lGODlhFAAUAPcAAAAAAAAAMwAAZgAAmQAAzAAA/wArAAArMwArZgArmQArzAAr/wBVAABVMwBVZgBVmQBVzABV/wCAAACAMwCAZgCAmQCAzACA/wCqAACqMwCqZgCqmQCqzACq/wDVAADVMwDVZgDVmQDVzADV/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMrADMrMzMrZjMrmTMrzDMr/zNVADNVMzNVZjNVmTNVzDNV/zOAADOAMzOAZjOAmTOAzDOA/zOqADOqMzOqZjOqmTOqzDOq/zPVADPVMzPVZjPVmTPVzDPV/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YrAGYrM2YrZmYrmWYrzGYr/2ZVAGZVM2ZVZmZVmWZVzGZV/2aAAGaAM2aAZmaAmWaAzGaA/2aqAGaqM2aqZmaqmWaqzGaq/2bVAGbVM2bVZmbVmWbVzGbV/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5krAJkrM5krZpkrmZkrzJkr/5lVAJlVM5lVZplVmZlVzJlV/5mAAJmAM5mAZpmAmZmAzJmA/5mqAJmqM5mqZpmqmZmqzJmq/5nVAJnVM5nVZpnVmZnVzJnV/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wrAMwrM8wrZswrmcwrzMwr/8xVAMxVM8xVZsxVmcxVzMxV/8yAAMyAM8yAZsyAmcyAzMyA/8yqAMyqM8yqZsyqmcyqzMyq/8zVAMzVM8zVZszVmczVzMzV/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8rAP8rM/8rZv8rmf8rzP8r//9VAP9VM/9VZv9Vmf9VzP9V//+AAP+AM/+AZv+Amf+AzP+A//+qAP+qM/+qZv+qmf+qzP+q///VAP/VM//VZv/Vmf/VzP/V////AP//M///Zv//mf//zP///wAAAAAAAAAAAAAAACH5BAEAAPwALAAAAAAUABQAAAieAPcJHEiwoMGDCBFqGELQ3cAhCw0Ogchwn7uLAhcSyVCQCIghADY6LPiBSMWHCyMa3EhE4MZ9QzYqOUkwJscMNomUhHgwA5Ek+4gsVOKTosGiGgRSZAmUYNGPLR9C5UjQpEaqS4sWzDBTZdafSWumrKhTJsWTRbsONAlz7FiWWp3+NFt2yEeVApHm1Mu2apKFU7s27cmWa9aECHkWDAgAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Configuration
    const scriptName = "industrialiguana"
    const userName = "PUT YOUR USERNAME HERE BEFORE USE!!!!"

    console.log("Iguana loaded");
    let api_info = "nothing"; //Stored globally to allow us to only make one call.

    //Dictionary to go from a census scales id values to their names.
    //This is an incomplete listing because this code only relates
    //to industries
    let scale_id_to_name = new Map();
    scale_id_to_name.set("16", "Arms Manufacturing");
    scale_id_to_name.set("10", "Automobile Manufacturing");
    scale_id_to_name.set("12", "Basket Weaving");
    scale_id_to_name.set("18", "Beverage Sales");
    scale_id_to_name.set("24", "Book Publishing");
    scale_id_to_name.set("11", "Cheese Exports");
    scale_id_to_name.set("22", "Furniture Restoration");
    scale_id_to_name.set("25", "Gambling");
    scale_id_to_name.set("13", "Information Technology");
    scale_id_to_name.set("21", "Insurance");
    scale_id_to_name.set("20", "Mining");
    scale_id_to_name.set("14", "Pizza Delivery");
    scale_id_to_name.set("23", "Retail");
    scale_id_to_name.set("19", "Timber Woodchipping");
    scale_id_to_name.set("15", "Trout Fishing");

    //Function to call HighCharts
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    //Page modifications

    const nationLook = document.querySelector("div.newtitlename").textContent;

    const industries_default_div = document.querySelector("div#chart-container")

    const industries_piechart_div = document.createElement("div");
    industries_piechart_div.setAttribute("id", "chart-container-pie");

    const industries_relative_div = document.createElement("div");
    industries_relative_div.setAttribute("id", "chart-container-relative");

    const industries_total_div = document.createElement("div");
    industries_total_div.setAttribute("id", "chart-container-total");

    industries_default_div.after(industries_piechart_div);
    industries_default_div.after(industries_relative_div);
    industries_default_div.after(industries_total_div);

    industries_piechart_div.setAttribute("display", "none");
    industries_relative_div.setAttribute("display", "none");
    industries_total_div.setAttribute("display", "none");

    //Buttons
    const buttonGroup = document.createElement("div");
    buttonGroup.setAttribute("class", "button-group");
    buttonGroup.setAttribute("style", "padding-bottom: 1.5em");

    const buttonDefault = document.createElement("button");
    buttonDefault.setAttribute("class", "button active ecobutton");
    buttonDefault.innerHTML = '<span style="font-family:nationstates" title="Default economy view"></span>';
    buttonGroup.appendChild(buttonDefault);

    const buttonPie = document.createElement("button");
    buttonPie.setAttribute("class", "button ecobutton");
    buttonPie.innerHTML = '<span style="font-family:nationstates" title="Industries piechart"></span>';
    buttonGroup.appendChild(buttonPie);

    const buttonRelative = document.createElement("button");
    buttonRelative.setAttribute("class", "button ecobutton");
    buttonRelative.innerHTML = '<span style="font-family:nationstates" title="Relative industry trends chart"></span>';
    buttonGroup.appendChild(buttonRelative);

    const buttonTotal = document.createElement("button");
    buttonTotal.setAttribute("class", "button ecobutton");
    buttonTotal.innerHTML = '<span style="font-family:nationstates" title="Total industry chart"></span>';
    buttonGroup.appendChild(buttonTotal);


    document.querySelector("p.nationnavbar").after(buttonGroup);

    buttonDefault.addEventListener("click", create_default_industry_chart);
    buttonPie.addEventListener("click", create_pie_industry_chart);
    buttonRelative.addEventListener("click", create_relative_industry_chart);
    buttonTotal.addEventListener("click", create_total_industry_chart);

    const nationViewedWithCapitalization = "Mechanocracy"

    //Default: The broad overview vanilla NationStates generates
    //Industries piechart: The view provided by the legacy Economic Iguana
    //Relative industry trends: All existant industries shown by a percentage of total output.
    //Total industry chart: Combines all industries to show per sector and overview changes.
    //But we only want to have to make our API calls once per time someone shows up.
    //And we only want to generate each graph once.
    //So let's save our API information to the global context after we see it for the first time.
    //And let's have divs to contain our different charts that .hide and .show on cue.

    //Code here adapted from the "rank" nation detail page.
    //Allows the user to toggle what graph is displayed.
    $('.ecobutton').on('click', function() {
        $('.active').toggleClass('active');
        $(this).addClass("active");

        buttonDefault.disabled = true;
        buttonPie.disabled = true;
        buttonRelative.disabled = true;
        buttonTotal.disabled = true;

        setTimeout(function() {
            buttonDefault.disabled = false;
            buttonPie.disabled = false;
            buttonRelative.disabled = false;
            buttonTotal.disabled = false;
        }, 200);

    });

    async function getCensusData(nationName, scriptName, userName, scales, mode) {
        if(api_info != "nothing"){return api_info};
        const url = "https://www.nationstates.net/cgi-bin/api.cgi?nation=" + nationName + ";q=census;scale=" + scales + ";mode=" + mode + "&script=" + scriptName + "_user_is_" + userName;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const apiResponse = await response.text();
            api_info = apiResponse;
            return apiResponse;
        } catch (error) {
            console.error(error.message);
        }
    }

    async function create_pie_industry_chart(){
        industries_default_div.setAttribute("style", "display: none");
        industries_piechart_div.setAttribute("style", "display: block");
        industries_relative_div.setAttribute("style", "display: none");
        industries_total_div.setAttribute("style", "display: none");

        if(industries_piechart_div.innerHTML == ""){

            const nationName = nationLook;
            const scales = "16+10+12+18+24+11+22+25+13+21+20+14+23+19+15"
            const mode = "history"
            let nationstatesXML = await getCensusData(nationName, scriptName, userName, scales, mode)
            const parser = new DOMParser();
            let xmlDocoument = parser.parseFromString(nationstatesXML, "text/xml");

            let scaleList = xmlDocoument.querySelectorAll("SCALE");
            let series = [];

            //Our five sectors are:
            //Entertainment (Gambling, Retail)
            //Extractive (Mining, Timber Woodchipping)
            //Manufacturing (Basket Weaving, Arms Manufacturing, Automobile Manufacturing)
            //Foodstuffs (Pizza Delivery, Trout Fishing, Cheese Exports, Beverage Sales)
            //Information (Information Technology, Book Publishing)
            //Misc. (Furniture Restoration, Insurance)

            let industryToSector = new Map();
            industryToSector.set("Gambling", "Entertainment");
            industryToSector.set("Retail", "Entertainment");
            industryToSector.set("Mining", "Extractive");
            industryToSector.set("Timber Woodchipping", "Extractive");
            industryToSector.set("Basket Weaving", "Manufacturing");
            industryToSector.set("Arms Manufacturing", "Manufacturing");
            industryToSector.set("Automobile Manufacturing", "Manufacturing");
            industryToSector.set("Pizza Delivery", "Foodstuffs");
            industryToSector.set("Trout Fishing", "Foodstuffs");
            industryToSector.set("Cheese Exports", "Foodstuffs");
            industryToSector.set("Beverage Sales", "Foodstuffs");
            industryToSector.set("Information Technology", "Information");
            industryToSector.set("Book Publishing", "Information");
            industryToSector.set("Furniture Restoration", "Misc");
            industryToSector.set("Insurance", "Misc");

            //Creating the Drilldown array information is a bit of a pain.
            //For keeping track of everything.
            let sectors = [];
            function sectorObj(y, drilldown){
                this.y = y;
                this.drilldown = drilldown;
            }
            function drilldownObj(name, categories, data){
                this.name = name;
                this.categories = categories;
                this.data = data;
            }
            let sectorMap = new Map();

            for (let i = 0; i < scaleList.length; i++) {
                let scale_id = scaleList[i].getAttribute("id");
                let pointList = scaleList[i].querySelectorAll("POINT");

                //We only want the present value for each industry
                let industryScore = parseFloat(pointList[(pointList.length-1)].querySelector("SCORE").textContent)

                if(industryScore > 0){
                    const industryName = scale_id_to_name.get(scale_id);
                    const sectorName = (industryToSector.get(industryName));
                    if(!sectors.includes(sectorName)){
                        sectors.push(sectorName);
                        let drillObj = new drilldownObj(sectorName, [industryName],[industryScore]);
                        let secObj = new sectorObj(industryScore, drillObj);
                        sectorMap.set(sectorName, secObj);
                    }
                    else{
                        //Otherwise we need to find our sector object and update its values according
                        const sectorToUpdate = sectorMap.get(sectorName);
                        sectorToUpdate.y += industryScore;
                        sectorToUpdate.drilldown.categories.push(industryName);
                        sectorToUpdate.drilldown.data.push(industryScore);
                    }
                }
            }
            let data = [];
            for(let sector of sectors){
                data.push(sectorMap.get(sector));
            }
            console.log(data);

            let perSectorData = [];
            let perIndustryData = [];
            const dataLen = sectors.length;

            //--- FROM NS
            // Build the data arrays
            for (let i = 0; i < dataLen; i += 1) {

                // add sector data
                perSectorData.push({
                    name: sectors[i],
                    y: data[i].y
                });

                // add Industry data
                let drillDataLen = data[i].drilldown.data.length;
                for (let j = 0; j < drillDataLen; j += 1) {
                    perIndustryData.push({
                        name: data[i].drilldown.categories[j],
                        y: data[i].drilldown.data[j],
                    });
                }
            }

            //---------

            var chart;
            $(document).ready(function () {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'chart-container-pie',
                        type: 'pie',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: { text: (nationLook.trim() + "'s Industries") },
                    credits: { enabled: false },
                    plotOptions: {
                        pie: {
                            shadow: false,
                            center: ['50%', '50%']
                        }
                    },
                    series: [
                        {
                            name: 'Sectors',
                            data: perSectorData,
                            size: '60%',
                            dataLabels: {
                                enabled: false
                            }
                        },{
                            name: 'Industries',
                            data: perIndustryData,
                            size: '90%',
                            innerSize: '64%',
                            dataLabels: {
                                enabled: true,
                            }

                        }
                    ]
                });
            });
        };
    };

    async function create_relative_industry_chart(){
        industries_default_div.setAttribute("style", "display: none");
        industries_piechart_div.setAttribute("style", "display: none");
        industries_relative_div.setAttribute("style", "display: block");
        industries_total_div.setAttribute("style", "display: none");

        if(industries_relative_div.innerHTML == ""){

            const nationName = nationLook;
            const scales = "16+10+12+18+24+11+22+25+13+21+20+14+23+19+15"
            const mode = "history"
            let nationstatesXML = await getCensusData(nationName, scriptName, userName, scales, mode)
            const parser = new DOMParser();
            let xmlDocoument = parser.parseFromString(nationstatesXML, "text/xml");

            let scaleList = xmlDocoument.querySelectorAll("SCALE");
            let seriesToShow = [];

            //Has to be here for scope reasons
            let timestampTotal = []; //Gets the sum of all positive points on a given timestamp, also as (x,y)

            for (let i = 0; i < scaleList.length; i++) {
                let scale_id = scaleList[i].getAttribute("id");
                let pointList = scaleList[i].querySelectorAll("POINT");
                let listOfTimeValuePairs = [];


                for (let j = 0; j < pointList.length; j++) {
                    const x = (parseInt(pointList[j].querySelector("TIMESTAMP").textContent) * 1000); //1000 is a correction between the formatting that HighCharts needs
                    let y = parseFloat(pointList[j].querySelector("SCORE").textContent);

                    if(y > 0){
                        //Search the array timestampTotal for our current timestamp
                        //sum into it if it is there.
                        let foundIt = false;
                        for(let time of timestampTotal){
                            //console.log(time)
                            if(time[0] == x){
                                foundIt = true;
                                time[1] += y;
                            }
                        }
                        //If we can't find it, create a new point
                        if(!foundIt){
                            timestampTotal.push([x, y]);
                        }
                    }

                    if(y < 0){ y = 0 }; //Set value floor to prevent negative percentages later

                    listOfTimeValuePairs.push([x, y]);
                }
                seriesToShow.push({name: scale_id_to_name.get(scale_id), data: listOfTimeValuePairs})
            }

            //Convert all of our series into percentages
            for(let siri of seriesToShow){
                for(let siriPoint of siri.data){
                    if(siriPoint[1] > 0){
                        let value = siriPoint[1];
                        let total = 0;
                        for(let possibleTimePoint of timestampTotal){
                            if(possibleTimePoint[0] == siriPoint[0]){
                                total = possibleTimePoint[1];
                            }
                        }

                        siriPoint[1] = (value/total);
                    }
                }
            }
            //------
            Highcharts.setOptions({
                global: {
                    useUTC: false
                },
                lang: {
                    numericSymbols: ["K", "M", "B", "T", "P", "E"]
                }
            });
            var chart = new Highcharts.Chart({
                title: {
                    text: "Relative Sectors of " + nationLook.trim() + "'s Economy"
                },
                subtitle: {
                    text: "The World Census called businesses at random to determine the relative size of industries in each nation."
                },
                credits: {
                    enabled: false
                },
                colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92', '#8bbc21', '#1aadce', '#910000', '#E6E440', '#FFB6C1', '#40E0D0'],
                legend: {
                    enabled: true
                },
                chart: {
                    renderTo: 'chart-container-relative',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    zoomType: 'x',
                    defaultSeriesType: 'area'
                },
                series: seriesToShow,
                tooltip: {
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    },
                    spline: {
                        lineWidth: 4,
                        states: {
                            hover: {
                                lineWidth: 6
                            }
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 5,
                                    lineWidth: 1
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    max: 1,
                    title:
                    { text: 'Percentage of Economy', useHTML: true, style: { color: '#666', fontWeight: 'normal' } }
                },
            });
        }
    };

    async function create_total_industry_chart() {
        industries_default_div.setAttribute("style", "display: none");
        industries_piechart_div.setAttribute("style", "display: none");
        industries_relative_div.setAttribute("style", "display: none");
        industries_total_div.setAttribute("style", "display: block");

        if(industries_total_div.innerHTML == ""){
            const scriptName = "industrialiguana"
            const nationName = nationLook;
            const userName = "mechanocracy"
            const scales = "16+10+12+18+24+11+22+25+13+21+20+14+23+19+15"
            const mode = "history"

            let nationstatesXML = await getCensusData(nationName, scriptName, userName, scales, mode)
            const parser = new DOMParser();
            let xmlDocoument = parser.parseFromString(nationstatesXML, "text/xml");

            let scaleList = xmlDocoument.querySelectorAll("SCALE");
            let seriesToShow = [];
            for (let i = 0; i < scaleList.length; i++) {
                let scale_id = scaleList[i].getAttribute("id");
                let pointList = scaleList[i].querySelectorAll("POINT");
                let listOfTimeValuePairs = [];
                for (let j = 0; j < pointList.length; j++) {
                    const x = (parseInt(pointList[j].querySelector("TIMESTAMP").textContent) * 1000); //1000 is a correction between the formatting that HighCharts needs
                    const y = parseFloat(pointList[j].querySelector("SCORE").textContent);
                    listOfTimeValuePairs.push([x, y]);
                }
                seriesToShow.push({name: scale_id_to_name.get(scale_id), data: listOfTimeValuePairs})
            }

            //--------



            Highcharts.setOptions({
                global: {
                    useUTC: false
                },
                lang: {
                    numericSymbols: ["K", "M", "B", "T", "P", "E"]
                }
            });
            var chart = new Highcharts.Chart({
                title: {
                    text: "Total Sectors of " + nationLook.trim() + "'s Economy"
                },
                subtitle: {
                    text: "The World Census sends its interns to the world's smoggiest nations to track their overall industrial health."
                },

                credits: {
                    enabled: false
                },
                colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92', '#8bbc21', '#1aadce', '#910000', '#E6E440', '#FFB6C1', '#40E0D0'],
                legend: {
                    enabled: true
                },
                chart: {
                    renderTo: 'chart-container-total',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    zoomType: 'x',
                    defaultSeriesType: 'area'
                },
                series: seriesToShow,
                tooltip: {
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    },
                    spline: {
                        lineWidth: 4,
                        states: {
                            hover: {
                                lineWidth: 6
                            }
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 5,
                                    lineWidth: 1
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title:
                    { text: 'Currency units', useHTML: true, style: { color: '#666', fontWeight: 'normal' } }
                },
            });
        }
    }

    function create_default_industry_chart(){
        industries_default_div.setAttribute("style", "display: block");
        industries_piechart_div.setAttribute("style", "display: none");
        industries_relative_div.setAttribute("style", "display: none");
        industries_total_div.setAttribute("style", "display: none");
    }


})();
