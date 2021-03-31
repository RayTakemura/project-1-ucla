$(document).foundation();

var apiKeyOW = "69b9ebd4d042c48c14532ef8693d871e";

var searchInputEl =document.getElementById("search-input");
var travelPathEl = document.getElementById("travel-path");
// false if the second search bar is showing. True if it's showing
var secondForm = false;
var recCityDisplay = false;

// data of the cities retrieved from fetched data
var citiesData = {
    cityFrom: {
        name: '',
        noSpaceName: '',
        lon: 0,
        lat: 0,
        weather: {
            weathDate: [],
            icon: [],
            temp: [],
            humidity: []
        },
        recCities: []
    },
    cityTo: {
        name: '',
        noSpaceName: '',
        lon: 0,
        lat: 0,
        weather: {
            weathDate: [],
            icon: [],
            temp: [],
            humidity: []
        },
        recCities: []
    }
};

var travelList = {};

var openWeather = function (cityName) {

    // handling cities with spaces in their name
    var noSpaceCity = cityName.replace(" ", "+");
    console.log(noSpaceCity);

    var OWUrl ="https://api.openweathermap.org/data/2.5/forecast?q=" + noSpaceCity + "&appid=" + apiKeyOW + "&units=imperial";
    
    fetch(OWUrl).then(function(response) {
        // if statement for good and bad responses
        if (response.ok) {

            response.json().then(function(data) {
                // uncomment below if wanting to clear the forcast after each city is chosen
                // fiveDayForecastEl.innerHTML = "";
                console.log("OW URL function")
                console.log(data);

                // calling open city DB API
                var latitude = data.city.coord.lat;
                var longitude = data.city.coord.lon;
                geoCityDB(latitude, longitude);

                // commit the following if the second search bar is not on the UI.
                if (!secondForm){
                    citiesData.cityFrom.name = data.city.name;
                    console.log(citiesData);
                    swapSearchToText(data.city.name);
                    createSearchBar('to');
                    secondForm = true;
                }
                
                // for loop to make a forecast of 4 days
                for (var i = 0; i < 4; i++) {
                    // loop to get 4 days worth of forecast
                    var convertedIndex = (i * 8);

                    // creation of each card holder
                    var dailyCard = document.createElement("div");

                    // TODO: Structure based on foundation 
                    dailyCard.className = "cell small-2 primary day-forecast";

                    // h4 date header
                    var dateEl = document.createElement("h4");
                    var dateReference = moment().add(i, "days").format("L");
                    dateEl.textContent = dateReference;
                    dailyCard.appendChild(dateEl);

                    // get weather for relevant icon
                    var forecastWeather = data.list[convertedIndex].weather[0].main;
                    // icons for the cards
                    var iconDiv = document.createElement("div");
                    if (forecastWeather === "Clear") {
                        iconDiv.innerHTML = "<i class='fas fa-sun'></i>"
                    } else if (forecastWeather === "Clouds") {
                        iconDiv.innerHTML = "<i class='fas fa-cloud'></i>"
                    } else if (forecastWeather === "Rain" || forecastWeather === "Drizzle") {
                        iconDiv.innerHTML = "<i class='fas fa-cloud-rain'></i>"
                    } else if (forecastWeather === "Thunderstorm") {
                        iconDiv.innerHTML = "<i class='fas fa-bolt'></i>"
                    } else if (forecastWeather === "Snow") {
                        iconDiv.innerHTML = "<i class='far fa-snowflake'></i>"
                    } else {
                        iconDiv.innerHTML = "<i class='fas fa-times-circle'></i>"
                    }
                    // append Icon to the card
                    dailyCard.appendChild(iconDiv);

                    //temperature div
                    var tempDiv = document.createElement("div");
                    tempDiv.textContent = "Temp: " + data.list[convertedIndex].main.temp + "°F";
                    dailyCard.appendChild(tempDiv);

                    //humidity
                    var humidityDiv = document.createElement("div");
                    humidityDiv.textContent = "Humidity: " + data.list[convertedIndex].main.humidity + "%";
                    dailyCard.appendChild(humidityDiv);
                    
                }   
            })

        // error handling for bad responses
        } else {
            alert("Error: " + response.status);
        }
    })
    // additional error catching
    .catch(function(error) {
        // catch() getting chained onto the end of the then
        alert("Connection Error")
    });

}

