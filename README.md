# GizmoTools

Welcome to **GizmoTools**! This web app is hosted on GitHub Pages and provides a dynamic, interactive table of tools and their availability sourced from a Google Sheet. The application includes search and room sorting features and updates every 2 hours to reflect the current data in the spreadsheet.

## Overview

- **Hosted On:** [GitHub Pages](https://gizmo193.github.io/GizmoTools/)
- **Data Source:** Google Sheets via [SheetDB](https://sheetdb.io/)
- **Update Frequency:** Every 2 hours via GitHub Actions to meet SheetDB's request limit

## Features

- **Automatic Button Updates:** Buttons update automatically to match the rooms listed in the spreadsheet.
- **Search and Sorting:** Easily search and sort rooms.
- **Emoji Support:** Emojis can be added to room buttons and the table for a more visual design.

## How it Works
1. **Updates Regularly** Github Actions uses curl to make a get request to the SheetDB.io endpoint and saves it as a data.json file in the repository
2. **Data is Parsed** The data from data.json is parsed by script.js to be added dynamically to the webpage table.
3. **Fields are Hidden** Certain fields like "Shown/Hidden" are hidden from view as it is supposed to be on the backend only.
## Maintenance

### Adding a Room

1. **Update the Spreadsheet:**
   - Add the new room to the Google Sheet.

2. **Add Emoji:**
   - Include an emoji in the corresponding cell of the spreadsheet to ensure design consistency.

### Customizing the Table

The appearance and functionality of the table can be customized by modifying constants in the `script.js` file. 

#### Constants in `script.js`

- **`useRoomButtonEmojis`:** Controls whether emojis are displayed on the room buttons.
- **`useTableEmojis`:** Controls whether emojis are used in the table.
- **`useRoomButtonIcons`:** Controls whether FontAwesome Icons are used on the buttons.
- **`useTableIcons`:** Controls whether FontAwesome Icons are used in the table.
- **`displayedFields`:** Controls which fields/columns are shown in the table. For example, if a new field named "Uptime" is added, update the `displayedFields` array to include `"Uptime"`.

### Example

To display a new field called "Uptime" in the table, update the `displayedFields` constant in `script.js`:

```javascript
let displayedFields = ['Tool Name', 'Type', 'Room', 'Availability', 'Uptime'];
```
