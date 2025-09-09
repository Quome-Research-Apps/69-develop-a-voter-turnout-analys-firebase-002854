# **App Name**: Turnout Vision

## Core Features:

- CSV Data Import: Enable users to upload a CSV file containing precinct-level election results including precinct_id, total_registered_voters, votes_cast, and a geojson_boundary field.
- Interactive Choropleth Map: Display a geographic map with precinct boundaries, color-coded by voter turnout percentage, based on uploaded data. Tooltips show precinct ID and turnout percentage on hover.
- Turnout Distribution Analysis: Generates a histogram to visualize the distribution of voter turnout percentages across all precincts using the loaded data.
- Highest and Lowest Turnout Precincts: Generate a bar chart displaying the top 5 and bottom 5 precincts by voter turnout, based on uploaded data.
- Data Filtering: Allow filtering of data displayed on the map and charts based on fields within the CSV file.
- AI insights: Leverage generative AI to act as a tool, scanning and generating insights based on precinct-level voter turnout data such as unexpected behavior

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to represent trust and civic duty.
- Background color: Light gray (#F5F5F5) for a clean, neutral backdrop.
- Accent color: Bright orange (#FF9800) for highlighting key data points and interactive elements.
- Body and headline font: 'PT Sans', a modern, humanist sans-serif font known for clarity and readability.
- Use simple, geometric icons to represent different data filters and interactive elements.
- Divide the dashboard into logical sections, with the map taking central prominence and charts positioned to provide supporting data.
- Use subtle animations to highlight data changes upon filtering, enhancing user engagement without being distracting.