/**
 * Fetch weather data from openWeather API, and append all data into citiesData object.
 * Depending on whether this function was called to append data for the city to travel from or to, 
 * it changes the directory of where the data is going to be stored.
 * @param {string} cityName The name of the city that was entered by the user
 * @param {string} toOrFrom The function must be called with 'to' or 'from' to correctly store data in the correct object.
 */
var fetchOpenWeather = function (cityName, toOrFrom) {
    // handling cities with spaces in their name
    var noSpaceCity = cityName.replace(" ", "+");
    var OWUrl ="https://api.openweathermap.org/data/2.5/forecast?q=" + noSpaceCity + "&appid=" + apiKeyOW + "&units=imperial";
    fetch(OWUrl)
        .then(function(response) {
            // if statement for good and bad responses
            if (response.ok) {
                response.json().then(function(data) {
                    // achieve weather data for the cityFrom data
                    if (toOrFrom === 'from'){
                        //get city's name, latitude, and longitude
                        citiesData.cityFrom.name = data.city.name;
                        citiesData.cityFrom.lat = data.city.coord.lat;
                        citiesData.cityFrom.lon = data.city.coord.lon;

                        //get city's 4 day forecast data (date, icon, temp, and humidity)
                        for (var i = 0; i < 4; i++) {
                            var convertedIndex = (i * 8);
                            citiesData.cityFrom.weather.weathDate.push(moment().add(i, "days").format("L"));
                            citiesData.cityFrom.weather.icon.push("http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png");
                            citiesData.cityFrom.weather.temp.push(data.list[convertedIndex].main.temp);
                            citiesData.cityFrom.weather.humidity.push(data.list[convertedIndex].main.humidity);
                        }  
                    } else if (toOrFrom === 'to'){  // achieve weather data for the cityTo data 
                        citiesData.cityTo.name = data.city.name;
                        citiesData.cityTo.lat = data.city.coord.lat;
                        citiesData.cityTo.lon = data.city.coord.lon;

                        for (var i = 0; i < 4; i++) {
                            var convertedIndex = (i * 8);
                            citiesData.cityTo.weather.weathDate.push(moment().add(i, "days").format("L"));
                            citiesData.cityTo.weather.icon.push("http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png");
                            citiesData.cityTo.weather.temp.push(data.list[convertedIndex].main.temp);
                            citiesData.cityTo.weather.humidity.push(data.list[convertedIndex].main.humidity);
                        }
                    }
                })

            // error handling for bad responses
            } else {
                alert("Error: " + response.status);
            }
        })
    // catch error if there is an exception
    .catch(function(error) {
        // catch() getting chained onto the end of the then
        console.log("logic error in featchOpenWeather function :(")
    });
}



var geoCityDB = function (lat, lon) {
    console.log("calling geoCityDB with" + lat + lon)
    fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/locations/" + lat + lon +"/nearbyCities?radius=100&limit=5", {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "b86f90e0b2msh50777cebadf2bf8p18ae10jsn2ea6375c04a8",
            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
        }
    })
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);

                // extract each nearby city 
                //data[i].city for name.
                //data[i].latitude and data[i].longitude fr their coordinates

                if(recCityDisplay){
                    $('.city-recommendation').remove();
                } 
                var $cityRecSpanEl = $('<span>')
                    .text('Recommended cities: ')
                    .addClass('city-recommendation bullet cell small-2');
                $('.nearby-cities').append($cityRecSpanEl);
                
                
                // limit recommended searches to 3
                for (var i = 2; i < 5; i++) {
                    //extract city
                    var cityRec = data.data[i].city;
                    console.log(cityRec);

                    //extract coordinates from the data
                    var CityRecLat = data.data[i].latitude;
                    var CityRecLong = data.data[i].longitude;

                    console.log("lat is " + CityRecLat + " and lon is " + CityRecLong)
                    
                    
                    // creating button element that needs to be inserted into the search history list
                    var $cityRecButtonEl = $('<a>')
                        .addClass('button radius info city-recommendation bullet cell small-1')
                        .attr('href', '#')
                        .text(cityRec);
                    
                    $('.nearby-cities').append($cityRecButtonEl);
                }
                recCityDisplay = true;
            })
        }
    })
    .catch(err => {
        console.error(err);
    });
}


