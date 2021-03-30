$(document).foundation();

var apiKeyOW = "69b9ebd4d042c48c14532ef8693d871e";

var searchButtonEl = document.getElementById("searchbutton");
var nearbyCitiesEl = document.getElementById("nearby-cities");
var searchInputEl =document.getElementById("search-input");
var travelPathEl = document.getElementById("travel-path");
var forecastEl = document.getElementById("forecast-list");
var savingTheOrigin = document.getElementById("origin-city");

// TODO delete and load via a local storage function
var travelList = [];

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

                // possibly empty forecast element
                forecastEl.innerHTML = ""; 

                // for loop to make a forecast of 4 days
                for (var i = 0; i < 4; i++) {
                    // loop to get 4 days worth of forecast
                    var convertedIndex = (i*8);

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

                    //TODO Need forecast holder element
                    forecastEl.appendChild(dailyCard);
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

                //empty the recommendations before moving on
                nearbyCitiesEl.innerHTML = "";
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
                    var cityRecButtonEl = document.createElement("a");
                    cityRecButtonEl.className = "button city-recommendation";
                    cityRecButtonEl.innerHTML = cityRec;

                    nearbyCitiesEl.appendChild(cityRecButtonEl);
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


$("body").submit(function(event) {
    event.preventDefault();
    var searchInputFrom = $("#search-input-from").val();
    var searchInputTo = $('#search-input-to').val();
    if(searchInputFrom){
        savingTheOrigin.innerHTML = searchInputFrom;
        openWeather(searchInputFrom);
    }
    if(searchInputTo){
        openWeather(searchInputTo);
    }

    
});


// ready the function to accept button clicks of nearby cities
$('body').on('click', '.city-recommendation', function () {
    var buttonValue = $(this).html();
    console.log("the city is being called")
    console.log(buttonValue);

    openWeather(buttonValue);
});