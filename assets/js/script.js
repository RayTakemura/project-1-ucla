$(document).foundation(); // needed to make foundation work.

var apiKeyOW = "69b9ebd4d042c48c14532ef8693d871e";

// false if the data for "city from" is not displayed. 
var cityFromDisplay = false;
// false if the data for "city to" is not displayed. 
var cityToDisplay = false;
// holds the name of city that the traveler is traveling from
var cityFromHolder = '';
// Stores all local storage data into this object
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

                        var cityName = data.city.name;
                        var lat = data.city.coord.lat;
                        var lon = data.city.coord.lon;

                        // achieve weather data for the cityFrom data
                        if (toOrFrom === 'from'){
                            cityFromHolder = cityName;

                            //create weather forecast title
                            $forecastTitle = $('<h3>').text('4-day forecast of ' + cityName + ':');
                            $('.forecast-title-from').append($forecastTitle);

                            //create yelp recommendation title
                            $restaurantListTitle = $('<h3>').text('Restaurants in ' + cityName + ':');
                            $('.yelp-list-title-from').append($restaurantListTitle);

                            // create weather cards
                            for (var i = 0; i < 4; i++) {
                                var convertedIndex = (i * 8);
                                var dateString = moment().add(i, "days").format("L");
                                var iconURL = "http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png";
                                var tempStr = data.list[convertedIndex].main.temp;
                                var humidityStr = data.list[convertedIndex].main.humidity;
                                var $weatherCard = createWeatherCard (dateString, iconURL, tempStr, humidityStr, false)
                                $('.w-from').append($weatherCard);
                            }  
                            // if the "city from" data are not displayed yet, take the following actions:
                            if (!cityFromDisplay){
                                //create section title for weather and yelp data
                                $weatherTitle = $('<h2>').text('Weather:');
                                $('.w-title').append($weatherTitle);
                                $yelpTitle = $('<h2>').text('Recommended Restaurants:');
                                $('.y-title').append($yelpTitle);

                                swapSearchToText(cityName);
                                createSearchBar('to');
                                fetchGeoCityDB(lat, lon, 'from');
                            }

                            fetchYelp(cityName, 'from');

                            cityFromDisplay = true; //the "city from" data are displayed and marked

                        } else if (toOrFrom === 'to'){  // achieve weather data for the cityTo data 

                            // if the "city to" data are displayed remove removable DOMs and display an updated travel list
                            if(cityToDisplay){
                                $('.removable').remove();
                                displayTravelList();
                            }
                            saveTravelList(cityFromHolder, cityName);
                            

                            //create weather forecast title
                            $forecastTitle = $('<h3>')
                                .text('4-day forecast of ' + cityName + ':')
                                .addClass('removable');
                            $('.forecast-title-to').append($forecastTitle);

                            // create weather cards
                            for (var i = 0; i < 4; i++) {
                                var convertedIndex = (i * 8);
                                var dateString = moment().add(i, "days").format("L");
                                var iconURL = "http://openweathermap.org/img/w/" + data.list[convertedIndex].weather[0].icon + ".png";
                                var tempStr = data.list[convertedIndex].main.temp;
                                var humidityStr = data.list[convertedIndex].main.humidity;
                                var $weatherCard = createWeatherCard (dateString, iconURL, tempStr, humidityStr, true)
                                $('.w-to').append($weatherCard);
                            }

                            fetchYelp(cityName, 'to');

                            cityToDisplay = true; //the "city to" data are displayed and marked
                            
                        } else {
                            console.log('make sure to enter "to" or "from" when you call fetchOpenWeather function!')
                            return;
                        }
                        // remove error message if it exists
                        $('.error-msg').remove();
                        
                    })

            // error handling for bad responses
            } else {
                alertUser(cityName);
            }
        })
    // catch error if there is an exception
    .catch(function(error) {
        // catch() getting chained onto the end of the then
        console.log("logic error in featchOpenWeather function :(")
    });
}


/**
 * Fetches a list of nearby cities from nearby cities by using geoCityDB's API.
 * @param {number} lat The latitude of the city 
 * @param {number} lon The longitude of the city
 */