var fetchGeoCityDB = function (lat, lon, toOrFrom) {
    console.log("calling geoCityDB with" + lat + lon)
    fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/locations/" + lat + lon +"/nearbyCities?radius=100&limit=5", {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "b86f90e0b2msh50777cebadf2bf8p18ae10jsn2ea6375c04a8",
            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
        }
    })
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                if (toOrFrom === 'from'){
                    for (var i = 2; i < 5; i++){// limit recommended searches to 3
                        citiesData.cityFrom.recCities.push(data.data[i].city);
                    }
                } else if (toOrFrom === 'to') {
                    for (var i = 2; i < 5; i++){// limit recommended searches to 3
                        citiesData.cityTo.recCities.push(data.data[i].city);
                    }
                }
            })
        }
    })
    .catch(err => {
        console.error(err);
    });
}

var addToTheList = function (){
    console.log("add to the list function called")
}

/**
 * Creates a search form. It can prompt for the city to travel 'from' or 'to'.
 * @param {string} toOrFrom 'to' or 'from' depending on the situation.
 */
function createSearchBar(toOrFrom){
    var $promptEl = $('<li>')
        .addClass('bullet')
        .text("City that you're traveling " + toOrFrom + ": ");

    var $inputEl = $('<input>')
        .attr('type', 'search')
        .attr('placeholder', 'Search')
        .attr('id', 'search-input-' + toOrFrom);
    var $inputContainer = $('<li>');
    $inputContainer.append($inputEl);

    var $searchButton = $('<button>')
        .attr('type', 'submit')
        .addClass('button bullet')
        .attr('id', 'search-button')
        .text('Search');
    var $btnContainer = $('<li>');
    $btnContainer.append($searchButton);

    var $ulEl = $('<ul>')
        .addClass('menu search-form');
    $ulEl.append($promptEl)
        .append($inputContainer)
        .append($btnContainer);

    var $searchBoxEl = $('<div>')
        .addClass('grid-x grid-padding-x align-spaced')
        .attr('id', 'searchbox')
        .append($ulEl);

    var $formEl = $('<form>')
        .append($searchBoxEl);

    if (toOrFrom === 'from'){
        $inputEl.addClass('swappable');
        $searchButton.addClass('swappable');
        $('.trav-from').append($formEl);
    } else {
        $('.trav-to').append($formEl);
    }
}

/**
 * Swaps the first search bar into text form.
 * @param {string} cityName The name of the city in correct capitalization.
 */
function swapSearchToText (cityName){
    $('.swappable').remove();
    var $cityNameEl = $('<li>')
        .text(cityName)
        .addClass('bullet');
    $('ul').append($cityNameEl);
}



// When the web is loaded, create a search bar (the search bar will be deleted later)
createSearchBar('from');


$("body").submit(function(event) {
    event.preventDefault();
    var searchInputFrom = $("#search-input-from").val();
    if(searchInputFrom){
        openWeather(searchInputFrom);
    }
});

// ready the function to accept button clicks of nearby cities
$('body').on('click', '.city-recommendation', function () {
    var buttonValue = $(this).html();
    console.log("the city is being called")
    console.log(buttonValue);

    openWeather(buttonValue);
});
