// Web Development course. Paragraph markup: `code`, **bold**, and lines starting "- " become lists.
export default [
  {
    slug: "how-the-web-works",
    title: "How the Web Works",
    module: "Foundations",
    duration: 10,
    summary: "What actually happens between typing a URL and seeing a page: clients, servers, DNS and HTTP.",
    sections: [
      {
        heading: "Clients and servers",
        paragraphs: [
          "Every website you visit is a conversation between two computers. Your browser is the **client**: it asks for things. A **server** is a computer somewhere else that listens for those requests and sends back responses: HTML pages, images, JSON data and more.",
          "Web development is the craft of building both sides of that conversation. **Frontend** developers build what runs in the browser. **Backend** developers build what runs on the server. Full-stack developers do both.",
        ],
      },
      {
        heading: "From a URL to a page",
        paragraphs: [
          "When you type `https://notequest.in/blog` and press Enter, roughly this happens:",
          "- The browser asks **DNS** (the internet's phone book) for the IP address of `notequest.in`.\n- It opens a secure connection to that IP address using **TLS** (the \"s\" in https).\n- It sends an **HTTP request**: `GET /blog`.\n- The server responds with a **status code** (like `200 OK`) and the HTML.\n- The browser reads the HTML, then requests the CSS, JavaScript and images it references.\n- Finally it lays out and paints the page on your screen.",
          "All of this usually takes well under a second, and understanding it helps you debug slow pages, broken links and failed API calls.",
        ],
      },
      {
        heading: "What an HTTP request looks like",
        paragraphs: [
          "HTTP is plain text. A request has a **method** (what you want to do), a **path** (which resource), **headers** (extra information) and sometimes a **body** (data you're sending).",
        ],
        code: `GET /api/posts HTTP/1.1
Host: notequest.in
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{ "posts": [ { "title": "SQL Basics" } ] }`,
        language: "HTTP",
      },
      {
        heading: "The three languages of the browser",
        paragraphs: [
          "Browsers understand three core languages, each with one job:",
          "- **HTML** gives a page its structure and meaning (headings, paragraphs, links, forms).\n- **CSS** controls presentation (colours, spacing, layout, animation).\n- **JavaScript** adds behaviour (reacting to clicks, fetching data, updating the page).",
          "Everything else, including React, Tailwind and Next.js, is built on top of these three. That's why this course starts with them.",
        ],
      },
    ],
    keyPoints: [
      "The browser (client) sends requests; servers send responses.",
      "DNS turns a domain name into an IP address.",
      "HTTP requests have a method, path, headers and an optional body.",
      "HTML = structure, CSS = presentation, JavaScript = behaviour.",
    ],
  },
  {
    slug: "html-fundamentals",
    title: "HTML Fundamentals",
    module: "Foundations",
    duration: 15,
    summary: "Write well-structured, semantic HTML documents with headings, links, images and forms.",
    sections: [
      {
        heading: "Elements and tags",
        paragraphs: [
          "HTML is made of **elements**. Most elements have an opening tag, content, and a closing tag: `<p>Hello</p>`. Some elements are empty and have no closing tag, like `<img>` and `<br>`.",
          "Elements can have **attributes** that give extra information, written inside the opening tag: `<a href=\"/blog\">Blog</a>`.",
        ],
      },
      {
        heading: "The skeleton of every page",
        paragraphs: ["Every HTML document follows the same basic structure. The `<head>` holds information about the page; the `<body>` holds what people see."],
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, web!</h1>
    <p>This is my first web page.</p>
  </body>
</html>`,
        language: "HTML",
      },
      {
        heading: "Semantic HTML",
        paragraphs: [
          "**Semantic** elements describe what content *is*, not how it looks. Screen readers, search engines and other developers all rely on this meaning.",
          "- `<header>`, `<nav>`, `<main>`, `<footer>`: the big regions of a page.\n- `<article>` for self-contained content, `<section>` for a themed group.\n- `<h1>`–`<h6>` for headings, in order. Use one `<h1>` per page.\n- `<button>` for actions, `<a>` for navigation.",
          "A common beginner mistake is building everything out of `<div>`. It works visually, but the page loses its meaning and becomes harder to use with a keyboard or screen reader.",
        ],
      },
      {
        heading: "Links, images and forms",
        paragraphs: ["These three elements do most of the work on real websites. Always give images an `alt` description, and always connect form inputs to a `<label>`."],
        code: `<a href="https://developer.mozilla.org">Read the MDN docs</a>

<img src="/images/cat.jpg" alt="A ginger cat sleeping on a laptop" />

<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />
  <button type="submit">Subscribe</button>
</form>`,
        language: "HTML",
      },
    ],
    keyPoints: [
      "Elements = tags + content; attributes add extra information.",
      "Use semantic elements (header, nav, main, article, footer) instead of only divs.",
      "Every image needs meaningful alt text; every input needs a label.",
      "Keep headings in order and use a single h1 per page.",
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS Fundamentals",
    module: "Foundations",
    duration: 15,
    summary: "Selectors, the box model, colours and typography: the core of styling any page.",
    sections: [
      {
        heading: "How CSS works",
        paragraphs: [
          "CSS is a list of **rules**. Each rule has a **selector** (which elements) and **declarations** (what to change).",
          "When several rules target the same element, the browser decides which wins using **specificity** (IDs beat classes, classes beat element names) and **order** (later rules win ties).",
        ],
        code: `/* selector    { property: value; } */
p              { color: #334155; line-height: 1.7; }
.card          { padding: 24px; border-radius: 16px; }
#hero-title    { font-size: 3rem; }
nav a:hover    { color: #2563eb; }`,
        language: "CSS",
      },
      {
        heading: "The box model",
        paragraphs: [
          "Every element is a rectangular box made of four layers, from inside out: **content**, **padding**, **border** and **margin**.",
          "By default, `width` only measures the content, which makes sizes confusing. Almost every modern project starts with this rule so that padding and border are included in the width:",
        ],
        code: `*, *::before, *::after {
  box-sizing: border-box;
}`,
        language: "CSS",
      },
      {
        heading: "Units, colours and typography",
        paragraphs: [
          "- `px` is a fixed size. Good for borders and small details.\n- `rem` is relative to the root font size. Use it for font sizes and spacing so the page respects the user's settings.\n- `%`, `vw` and `vh` are relative to the parent or the viewport.",
          "Colours can be written as hex (`#2563eb`), `rgb()`, or `hsl()`. Pick a small palette and reuse it with **CSS custom properties**:",
        ],
        code: `:root {
  --primary: #2563eb;
  --text: #0f172a;
}

.button {
  background: var(--primary);
  color: white;
  font: 600 1rem/1.5 system-ui, sans-serif;
  padding: 0.75rem 1.25rem;
}`,
        language: "CSS",
      },
    ],
    keyPoints: [
      "A CSS rule = selector + declarations.",
      "Specificity and source order decide which rule wins.",
      "Use box-sizing: border-box everywhere.",
      "Prefer rem for type and spacing; store colours in custom properties.",
    ],
  },
  {
    slug: "css-layout-flexbox-grid",
    title: "Layout with Flexbox and Grid",
    module: "Foundations",
    duration: 20,
    summary: "Build real layouts like navbars, card grids and page shells using Flexbox and CSS Grid.",
    sections: [
      {
        heading: "Flexbox: layout in one direction",
        paragraphs: [
          "Flexbox arranges items in a **row** or a **column**. It's perfect for navbars, toolbars, and centering things.",
          "Set `display: flex` on the **parent**. Then `justify-content` controls the main axis and `align-items` controls the cross axis.",
        ],
        code: `.navbar {
  display: flex;
  justify-content: space-between; /* logo left, links right */
  align-items: center;            /* vertically centered */
  gap: 1rem;
}

.center-anything {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
        language: "CSS",
      },
      {
        heading: "Grid: layout in two dimensions",
        paragraphs: [
          "CSS Grid places items in **rows and columns** at the same time. It's the best tool for card galleries and whole-page layouts.",
          "The `fr` unit means \"a fraction of the free space\". Combined with `repeat()` and `minmax()`, you can build a responsive card grid in one line, without media queries.",
        ],
        code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.page {
  display: grid;
  grid-template-columns: 240px 1fr; /* sidebar + content */
  min-height: 100vh;
}`,
        language: "CSS",
      },
      {
        heading: "Choosing between them",
        paragraphs: [
          "- Content flowing in a **line** (buttons, nav links, a row of tags)? Use **Flexbox**.\n- A **grid** of things, or a layout with rows *and* columns? Use **Grid**.\n- It's normal to nest them: a Grid page layout whose header uses Flexbox.",
          "Use `gap` instead of margins between items. It only adds space *between* children, so you never fight with extra space at the edges.",
        ],
      },
    ],
    keyPoints: [
      "Flexbox is one-dimensional; Grid is two-dimensional.",
      "justify-content = main axis, align-items = cross axis.",
      "repeat(auto-fill, minmax(260px, 1fr)) gives a responsive grid with no media queries.",
      "Use gap for spacing between items.",
    ],
  },
  {
    slug: "responsive-design",
    title: "Responsive Design",
    module: "Foundations",
    duration: 15,
    summary: "Make one website work beautifully on phones, tablets and desktops.",
    sections: [
      {
        heading: "Mobile-first thinking",
        paragraphs: [
          "More than half of web traffic comes from phones. **Mobile-first** means you write the base styles for small screens, then add styles for larger screens as they have more room.",
          "Start every page with the viewport meta tag. Without it, phones pretend to be desktops and shrink your page:",
        ],
        code: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
        language: "HTML",
      },
      {
        heading: "Media queries",
        paragraphs: ["A media query applies CSS only when a condition is true, usually a minimum width. These widths are called **breakpoints**."],
        code: `.grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}`,
        language: "CSS",
      },
      {
        heading: "Fluid by default",
        paragraphs: [
          "The best responsive designs need few breakpoints because they're fluid:",
          "- Images: `max-width: 100%; height: auto;` so they never overflow.\n- Type: `font-size: clamp(1.75rem, 4vw, 3rem);` scales smoothly between a minimum and maximum.\n- Containers: `width: min(1200px, 100% - 2rem);` gives a centered page with side gutters.",
          "Always test with real devices or your browser's device toolbar, and check that nothing scrolls sideways.",
        ],
      },
    ],
    keyPoints: [
      "Always include the viewport meta tag.",
      "Write mobile styles first, then add min-width media queries.",
      "Fluid images, clamp() for type, and min() for containers reduce breakpoints.",
      "Test on real screen sizes and avoid horizontal scrolling.",
    ],
  },
  {
    slug: "javascript-basics",
    title: "JavaScript Basics",
    module: "JavaScript",
    duration: 25,
    summary: "Variables, types, functions, arrays and objects: the language that makes the web interactive.",
    sections: [
      {
        heading: "Variables and types",
        paragraphs: [
          "Use `const` for values that won't be reassigned and `let` for values that will. Avoid the old `var`.",
          "JavaScript's main types are `string`, `number`, `boolean`, `null`, `undefined`, `object` (including arrays) and `function`.",
        ],
        code: `const name = "Asha";        // string
let score = 0;               // number
const isLoggedIn = true;     // boolean

score = score + 10;
console.log(\`\${name} has \${score} points\`); // template literal`,
        language: "JavaScript",
      },
      {
        heading: "Functions",
        paragraphs: ["Functions package logic you can reuse. Arrow functions are a shorter syntax you'll see everywhere in modern code."],
        code: `function greet(person) {
  return \`Hello, \${person}!\`;
}

const add = (a, b) => a + b;

greet("Ravi"); // "Hello, Ravi!"
add(2, 3);     // 5`,
        language: "JavaScript",
      },
      {
        heading: "Arrays and objects",
        paragraphs: [
          "Arrays hold ordered lists; objects hold named properties. Most real data, like an API response, is a mix of both.",
          "The array methods `map`, `filter` and `find` replace most manual loops and make code easier to read.",
        ],
        code: `const lessons = [
  { title: "HTML", minutes: 15, done: true },
  { title: "CSS", minutes: 20, done: false },
  { title: "JavaScript", minutes: 25, done: false },
];

const titles = lessons.map((l) => l.title);          // ["HTML", "CSS", "JavaScript"]
const remaining = lessons.filter((l) => !l.done);    // CSS, JavaScript
const totalMinutes = lessons.reduce((sum, l) => sum + l.minutes, 0); // 60`,
        language: "JavaScript",
      },
      {
        heading: "Making decisions",
        paragraphs: ["Use `if`/`else` for branches and always compare with `===` (strict equality), which never converts types behind your back."],
        code: `if (totalMinutes > 45) {
  console.log("Grab a coffee first ☕");
} else {
  console.log("Quick session!");
}

0 == "0";  // true  (type coercion - avoid)
0 === "0"; // false (what you usually want)`,
        language: "JavaScript",
      },
    ],
    keyPoints: [
      "Prefer const; use let only when you reassign.",
      "Functions (including arrow functions) package reusable logic.",
      "map, filter, find and reduce replace most loops.",
      "Always use === for comparisons.",
    ],
  },
  {
    slug: "dom-and-events",
    title: "The DOM and Events",
    module: "JavaScript",
    duration: 20,
    summary: "Select elements, change the page, and respond to clicks and input with JavaScript.",
    sections: [
      {
        heading: "What is the DOM?",
        paragraphs: [
          "When the browser reads your HTML, it builds a tree of objects called the **Document Object Model**. JavaScript can read and change this tree, and the page updates instantly.",
        ],
      },
      {
        heading: "Selecting and changing elements",
        paragraphs: ["`document.querySelector` takes any CSS selector and returns the first match. `querySelectorAll` returns all matches."],
        code: `const title = document.querySelector("h1");
title.textContent = "Welcome back!";

const card = document.querySelector(".card");
card.classList.add("highlight");

const items = document.querySelectorAll("li");
items.forEach((li) => (li.style.fontWeight = "600"));`,
        language: "JavaScript",
      },
      {
        heading: "Listening for events",
        paragraphs: [
          "Events are things that happen: clicks, key presses, form submissions, scrolling. Attach a **listener** with `addEventListener`.",
          "For forms, call `event.preventDefault()` to stop the browser from reloading the page so that you can handle the data yourself.",
        ],
        code: `<button id="like">❤️ 0</button>

<script>
  let likes = 0;
  const button = document.querySelector("#like");

  button.addEventListener("click", () => {
    likes += 1;
    button.textContent = \`❤️ \${likes}\`;
  });
</script>`,
        language: "HTML",
      },
      {
        heading: "Creating elements",
        paragraphs: ["You can build new elements and insert them. This is exactly what frameworks like React automate for you."],
        code: `const list = document.querySelector("#todos");
const form = document.querySelector("#todo-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  const li = document.createElement("li");
  li.textContent = input.value;
  list.append(li);
  input.value = "";
});`,
        language: "JavaScript",
      },
    ],
    keyPoints: [
      "The DOM is the browser's live tree of your HTML.",
      "querySelector / querySelectorAll select elements with CSS selectors.",
      "addEventListener reacts to user actions.",
      "preventDefault stops forms from reloading the page.",
    ],
  },
  {
    slug: "async-javascript-fetch",
    title: "Async JavaScript and Fetch",
    module: "JavaScript",
    duration: 20,
    summary: "Load data from APIs with promises, async/await and the fetch function.",
    sections: [
      {
        heading: "Why asynchronous?",
        paragraphs: [
          "Requests over the network take time. If JavaScript waited for every request, the whole page would freeze. Instead, slow operations return a **Promise**: an object representing a value that will arrive later.",
        ],
      },
      {
        heading: "async / await",
        paragraphs: ["`async` functions let you write asynchronous code that reads top-to-bottom. `await` pauses *that function only* until the promise settles, and the rest of the page keeps working."],
        code: `async function loadPosts() {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  const data = await response.json();
  return data.posts;
}`,
        language: "JavaScript",
      },
      {
        heading: "Handling errors and loading states",
        paragraphs: [
          "Networks fail. Wrap calls in `try`/`catch`, and always show the user what's happening: loading, success, or an error they can act on.",
        ],
        code: `const status = document.querySelector("#status");

try {
  status.textContent = "Loading…";
  const posts = await loadPosts();
  status.textContent = \`Loaded \${posts.length} posts\`;
} catch (error) {
  status.textContent = "Couldn't load posts. Check your connection.";
}`,
        language: "JavaScript",
      },
      {
        heading: "Sending data",
        paragraphs: ["To create or update data, pass a method, headers and a JSON body to `fetch`."],
        code: `await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Flexbox", body: "justify-content = main axis" }),
});`,
        language: "JavaScript",
      },
    ],
    keyPoints: [
      "Slow work returns a Promise instead of blocking the page.",
      "async/await makes asynchronous code read like normal code.",
      "Check response.ok; fetch only throws on network failure.",
      "Always design loading and error states.",
    ],
  },
  {
    slug: "git-and-github",
    title: "Git and GitHub",
    module: "Modern Frontend",
    duration: 15,
    summary: "Track changes, work on branches, and collaborate with pull requests.",
    sections: [
      {
        heading: "Why version control?",
        paragraphs: [
          "Git records snapshots of your project called **commits**. You can see what changed, go back in time, and work on features without breaking the main version. GitHub hosts Git repositories online so teams can collaborate.",
        ],
      },
      {
        heading: "The everyday workflow",
        paragraphs: ["Most days you'll only use a handful of commands:"],
        code: `git init                       # start tracking a project
git status                     # what changed?
git add index.html styles.css  # stage files for the next commit
git commit -m "Add hero section"
git log --oneline              # history

git remote add origin https://github.com/you/portfolio.git
git push -u origin main        # upload to GitHub`,
        language: "Shell",
      },
      {
        heading: "Branches and pull requests",
        paragraphs: [
          "A **branch** is a separate line of work. Create one per feature, then open a **pull request (PR)** on GitHub so someone can review it before it's merged into `main`.",
        ],
        code: `git switch -c feature/dark-mode   # create + move to a branch
# ...edit files, commit...
git push -u origin feature/dark-mode
# open a pull request on GitHub, get a review, merge`,
        language: "Shell",
      },
      {
        heading: "Good habits",
        paragraphs: [
          "- Commit small, focused changes with clear messages (\"Fix mobile nav overflow\", not \"stuff\").\n- Never commit secrets. Add `.env` to `.gitignore`.\n- Pull before you start working: `git pull`.",
        ],
      },
    ],
    keyPoints: [
      "A commit is a snapshot; history lets you undo and compare.",
      "add → commit → push is the daily loop.",
      "Use a branch per feature and merge through pull requests.",
      "Keep secrets out of Git with .gitignore.",
    ],
  },
  {
    slug: "react-fundamentals",
    title: "React Fundamentals",
    module: "Modern Frontend",
    duration: 25,
    summary: "Components, props, state and effects: build interfaces from reusable pieces.",
    sections: [
      {
        heading: "Thinking in components",
        paragraphs: [
          "React lets you describe your UI as a tree of **components**: small, reusable functions that return markup (written in **JSX**). When data changes, React updates the page for you, with no manual DOM work.",
        ],
        code: `function LessonCard({ title, minutes }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{minutes} min read</p>
    </article>
  );
}`,
        language: "JSX",
      },
      {
        heading: "Props: passing data down",
        paragraphs: ["Props are a component's inputs. Parents pass them down, much like HTML attributes. Rendering a list? Use `map` and give each item a stable `key`."],
        code: `function LessonList({ lessons }) {
  return (
    <div className="grid">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.slug} title={lesson.title} minutes={lesson.duration} />
      ))}
    </div>
  );
}`,
        language: "JSX",
      },
      {
        heading: "State: data that changes",
        paragraphs: ["`useState` gives a component memory. Calling the setter re-renders the component with the new value."],
        code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
        language: "JSX",
      },
      {
        heading: "Effects: syncing with the outside world",
        paragraphs: [
          "`useEffect` runs code after rendering. Use it to connect to things outside React, such as a timer, a subscription, or the browser's title.",
          "Don't reach for effects to transform data. If a value can be calculated from props or state, calculate it during render.",
        ],
        code: `useEffect(() => {
  document.title = \`\${count} clicks\`;
}, [count]); // re-run only when count changes`,
        language: "JSX",
      },
    ],
    keyPoints: [
      "Components are functions that return JSX.",
      "Props flow down from parent to child.",
      "useState stores values that change and triggers re-renders.",
      "useEffect is for syncing with external systems, not for computing values.",
    ],
  },
  {
    slug: "node-express-apis",
    title: "Building APIs with Node and Express",
    module: "Backend",
    duration: 25,
    summary: "Create a REST API that serves JSON, handles routes, and validates input.",
    sections: [
      {
        heading: "What is an API?",
        paragraphs: [
          "An **API** (Application Programming Interface) is a set of URLs a frontend can call to read or change data. A **REST** API maps HTTP methods to actions:",
          "- `GET /notes`: list notes\n- `POST /notes`: create a note\n- `PATCH /notes/42`: update note 42\n- `DELETE /notes/42`: delete note 42",
        ],
      },
      {
        heading: "Your first Express server",
        paragraphs: ["Node.js runs JavaScript on the server. Express is a small framework for handling requests."],
        code: `import express from "express";

const app = express();
app.use(express.json()); // parse JSON request bodies

const notes = [];

app.get("/api/notes", (req, res) => {
  res.json({ notes });
});

app.post("/api/notes", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const note = { id: notes.length + 1, title };
  notes.push(note);
  res.status(201).json({ note });
});

app.listen(5050, () => console.log("API on http://localhost:5050"));`,
        language: "JavaScript",
      },
      {
        heading: "Status codes matter",
        paragraphs: [
          "- `200 OK` and `201 Created`: success.\n- `400 Bad Request`: the client sent invalid data.\n- `401 Unauthorized` / `403 Forbidden`: not logged in / not allowed.\n- `404 Not Found`: the resource doesn't exist.\n- `500 Internal Server Error`: something broke on the server.",
          "Returning the right code lets the frontend show the right message.",
        ],
      },
      {
        heading: "Middleware",
        paragraphs: ["Middleware are functions that run before your route handlers, which is how logging, authentication and validation are added once and reused everywhere."],
        code: `function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please log in" });
  next(); // continue to the route
}

app.get("/api/me/notes", requireAuth, (req, res) => { /* ... */ });`,
        language: "JavaScript",
      },
    ],
    keyPoints: [
      "REST APIs map HTTP methods to create/read/update/delete actions.",
      "express.json() parses request bodies.",
      "Always validate input and return accurate status codes.",
      "Middleware adds shared behaviour such as auth and logging.",
    ],
  },
  {
    slug: "deploying-web-apps",
    title: "Deploying Your Web App",
    module: "Backend",
    duration: 15,
    summary: "Ship your project to the internet with environment variables, builds and hosting.",
    sections: [
      {
        heading: "From localhost to the world",
        paragraphs: [
          "Deploying means running your code on a server that is always on and publicly reachable. For most projects you'll deploy two pieces: the **frontend** (static files or a Next.js app) and the **backend** API plus its **database**.",
        ],
      },
      {
        heading: "Environment variables",
        paragraphs: [
          "Secrets and settings that differ between your laptop and production (database URLs, API keys) belong in **environment variables**, never in your code.",
        ],
        code: `# .env (never commit this file)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notequest
JWT_SECRET=a-long-random-string

// read it in Node
const uri = process.env.MONGODB_URI;`,
        language: "Shell",
      },
      {
        heading: "Common hosting options",
        paragraphs: [
          "- **Vercel / Netlify**: frontends and Next.js. Connect a GitHub repo and every push deploys.\n- **Render / Railway / Fly.io**: Node APIs and background workers.\n- **MongoDB Atlas / Supabase / Neon**: managed databases.\n- **A VPS** (DigitalOcean, AWS EC2): full control, more responsibility.",
        ],
      },
      {
        heading: "A pre-launch checklist",
        paragraphs: [
          "- `npm run build` passes locally with no errors.\n- All secrets are set in the host's dashboard.\n- HTTPS is on (most hosts do this automatically).\n- You've tested sign-up, login and your main flows on the live URL.\n- Errors are logged somewhere you'll actually look.",
        ],
      },
    ],
    keyPoints: [
      "Deploy frontend, backend and database, often on different hosts.",
      "Keep secrets in environment variables, not in code.",
      "Git-connected hosts redeploy on every push.",
      "Test the real production URL before announcing it.",
    ],
  },
];
