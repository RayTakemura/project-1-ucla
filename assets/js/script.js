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
                response.json()
                    .then(function(data) {
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
                            
                            swapSearchToText(citiesData.cityFrom.name);
                            createSearchBar('to');
                            fetchGeoCityDB(citiesData.cityFrom.lat, citiesData.cityFrom.lon, 'from');
                            

                            for (var i = 0; i < 4; i++) {
                                var dateString = citiesData.cityFrom.weather.weathDate[i];
                                var iconURL = citiesData.cityFrom.weather.icon[i];
                                var tempStr = citiesData.cityFrom.weather.temp[i];
                                var humidityStr = citiesData.cityFrom.weather.humidity[i];
                                $('.w-from').append(createWeatherCard (dateString, iconURL, tempStr, humidityStr, false));
                            }
                            
                            

                        } else if (toOrFrom === 'to'){  // achieve weather data for the cityTo data 
                            citiesData.cityTo.name = data.city.name;
                            citiesData.cityTo.lat = data.city.coord.lat;
                            citiesData.cityTo.lon = data.city.coord.lon;

                            //store all weather data into the cities data object
                            for (var i = 0; i < 4; i++) {
                                var convertedIndex = (i * 8);
                                citiesData.cityTo.weather.weathDate.push(moment().add(i, "days").format("L"));
                                citiesData.cityTo.weather.icon.push("http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png");
                                citiesData.cityTo.weather.temp.push(data.list[convertedIndex].main.temp);
                                citiesData.cityTo.weather.humidity.push(data.list[convertedIndex].main.humidity);
                            }
                            
                            for (var i = 0; i < 4; i++) {
                                var dateString = citiesData.cityTo.weather.weathDate[i];
                                var iconURL = citiesData.cityTo.weather.icon[i];
                                var tempStr = citiesData.cityTo.weather.temp[i];
                                var humidityStr = citiesData.cityTo.weather.humidity[i];
                                $('.w-to').append(createWeatherCard (dateString, iconURL, tempStr, humidityStr, false));
                            }
                            
                        } else {
                            console.log('make sure to enter "to" or "from" when you call fetchOpenWeather function!')
                            return;
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
                        console.log(data.data[i].city);
                        citiesData.cityFrom.recCities.push(data.data[i].city);
                        
                    }
                    var $cityRecSpanEl = $('<span>')
                        .text('Recommended cities: ')
                        .addClass('city-recommendation bullet cell small-2');
                    $('.nearby-cities').append($cityRecSpanEl);
                    for (var i = 0; i < 3; i++){
                        var $cityRecButtonEl = $('<a>')
                            .addClass('button radius info city-recommendation bullet cell small-1')
                            .text(citiesData.cityFrom.recCities[i]);

                        $('.nearby-cities').append($cityRecButtonEl);
                        console.log(citiesData.cityFrom.recCities[i]);
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
        $formEl.attr('id','from');
    } else {
        $('.trav-to').append($formEl);
        $formEl.attr('id','to');
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


function createWeatherCard (dateString, iconURL, tempStr, humidityStr, removable){
    $date = $('<h4>').text(dateString);
    $icon = $('<img>').attr('src', iconURL);
    $temp = $('<span>').text("Temp: " + tempStr + "°F");
    $humidity = $('<span>').text("Humidity: " + humidityStr + "%")
    $cardSection = $('<div>')
        .addClass('card-section')
        .append($date)
        .append($icon)
        .append($temp)
        .append($humidity);
    $card = $('<div>')
        .addClass('card')
        .append($cardSection);
    if (removable){
        $card.addClass('removable');
    }
    return $card;

}

// When the web is loaded, create a search bar (the search bar will be deleted later)
createSearchBar('from');


$("body").submit(function(event) {
    event.preventDefault();
    // var searchInputFrom = $("#search-input-from").val();
    // if(searchInputFrom){
    //     openWeather(searchInputFrom);
    // }
    if(event.target.matches('#from')){
        var searchInput = $('#search-input-from').val();
        fetchOpenWeather(searchInput,'from');
        
    }else if(event.target.matches('#to')){
        var searchInput = $('#search-input-to').val();
        fetchOpenWeather(searchInput,'to');

    }
});

// ready the function to accept button clicks of nearby cities
$('body').on('click', '.city-recommendation', function () {
    var buttonValue = $(this).html();
    console.log("the city is being called")
    console.log(buttonValue);

    openWeather(buttonValue);
});