var fetchGeoCityDB = function (lat, lon) {
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
                var recCities = [];
                
                for (var i = 2; i < 5; i++){// limit recommended searches to 3
                    recCities.push(data.data[i].city);
                }
                // create buttons that contains a recommended nearby cities that was searched by the user
                var $cityRecSpanEl = $('<span>')
                    .text('Recommended cities: ')
                    .addClass('bullet cell small-2');
                $('.nearby-cities').append($cityRecSpanEl);
                for (var i = 0; i < 3; i++){
                    var $cityRecButtonEl = $('<a>')
                        .addClass('button radius info city-recommendation bullet cell small-1 rounded')
                        .text(recCities[i]);
                    $('.nearby-cities').append($cityRecButtonEl);
                }
            })
        }
    })
    .catch(err => {
        console.error(err);
    });
}

/**
 * Fetches data from the yelp API.
 * To break the CORS proxy barrier, a heroku app is used. (source: https://github.com/Rob--W/cors-anywhere)
 * @param {string} cityName The name of the city to be searched through the yelp api
 * @param {string} toOrFrom Whether the user wants this information for the city that they're traveling from or to
 */
function fetchYelp(cityName, toOrFrom){
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer 9L0XxHNnQJiXPX5w0XuGqhOYZXx0CwmKc9sOc00ApKSApzvm0Etd3WpzKJL4T3zDRv0BotBJrUlPcHx140lZirnebjVbI45MD6KPNziXR1s1hXt2g51db7EwOhBdYHYx");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("https://secure-shelf-42257.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + cityName, requestOptions)
        .then(response => response.json())
        .then(result => {

            // create weather cards
            for(var i = 0; i < 4; i++){
                    var restaurantName = result.businesses[i].name;
                    var imgURL = result.businesses[i].image_url;
                    var rating = result.businesses[i].rating;
                    var price = result.businesses[i].price;
                    $('.y-' + toOrFrom).append(createYelpCard (restaurantName, imgURL, rating, price, toOrFrom === 'to'));
            }
            if(toOrFrom === 'to') {
                $restaurantListTitle = $('<h3>').text('Restaurants in ' + cityName + ':');
                $restaurantListTitle.addClass('removable');
                $('.yelp-list-title-to').append($restaurantListTitle);
            } else if(toOrFrom !== 'from') {
            console.log('you called the fetchYelp function incorrectly!');
            }
        })
        .catch(error => console.log('error', error));
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
    $('.search-form').append($cityNameEl);
}

/**
 * Creates a single weather card with data stored for that day's forcast
 * @param {string} dateString the date of the forecast
 * @param {string} iconURL the URL of the icon from openWeather
 * @param {string} tempStr the temperature in Fahrenheit
 * @param {string} humidityStr the humidity value in percent 
 * @param {boolean} removable true if the card should be removable by user action. False if it shouldn't be removed. 
 * @returns The card to be appeneded to the proper html container
 */
function createWeatherCard (dateString, iconURL, tempStr, humidityStr, removable){
    // create date and weather icon elements
    $date = $('<h4>').text(dateString);
    $icon = $('<img>').attr('src', iconURL);

    // create row and humidity elemnts and wrap them with row container to have them line up vertically
    $temp = $('<span>').text("Temp: " + tempStr + "°F");
    $tempRow = $('<div>').addClass('row');
    $tempRow.append($temp);

    $humidity = $('<span>').text("Humidity: " + humidityStr + "%")
    $humidRow = $('<div>').addClass('row');
    $humidRow.append($humidity);

    // append all of the above elements into a card section container styled by foundation
    $cardSection = $('<div>')
        .addClass('card-section')
        .append($date)
        .append($icon)
        .append($tempRow)
        .append($humidRow);

    // append card section container by card container
    $card = $('<div>')
        .addClass('card cell small-2 rounded w-card')
        .append($cardSection);
    if (removable){
        $card.addClass('removable ');
    }
    return $card;

}

/**
 * Creates Yelp card that holds data about the searched restaurant.
 * @param {string} name The name of the restaurant.
 * @param {string} imgURL The image about the restaurant that was provided by yelp.
 * @param {string} rating The average rating of the restaurant given by users
 * @param {string} price The price the restaurant on the scale of 1-5 (in dollar signs $$$$$)
 * @param {boolean} removable true if the card should be removable by user action. False if it shouldn't be removed. 
 * @returns The card to be appeneded to the proper html container
 */
