export default [
  {
    slug: "what-is-programming",
    title: "What Is Programming?",
    module: "Getting Started",
    duration: 10,
    summary: "How computers follow instructions, and how to think like a programmer.",
    sections: [
      {
        heading: "Instructions for a very literal machine",
        paragraphs: [
          "A program is a precise list of instructions. Computers are fast but completely literal: they do exactly what you write, not what you meant. Programming is the skill of breaking a problem into steps small and clear enough for a machine to follow.",
        ],
      },
      {
        heading: "Compiled vs interpreted languages",
        paragraphs: [
          "- **Compiled** languages (C, C++, Go, Rust) are translated into machine code before running. They're usually very fast.\n- **Interpreted / JIT** languages (Python, JavaScript) are run by another program that reads your code. They're quicker to write and experiment with.\n- **Java and C#** compile to an intermediate bytecode that runs on a virtual machine.",
          "The concepts in this course (variables, conditions, loops, functions, objects) exist in all of them. Learn them once and switching languages becomes much easier.",
        ],
      },
      {
        heading: "Your first program",
        paragraphs: ["Here's the same tiny program in Python and JavaScript. Notice how similar the ideas are."],
        code: `# Python
name = input("What's your name? ")
print(f"Hello, {name}!")

// JavaScript (Node.js)
const name = "Asha";
console.log(\`Hello, \${name}!\`);`,
        language: "Python / JavaScript",
      },
      {
        heading: "Thinking like a programmer",
        paragraphs: [
          "- **Decompose**: split a big problem into small ones.\n- **Recognise patterns**: have you solved something similar before?\n- **Abstract**: ignore details that don't matter right now.\n- **Write an algorithm**: list the steps in plain language before you code.",
        ],
      },
    ],
    keyPoints: [
      "A program is a precise set of instructions.",
      "Compiled languages translate ahead of time; interpreted languages run through an interpreter.",
      "Core concepts transfer between languages.",
      "Plan in plain language before writing code.",
    ],
  },
  {
    slug: "variables-and-data-types",
    title: "Variables and Data Types",
    module: "Getting Started",
    duration: 15,
    summary: "Store and work with numbers, text, booleans and collections.",
    sections: [
      {
        heading: "Variables are labelled boxes",
        paragraphs: [
          "A **variable** is a name that points to a value stored in memory. Choose names that explain what the value means: `totalPrice` is better than `x`.",
        ],
        code: `age = 21
name = "Ravi"
is_student = True
price = 499.99`,
        language: "Python",
      },
      {
        heading: "Common data types",
        paragraphs: [
          "- **Integer** (`42`): whole numbers.\n- **Float** (`3.14`): decimals. Be careful: `0.1 + 0.2` isn't exactly `0.3` in most languages.\n- **String** (`\"hello\"`): text.\n- **Boolean** (`True` / `False`): yes/no values used in decisions.\n- **None / null**: \"no value\".",
        ],
      },
      {
        heading: "Collections",
        paragraphs: ["Most programs work with groups of values. The two you'll use constantly are **lists** (ordered) and **dictionaries / maps** (key → value)."],
        code: `skills = ["HTML", "CSS", "Python"]
skills.append("SQL")
print(skills[0])        # HTML

student = {"name": "Asha", "year": 2, "skills": skills}
print(student["name"])  # Asha`,
        language: "Python",
      },
      {
        heading: "Static vs dynamic typing",
        paragraphs: [
          "In **statically typed** languages (Java, TypeScript, Go) you declare types and the compiler catches mistakes early. In **dynamically typed** languages (Python, JavaScript) types are checked while the program runs. Both are fine; static types tend to help in large codebases.",
        ],
        code: `// TypeScript
let count: number = 0;
count = "ten"; // ❌ error caught before running`,
        language: "TypeScript",
      },
    ],
    keyPoints: [
      "Variables name values; use descriptive names.",
      "Core types: integer, float, string, boolean, null.",
      "Lists are ordered; dictionaries map keys to values.",
      "Static typing catches errors before the program runs.",
    ],
  },
  {
    slug: "conditions-and-loops",
    title: "Conditions and Loops",
    module: "Control Flow",
    duration: 15,
    summary: "Make decisions with if/else and repeat work with for and while loops.",
    sections: [
      {
        heading: "Making decisions",
        paragraphs: ["Conditions let a program choose what to do. They're built from comparisons (`==`, `!=`, `<`, `>=`) and logic (`and`, `or`, `not`)."],
        code: `score = 82

if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
else:
    grade = "C"

print(grade)  # B`,
        language: "Python",
      },
      {
        heading: "for loops: repeat for each item",
        paragraphs: ["Use a `for` loop when you know what you're looping over, such as every item in a list or a range of numbers."],
        code: `lessons = ["Variables", "Conditions", "Loops"]
for lesson in lessons:
    print("Studying", lesson)

for i in range(1, 6):   # 1, 2, 3, 4, 5
    print(i * i)`,
        language: "Python",
      },
      {
        heading: "while loops: repeat until something changes",
        paragraphs: ["A `while` loop runs as long as its condition is true. Make sure something inside the loop eventually makes it false, or it will run forever."],
        code: `balance = 1000
months = 0
while balance < 2000:
    balance *= 1.05   # 5% growth
    months += 1
print(f"Doubled in {months} months")`,
        language: "Python",
      },
      {
        heading: "break and continue",
        paragraphs: ["`break` exits a loop early; `continue` skips to the next iteration. Use them sparingly so loops stay easy to read."],
      },
    ],
    keyPoints: [
      "if / elif / else picks one branch.",
      "for loops iterate over collections or ranges.",
      "while loops run until a condition becomes false.",
      "Guard against infinite loops.",
    ],
  },
  {
    slug: "functions",
    title: "Functions",
    module: "Control Flow",
    duration: 15,
    summary: "Package logic into reusable, testable pieces with parameters and return values.",
    sections: [
      {
        heading: "Why functions?",
        paragraphs: [
          "A function gives a name to a piece of logic. Instead of copying the same code in five places, you write it once and **call** it. That makes programs shorter, easier to test, and easier to change.",
        ],
        code: `def area_of_circle(radius):
    return 3.14159 * radius ** 2

print(area_of_circle(2))   # 12.56636
print(area_of_circle(10))  # 314.159`,
        language: "Python",
      },
      {
        heading: "Parameters and return values",
        paragraphs: [
          "**Parameters** are a function's inputs; the **return value** is its output. A good function does one thing, takes what it needs as parameters, and returns a result instead of printing it.",
        ],
        code: `def final_price(price, discount=0, tax_rate=0.18):
    discounted = price * (1 - discount)
    return round(discounted * (1 + tax_rate), 2)

final_price(1000)                # 1180.0
final_price(1000, discount=0.2)  # 944.0`,
        language: "Python",
      },
      {
        heading: "Scope",
        paragraphs: ["Variables created inside a function only exist inside it. This **local scope** keeps functions independent, so changing one can't accidentally break another."],
      },
      {
        heading: "Pure functions",
        paragraphs: [
          "A **pure** function always returns the same output for the same input and doesn't change anything outside itself. Pure functions are the easiest code to test and reason about. Aim for them whenever you can.",
        ],
      },
    ],
    keyPoints: [
      "Functions name and reuse logic.",
      "Parameters are inputs; return values are outputs.",
      "Variables inside a function are local to it.",
      "Prefer small, pure functions that do one thing.",
    ],
  },
  {
    slug: "object-oriented-programming",
    title: "Object-Oriented Programming",
    module: "Building Bigger Programs",
    duration: 20,
    summary: "Model real things with classes, objects, inheritance and encapsulation.",
    sections: [
      {
        heading: "Classes and objects",
        paragraphs: [
          "A **class** is a blueprint; an **object** is a thing built from it. Classes bundle data (**attributes**) and behaviour (**methods**) together.",
        ],
        code: `class Course:
    def __init__(self, title, lessons):
        self.title = title
        self.lessons = lessons
        self.completed = 0

    def complete_lesson(self):
        if self.completed < self.lessons:
            self.completed += 1

    def progress(self):
        return round(self.completed / self.lessons * 100)

web = Course("Web Development", 12)
web.complete_lesson()
print(web.progress())  # 8`,
        language: "Python",
      },
      {
        heading: "The four pillars",
        paragraphs: [
          "- **Encapsulation**: keep an object's data private and expose safe methods to change it.\n- **Abstraction**: hide complex details behind a simple interface.\n- **Inheritance**: a class can extend another and reuse its behaviour.\n- **Polymorphism**: different classes can respond to the same method in their own way.",
        ],
      },
      {
        heading: "Inheritance and polymorphism in practice",
        paragraphs: [],
        code: `class Lesson:
    def describe(self):
        return "A lesson"

class VideoLesson(Lesson):
    def describe(self):
        return "A video lesson"

class ReadingLesson(Lesson):
    def describe(self):
        return "A reading lesson"

for item in [VideoLesson(), ReadingLesson()]:
    print(item.describe())`,
        language: "Python",
      },
      {
        heading: "Composition over inheritance",
        paragraphs: [
          "Deep inheritance trees become hard to change. Often it's cleaner for an object to *have* other objects (a `Course` has `Lesson`s) than to *be* a subclass. Reach for inheritance only when there's a true \"is-a\" relationship.",
        ],
      },
    ],
    keyPoints: [
      "A class is a blueprint; objects are instances of it.",
      "Encapsulation, abstraction, inheritance, polymorphism.",
      "Methods are functions that belong to an object.",
      "Prefer composition when inheritance gets deep.",
    ],
  },
];
