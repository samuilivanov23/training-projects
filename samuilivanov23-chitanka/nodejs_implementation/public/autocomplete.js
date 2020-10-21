//first arg -> the text field
//second arg -> the array of cities
function autocomplete(input, cities) 
{
    //used to track which is the active city we are about to choose
    var currentFocus;
    
    //executed when someone writes in the text field
    input.addEventListener("input", function(e) 
    {
        var all_items_div, single_item_div, i, val = this.value;
        //close any already open lists of autocompleted values
        closeAllLists();

        if (!val) 
        {
            return false;
        }

        currentFocus = -1;

        //create div element that will contain all the items
        all_items_div = document.createElement("DIV");
        all_items_div.setAttribute("id", this.id + "autocomplete-list");
        all_items_div.setAttribute("class", "autocomplete-items");

        //append this div elemetn as a child of the input field
        this.parentNode.appendChild(all_items_div);
        //iterate through the array of cities
        for (i = 0; i < cities.length; i++) {

            //check if the item's first letter matches with the text field value first letter
            if (cities[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) 
            {
                //create div element for each maching item
                single_item_div = document.createElement("DIV");

                //make the matching letters bold
                single_item_div.innerHTML = "<strong>" + cities[i].substr(0, val.length) + "</strong>";
                //the rest of the letters are normal
                single_item_div.innerHTML += cities[i].substr(val.length); 
                
                //add input field that will hold the current items's value (the name of the city)
                single_item_div.innerHTML += "<input type='hidden' value='" + cities[i] + "'>";
                
                //close all autocomplete items (matching items) if someone click on the current item's value
                single_item_div.addEventListener("click", function(e) {
                    //insert the clicked item's value in the input text field
                    input.value = this.getElementsByTagName("input")[0].value;

                    //then close the list of all other autocomplete values (matching values)
                    closeAllLists();
                });

                //add the individual item's div element as a child of the autocomplete container
                all_items_div.appendChild(single_item_div);
            }
        }
    });

    //executed when a key is pressed
    input.addEventListener("keydown", function(pressed_key) 
    {
        var items = document.getElementById(this.id + "autocomplete-list");
        if (items) items = items.getElementsByTagName("div");

        //if the arrow DOWN is pressed
        if (pressed_key.keyCode == 40) 
        {
            //increase the currentFocus 
            //and make the current item active
            currentFocus++;
            addActive(items);
        }
        //if the arrow UP is pressed
        else if (pressed_key.keyCode == 38) 
        {
            //decrease the currentFocus 
            //and make the current item active
            currentFocus--;
            addActive(items);
        } 
        //if the ENTER key is pressed, prevent the form from being submitted
        else if (pressed_key.keyCode == 13) 
        {
            pressed_key.preventDefault();
            if (currentFocus > -1) 
            {
                //simulate click on the current "active" item
                if (items) items[currentFocus].click();
            }
        }
    });

    //classify and item as "active"
    function addActive(items) 
    {
        if (!items) return false; //no active items

        //remove the "active" class from all items
        removeActive(items);

        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (items.length - 1);

        //adding the "autocomplete-active" class
        items[currentFocus].classList.add("autocomplete-active");
    }

    //remove the "active" classe from all autocomplete items;
    function removeActive(autocomplete_active_items)
    {
        for (var i = 0; i < autocomplete_active_items.length; i++) 
        {
            autocomplete_active_items[i].classList.remove("autocomplete-active");
        }
    }

    //close all autocomplete lists
    //except the one passed as an argument
    function closeAllLists(element) 
    {
        var items = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < items.length; i++) {
            if (element != items[i] && element != input) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) 
    {
        closeAllLists(e.target);
    });
}

autocomplete(document.getElementById("myAuthor"), formatedDataAuthors);
autocomplete(document.getElementById("myBook"), formatedDataBooks);