const dataUrl = 'data.json';

//Use this to control whether emojis are displayed
const useRoomButtonEmojis = false;
const useTableEmojis = true;
const useFontAwesomeIcons = true;


//Use this to control which fields are displayed on the table.
//Default: ['Tool Name', 'Type', 'Room', 'Availability']
let displayedFields = ['Tool Name', 'Type', 'Room', 'Availability'];

const allButtonHTML = () => {
    if (useRoomButtonEmojis) {
        console.log("Using Room Button Emojis")
        return `<div style="font-size: 2em; line-height: 1;">&#x1F3E0;</div><div>All</div>`
    } else if (!useRoomButtonEmojis) {
        if (useFontAwesomeIcons) {
            return `<div style="font-size: 2em; line-height: 1;"><i class="fa-solid fa-house"></i></div><div>All</div>`
        } else {
            return `<div>All</div>`
        }
    }
}

const fontIcon = (room) => {
    let iconClass;
    switch (room) {
        case 'claystudio':
            iconClass = '<i class="fa-solid fa-fire"></i>'
            break;
        case 'creativeartslab':
            iconClass = '<i class="fa-solid fa-palette"></i>'
            break;
        case 'electronicslab':
            iconClass = '<i class="fa-solid fa-bolt"></i>'
            break;
        case 'foundry/forge':
            iconClass = '<i class="fa-solid fa-weight-hanging"></i>'
            break;
        case 'jewelry&lapidary':
            iconClass = '<i class="fa-solid fa-gem"></i>'
            break;
        case 'lasercutters':
            iconClass = '<i class="fa-solid fa-lightbulb"></i>'
            break;
        case 'metalshop':
            iconClass = '<i class="fa-solid fa-screwdriver-wrench"></i>'
            break;
        case 'weldingshop':
            iconClass = '<i class="fa-solid fa-gears"></i>'
            break;
        case 'woodshop':
            iconClass = '<i class="fa-solid fa-tree"></i>'
            break;
    }
    return iconClass;
}

console.log('Script started');

// Function to check if Type should be displayed
function shouldDisplayType() {
    return window.innerWidth > 768;
}

// Function to update displayedFields based on screen size
function updateDisplayedFields() {
    const isTypeDisplayed = shouldDisplayType();
    if (!isTypeDisplayed && displayedFields.includes("Type")) {
        displayedFields = displayedFields.filter(field => field !== "Type");
    } else if (isTypeDisplayed && !displayedFields.includes("Type")) {
        displayedFields = ['Tool Name', 'Type', 'Room', 'Availability'];
    }
}

// Function to toggle the visibility of the "Type" column
function toggleTypeColumn() {
    updateDisplayedFields();
    const typeHeaders = document.querySelectorAll('th, td');
    const isTypeDisplayed = shouldDisplayType();

    typeHeaders.forEach((element, index) => {
        if (element.textContent === "Type" || (element.parentElement.children[1] === element && !isTypeDisplayed)) {
            if (isTypeDisplayed) {
                element.classList.remove('hide-on-mobile');
            } else {
                element.classList.add('hide-on-mobile');
            }
        }
    });
}

// Call the function on page load and window resize
window.addEventListener('load', toggleTypeColumn);
window.addEventListener('resize', toggleTypeColumn);

