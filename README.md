# Wikipedia Pseudocode Scraping App

![Pseudocode Scraper](https://github.com/Locrian24/pseudocode/blob/master/Pseudocode.png)

## Why
This project was my first experience of Javascript/Node.js development besides implementation of UI-based features.

As a way to familiarise myself with Vanilla JS AJAX requests and handling, I thought it'd be a fun project to work with Wikipedia's (_subjectively_) well-documented API. Being in an Algorithm and Data Structures class at the time, this seemed like the perfect functionality for a beginner project.

### How it works
This is a basic application that queries the Wikipedia API for a specific page based on user input. Once the desired page is chosen the page's HTML is scraped by a simple `<pre>` tag regex finder for all pseudocode segments. Due to multiple code segments possibly being on a single page, the total number is listed with an option to get the next code fragment.