function createYelpCard (name, imgURL, rating, price, removable){
    //create elements for the name of the restaurant and the image for it
    $name = $('<h4>').text(name); 
    $img = $('<img>').attr('src', imgURL).attr('width', '150px');

    //create elements for rating and price
    $rating = $('<span>')
    if (rating){
        $rating.text('Rating: ' + rating);
    } else {
        $rating.text('Rating: N/A');
    }
    $ratingRow = $('<div>')
        .addClass('row')
        .append($rating);

    $price = $('<span>')
        .text('Price: ' + price);
    $priceRow = $('<div>')
        .addClass('row')
        .append($price);
    
    // append all of the above to a card section container that is styled by foundation
    $cardSection = $('<div>')
        .addClass('card-section')
        .append($name)
        .append($img)
        .append($ratingRow)
        .append($priceRow);

    // append the card section to a card container that is styled by foundation
    $card = $('<div>')
        .addClass('card cell small-2 rounded yelp-card')
        .append($cardSection);

    // if the card should be removable with a simple search, add a class as a marking
    if (removable){
        $card.addClass('removable');
    }
    return $card;
}

/**
 * Displays the list of search history that the user have searched with his/her browser.
 * @returns false if there is nothing to be displayed. Nothing is returned if there are things to be displayed
 */
function displayTravelList() {
    $('.travel-list').remove();

    travelList = JSON.parse(localStorage.getItem('travelListTTT'));

    console.log(travelList);
    
    if(!travelList){
        return;
    }
    
    var $ulEl = $('<ul>').addClass('travel-list bullet');
    for (var i = travelList.cityFrom.length - 1; i >= 0; i--){
        var $buttonEl = $('<button>')
            .text(travelList.cityFrom[i] + " to " + travelList.cityTo[i])
            .addClass('button cell rounded history');
        var $travelPath = $('<li>')
            .addClass('grid-x')
            .append($buttonEl);
        $ulEl.append($travelPath);
    }
    var $spanEl = $('<span>').text('Your travel list:');

    var $listRow = $('<div>')
        .addClass('row grid-x removable')
        .append($spanEl)
        .append($ulEl)

    $('.search-history').append($listRow);
}

/**
 * Saves a set of cities that the user chose to travel
 * @param {string} from The city that the user is traveling from
 * @param {string} to The city that the user is trying to travel to 
 */
function saveTravelList(from, to){
    if (!travelList){
        travelList = {
            cityFrom: [],
            cityTo: []
        }
    }
    travelList.cityFrom.push(from);
    travelList.cityTo.push(to);
    localStorage.setItem('travelListTTT', JSON.stringify(travelList));
}

/**
 * Alert the user if the user entered an invalid city.
 * @param {string} cityName The name of the city that the user tried to search
 */
function alertUser(cityName) {
    //remove previous error message
    $('.error-msg').remove();

    // create a new error message
    var $errorMsg = $('<span>')
        .addClass('error-msg');
    
    if(cityName === ''){
        $errorMsg.text('Please enter a city name!');
    } else {
        $errorMsg.text(cityName + ' is not found!')
    }

    $('.error').append($errorMsg);

}

// When the web is loaded, create a search bar (the search bar will be deleted later)
createSearchBar('from');

displayTravelList();


$("body").submit(function(event) {
    event.preventDefault();
    // remove error message if it exists
    // $('.error-msg').remove();
    //remove titles to avoid duplicate code
    $('.h3').remove();
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
    // remove error message if it exists
    // $('.error-msg').remove();
    // remove titles to avoid the title to be shown multiple times!
    $('h3').remove();

    // restore removed titles!
    $forecastTitle = $('<h3>').text('4-day forecast of ' + cityFromHolder + ':');
    $('.forecast-title-from').append($forecastTitle);
    $restaurantListTitle = $('<h3>').text('Restaurants in ' + cityFromHolder + ':');
    $('.yelp-list-title-from').append($restaurantListTitle);

    var buttonValue = $(this).html();
    fetchOpenWeather(buttonValue, 'to');
});


$('body').on('click', '.history', function () {
    // remove error message if it exists
    // $('.error-msg').remove();
    var buttonValue = $(this).html().split(' to ');
    console.log("the city is being called");
    console.log(buttonValue);

    // remove all items to prevent duplicate displays
    $('h3').remove();
    $('.card').remove();
    $('.removable').remove();
    cityToDisplay = false;

    //fetch for all data needed 
    fetchOpenWeather(buttonValue[0], 'from');
    fetchOpenWeather(buttonValue[1], 'to');

    //show updated travel list history
    displayTravelList();
});