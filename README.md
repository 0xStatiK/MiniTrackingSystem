# MiniTrackingSystem
Personal project to build a webapp that allows the admin/user to add a queue of work.


Built using JS EC8, Node.js, and SQLite


HTML Tasks

    1. Create index.html

        1.1 Add DOCTYPE and HTML structure (html, head, body)

        1.2 Add header (<header>) with title ("Task Tracker")

        1.3 Add navigation (<nav>) for menu (Home, Tasks, Customers)

        1.4 Add main content (<main>) with task list section

        1.5 Add modal <div> for task creation/editing (hidden)

        1.6 Add footer (<footer>) with copyright

        1.7 Link CSS file (<link>) in <head>

        1.8 Link JavaScript file (<script>) at end of <body>

CSS Tasks

    2. Create css/style.css

        2.1 Style header (background, text alignment)

        2.2 Style navigation (flexbox for menu)

        2.3 Style task list (grid or table layout)

        2.4 Style modal (centered, hidden, overlay)

        2.5 Style form inputs in modal (task title, description, status)

        2.6 Style buttons (submit, cancel, add task)

        2.7 Add responsive design (media queries for mobile)

        2.8 Style footer (fixed bottom, centered)

JavaScript Tasks

    3. Create js/script.js

        3.1 Initialize SQLite database connection

        3.2 Fetch and display tasks from database

        3.3 Show/hide modal for task creation

        3.4 Handle form submission (add/edit task)

        3.5 Update task status

        3.6 Add event listeners for buttons ("Add Task", "Edit", "Delete")

        3.7 Use async/await for database queries (save, retrieve tasks)

        3.8 Add error handling (invalid form inputs)


HTML Tasks
The HTML is the skeleton of your web app, defining its structure. Since you already have index.html, a README.md, and a LICENSE, you’re ready to flesh out the page. Think about what your small business user (e.g., someone running a Warhammer 40k minis business) needs to see and interact with.

What should the basic structure of your index.html include?

Consider the essential HTML elements for any web page. What tags (<!DOCTYPE>, <html>, <head>, <body>) are necessary to ensure the page renders correctly? Why might including a <meta> tag for viewport settings be important for users on mobile devices?
What would a header section contribute to your app?

Imagine a user landing on your app. What kind of information (e.g., app name or logo) would help them immediately understand the app’s purpose? Should it be a simple title or include branding relevant to a small business?
How should navigation work for your app?

What menu options would make sense for a task tracker (e.g., Home, Tasks, Customers)? Would a <nav> element with links help users move between features? How could this improve usability for someone managing work requests?
What’s the core content area for displaying tasks?

Your app needs to show tasks (e.g., painting a Warhammer 40k model). Would a <main> section with a list or table make sense? How might you structure this to display task details like title, status, or due date?
Why include a modal in the HTML?

You mentioned a modal for task creation/editing. Why might embedding a <div> for the modal directly in the HTML (rather than creating it with JavaScript) simplify styling and scripting? What elements (e.g., form, buttons) would the modal need to collect task details?
What role could a footer play?

Could a <footer> with basic info (e.g., copyright or contact) add professionalism? How might this be useful for a small business owner?
How will you connect your HTML to other files?

What tags would you use to link your CSS and JavaScript files? Where in the HTML (e.g., <head> or <body>) should these go, and why might placement matter for performance?

CSS Tasks
CSS will make your app visually appealing and user-friendly. Since you’re building for a small business, the design should be clean and functional, reflecting the app’s purpose.

Where should you define your styles?

Should you create a separate style.css file in a css/ folder? Why might separating styles from HTML improve maintainability? How would you link this file to index.html?
How can you style the header to stand out?

What visual elements (e.g., background color, text alignment, padding) would make the header clear and professional? How could a consistent color scheme reflect the Warhammer 40k theme?
What’s the best way to style navigation?

How could a layout technique like flexbox make the navigation menu (e.g., Home, Tasks) look organized? Should the menu be horizontal or stacked on smaller screens?
How should the task list look visually?

Would a grid or table layout work better for displaying tasks? What styling (e.g., borders, spacing) would make tasks easy to scan for a busy small business owner?
What styling does the modal need?

How can you ensure the modal is centered and hidden by default? What properties (e.g., display: none, overlay background) would create a clean user experience when adding or editing tasks?
How will you style form inputs and buttons in the modal?

What visual cues (e.g., padding, borders, hover effects) would make form fields (task title, description) and buttons (submit, cancel) intuitive? How can you ensure they’re accessible?
Why consider responsive design?

How might media queries help your app look good on mobile devices? What elements (e.g., font sizes, layout) would need adjustment for a phone versus a desktop?
What should the footer’s style convey?

How could styling the footer (e.g., fixed position, subtle background) make it unobtrusive yet functional? Why might a minimalist design work here?

JavaScript Tasks
JavaScript (using ES8) will bring your app to life, handling tasks like database interactions and modal behavior. Since you’re using Node.js and SQLite, focus on functionality that supports task tracking.

How will you set up your JavaScript file?

Should you create a script.js file in a js/ folder? Why might organizing your JavaScript code here (and linking it in index.html) keep your project clean?
How will you connect to SQLite?

What steps are needed to initialize a connection to your SQLite database in Node.js? Why might the sqlite3 package be a good choice for this?
How can you display tasks dynamically?

What function would fetch tasks from SQLite and render them in the task list? How could ES8’s async/await make database queries easier to read and manage?
How will the modal work?

What function would show or hide the modal when users click “Add Task” or “Edit”? How might toggling a CSS class (e.g., show) simplify this?
How will you handle task creation or editing?

What logic is needed to process form submissions in the modal? How can you use ES8’s async/await to save task data to SQLite?
How can you update task statuses?

What function would let users change a task’s status (e.g., “In Progress” to “Completed”)? How would you ensure this updates the database and UI?
What events need listeners?

Which buttons (e.g., “Add Task”, “Edit”, “Delete”) need event listeners? How would you structure these to keep your code organized?
Why include error handling?

What kinds of errors (e.g., invalid form inputs, database failures) might occur? How could you display user-friendly messages to handle these gracefully?


        