// Fetch data from the API
fetch(dataUrl)
    .then(response => {
        console.log('Fetch response received:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data parsed:', data);

        // Sort data by 'Room' and then by 'Type' if it exists
        data.sort((a, b) => {
            if (a.Room < b.Room) return -1;
            if (a.Room > b.Room) return 1;
            if (a.Type && b.Type) {
                if (a.Type < b.Type) return -1;
                if (a.Type > b.Type) return 1;
            }
            return 0;
        });

        console.log('Data sorted');

        // Filter out rows where 'Shown/Hidden' is 'Hidden'
        const visibleData = data.filter(item => item['Shown/Hidden'].toLowerCase() !== 'hidden');
        console.log('Filtered data:', visibleData);

        // Group data by 'Room'
        const roomGroups = d3.group(visibleData, d => d.Room);
        console.log('Room groups:', roomGroups);

        // Create a tool name search function
        function filterDataByTool(searchTerm) {
            return visibleData.filter(item =>
                item['Tool Name'] && String(item['Tool Name']).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Prepare the button container
        const buttonContainer = d3.select("#button-container");
        console.log('Button container selected:', buttonContainer.node());

        // Add a button to show all data
        buttonContainer.append("button")
            .attr("id", "all-button")
            .attr("class", "room-button selected") // Pre-select the "All" button
            .html(allButtonHTML)
            .on("click", function() {
                console.log('All button clicked');
                // Remove 'selected' class from all buttons
                buttonContainer.selectAll("button").classed('selected', false);
                // Add 'selected' class to the 'All' button
                d3.select(this).classed('selected', true);
                updateTable(visibleData);
            });

        console.log('All button added');

        // Add buttons for each room
        const roomKeys = [...roomGroups.keys()];
        console.log('Room keys:', roomKeys); // Log all room keys to check

        buttonContainer.selectAll("button.room-button:not(#all-button)")
            .data(roomKeys)
            .join("button")
            .attr("class", "room-button")
            .html(d => {
                console.log('Creating button for room:', d); // Log each room being processed
                const match = d.match(/(.*?)(\p{Emoji_Presentation})/u);
                if (useRoomButtonEmojis) {
                    if (match) {
                        if(useFontAwesomeIcons) {
                            return `<div style="font-size: 2em; line-height: 1;">${fontIcon(match[1].toLowerCase().replaceAll(" ", ""))}</div><div>${match[1]}</div>`
                        }
                        return `<div style="font-size: 2em; line-height: 1;">${match[2]}</div><div>${match[1]}</div>`;
                    } else {
                        return d; // If no emoji is found, just return the room name
                    }
                } else {
                    return `<div>${match[1]}</div>`
                }
            })
            .on("click", function(_event, d) {
                console.log('Room button clicked:', d);
                // Remove 'selected' class from all buttons
                buttonContainer.selectAll("button").classed('selected', false);
                // Add 'selected' class to the clicked button
                d3.select(this).classed('selected', true);
                const filteredData = roomGroups.get(d);
                updateTable(filteredData);
            });

        console.log('Room buttons added');

        // Function to update table
        function updateTable(data) {
            console.log('Updating table with data:', data);

            // Remove old table if it exists
            d3.select("#table-container").select("table").remove();
            console.log('Old table removed');

            // Remove old "No data available" message if it exists
            d3.select("#table-container").select("p.no-data-message").remove();
            console.log('Old "No data available" message removed');

            if (data.length === 0) {
                // Show a message if no data is available
                d3.select("#table-container").append("p")
                    .attr("class", "no-data-message") // Add a class to identify this message
                    .text("No data available. Check your search term.");
                console.log('No data available');
                return;
            }

            // Update displayedFields before creating the table
            updateDisplayedFields();

            // Create a new table
            const table = d3.select("#table-container").append("table")
                .attr("class", "table-pop-in"); // Add the animation class here
            const thead = table.append("thead");
            const tbody = table.append("tbody");

            console.log('New table created');

            // Set headers to displayedFields for code readability
            const headers = displayedFields;

            // Append header row
            thead.append("tr")
                .selectAll("th")
                .data(headers)
                .enter()
                .append("th")
                .text(d => d);

            console.log('Header row appended');

            // Append rows
            const rows = tbody.selectAll("tr")
                .data(data)
                .enter()
                .append("tr");

            console.log('Table rows appended');

            // Append cells to rows
            rows.selectAll("td")
                .data(d => headers.map(header => ({ header, value: d[header] })))
                .enter()
                .append("td")
                .each(function(d) {
                    if (d.header === "Availability") {
                        const cell = d3.select(this);
                        const value = String(d.value).toLowerCase().trim();
                        console.log('Available cell value:', value);
                        if (value === 'available') {
                            cell.classed('available', true);
                        } else if (value === 'staff only') {
                            cell.classed('staff-only', true);
                        } else if (value === 'unavailable') {
                            cell.classed('unavailable', true);
                        }
                    }
                    if (!useTableEmojis && d.header === "Room") {
                        const value = String(d.value);
                        const match = value.match(/^[\p{L}\s]+/u);
                        const textOnly = match ? match[0].trim() : '';
                        d.value = textOnly; // Assign the new value to d.value
                    }
                })
                .text(d => d.value);

            console.log('Table cells appended and classes set');

            // Apply the toggle function after creating the table
            toggleTypeColumn();

            // Remove the table-pop-in class after animation ends to allow re-triggering
            table.on('transitionend', function() {
                d3.select(this).classed('table-pop-in', false);
            });
        }

        // Initialize the table with all visible data
        updateTable(visibleData);

        // Search functionality
        d3.select("#search-input").on("input", function() {
            const searchTerm = this.value;
            console.log('Search term:', searchTerm);
            const filteredData = filterDataByTool(searchTerm);

            // Trigger click on the "All" button to reset the filter and show all data
            d3.select("#all-button").dispatch("click");

            // Update the table with the filtered data
            updateTable(filteredData);
        });

        console.log('Script end reached');
    })
    .catch(error => console.error('Error in script:', error));