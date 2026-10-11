# Sales Analytics Dashboard

An interactive dashboard for exploring sales performance through key metrics, data visualizations, and interactive filters.

## Overview

**Sales Analytics Dashboard** is a data analysis and visualization project developed as part of the **Data AI Agent for Data Analysis program with Hacktiv8**.

The project aims to present sales data in an interactive and accessible format, helping users explore sales performance across different regions, product categories, customer types, sales channels, and other business dimensions.

The dashboard provides key performance indicators (KPIs) and visualizations to support exploratory sales analysis and make data patterns easier to understand.

## Features

### Key Performance Indicators (KPIs)
- **Total Revenue** — summarizes the total sales revenue.
- **Total Transactions** — displays the number of sales transactions.
- **Total Quantity Sold** — summarizes the quantity of products sold.
- **Average Discount** — presents the average discount value.

### Interactive Filters
Users can filter the dashboard by:
- Region
- Product Category
- Customer Type
- Sales Channel

### Data Visualizations
The dashboard includes visualizations for:
- Sales trends over time.
- Revenue by region.
- Revenue by product category.
- Sales performance by sales representative.
- Sales distribution by customer type.
- Sales distribution by payment method.
- Sales distribution by sales channel.
- Discount versus sales analysis.
- Top 10 highest sales transactions.
- Quantity sold by product category.

## Tools and Technologies

- **HTML** — structures the dashboard interface.
- **CSS** — styles the dashboard layout and visual appearance.
- **JavaScript** — implements dashboard logic, interactivity, and data visualizations.
- **CSV and JSON** — store the sales dataset used by the dashboard.
- **IBM Bob** — used as an AI coding assistant during development.
- **Git and GitHub** — used for version control and project documentation.

## Project Structure

```text
Sales-Analytics-Dashboard/
├── 200_sales_data.csv
├── index.html
├── sales_data.json
├── script.js
├── style.css
└── README.md
```

| File | Description |
|---|---|
| `200_sales_data.csv` | Sales dataset in CSV format. |
| `index.html` | Main structure of the dashboard. |
| `sales_data.json` | Sales data in JSON format. |
| `script.js` | JavaScript code for dashboard functionality and interactivity. |
| `style.css` | Styles and layout of the dashboard. |
| `README.md` | Project documentation and setup instructions. |

## How to Run the Dashboard

### Prerequisites
- A modern web browser, such as Google Chrome.
- Python installed on your computer to run a local HTTP server.

### Steps

1. Clone or download this repository.
2. Open the project folder in a terminal or code editor.
3. Start a local HTTP server by running:

   ```bash
   python -m http.server 8080
   ```

4. Open the following address in your browser:

   ```text
   http://localhost:8080
   ```

5. Explore the dashboard and interact with the available filters.

**Note:** Keep the terminal running while using the dashboard. Stop the server by pressing `Ctrl + C` in the terminal when you are finished.

## Program and Development Context

This project was developed as part of the **Data AI Agent for Data Analysis program with Hacktiv8**.

IBM Bob was used as an AI coding assistant to support the coding and dashboard development process. The project also serves as a learning exercise in data analysis, data visualization, and interactive dashboard development.

## Learning Objectives

Through this project, the intended learning objectives include:

- Presenting sales data through KPIs and visualizations.
- Exploring sales performance across different business dimensions.
- Building interactive filters for data exploration.
- Developing a web-based dashboard using HTML, CSS, and JavaScript.
- Practicing project documentation and version control with GitHub.
- Using AI-assisted coding tools as part of the development workflow.

## Data and Limitations

The dashboard is intended for exploratory analysis of the provided sales dataset. The reliability of its findings depends on the quality of the underlying data and the correctness of the calculations implemented in the dashboard.

The dataset and dashboard calculations should be checked before the results are used to support actual business decisions.

## Acknowledgment

Developed as part of the **Data AI Agent for Data Analysis program with Hacktiv8**, with IBM Bob used as an AI coding assistant.

---

*This project is part of my learning journey in data analysis and data visualization.*
