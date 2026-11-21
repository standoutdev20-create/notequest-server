export default [
  {
    slug: "big-o-notation",
    title: "Big-O Notation",
    module: "Foundations",
    duration: 15,
    summary: "Describe how fast code is as input grows, and compare solutions objectively.",
    sections: [
      {
        heading: "Why measure growth, not seconds?",
        paragraphs: [
          "The same code runs at different speeds on different machines. **Big-O** ignores hardware and describes how the amount of work grows as the input size `n` grows. It's the shared language for talking about performance.",
        ],
      },
      {
        heading: "The common complexities",
        paragraphs: [
          "- **O(1)** constant: reading `arr[5]`, a hash map lookup.\n- **O(log n)** logarithmic: binary search, where every step halves the problem.\n- **O(n)** linear: one pass through a list.\n- **O(n log n)**: efficient sorting (merge sort, quicksort on average).\n- **O(n²)** quadratic: nested loops over the same data.\n- **O(2ⁿ)** exponential: naive recursive solutions; avoid for large `n`.",
        ],
      },
      {
        heading: "Spotting complexity in code",
        paragraphs: [],
        code: `def has_duplicate_slow(nums):      # O(n²): compares every pair
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False

def has_duplicate_fast(nums):      # O(n): one pass with a set
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
        language: "Python",
      },
      {
        heading: "Space complexity",
        paragraphs: ["Big-O also describes memory. The fast version above uses **O(n)** extra space for the set. Trading memory for speed is one of the most common moves in algorithm design."],
      },
    ],
    keyPoints: [
      "Big-O describes growth as input size increases.",
      "Drop constants and keep the dominant term: O(2n + 5) → O(n).",
      "Nested loops over the same data are usually O(n²).",
      "Hash sets/maps often turn O(n²) into O(n) at the cost of memory.",
    ],
  },
  {
    slug: "arrays-and-hash-maps",
    title: "Arrays and Hash Maps",
    module: "Core Structures",
    duration: 20,
    summary: "The two structures behind most interview problems and real-world code.",
    sections: [
      {
        heading: "Arrays",
        paragraphs: [
          "An array stores items next to each other in memory, so reading any index is **O(1)**. Inserting or deleting in the middle is **O(n)** because everything after it must shift.",
        ],
      },
      {
        heading: "Hash maps",
        paragraphs: [
          "A hash map (dictionary, object, `Map`) stores **key → value** pairs. A hash function turns the key into a position, so lookups, inserts and deletes are **O(1) on average**.",
          "Whenever you think \"have I seen this before?\" or \"how many times does X appear?\", reach for a hash map.",
        ],
      },
      {
        heading: "Classic pattern: Two Sum",
        paragraphs: ["Given a list and a target, find two numbers that add up to it. The hash map stores numbers we've already seen and where they were."],
        code: `def two_sum(nums, target):
    seen = {}                      # value -> index
    for i, n in enumerate(nums):
        need = target - n
        if need in seen:
            return [seen[need], i]
        seen[n] = i
    return None

two_sum([2, 7, 11, 15], 9)  # [0, 1]`,
        language: "Python",
      },
      {
        heading: "Pattern: two pointers",
        paragraphs: ["On a **sorted** array, two pointers moving toward each other often solve problems in O(n) with O(1) extra space."],
        code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left, right = left + 1, right - 1
    return True`,
        language: "Python",
      },
    ],
    keyPoints: [
      "Array index access is O(1); middle insertion is O(n).",
      "Hash maps give average O(1) lookup by key.",
      "Use a map to remember what you've seen (Two Sum).",
      "Two pointers work well on sorted arrays and strings.",
    ],
  },
  {
    slug: "stacks-queues-linked-lists",
    title: "Stacks, Queues and Linked Lists",
    module: "Core Structures",
    duration: 20,
    summary: "Order-based structures used by browsers, schedulers and undo buttons.",
    sections: [
      {
        heading: "Stack: last in, first out",
        paragraphs: [
          "A stack is like a pile of plates: you add (**push**) and remove (**pop**) from the top. Your browser's back button, undo history and function calls all use stacks.",
        ],
        code: `def is_balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

is_balanced("{[()]}")  # True`,
        language: "Python",
      },
      {
        heading: "Queue: first in, first out",
        paragraphs: [
          "A queue is a line at a ticket counter: the first to arrive is the first served. Print jobs, message queues and **breadth-first search** use queues. In Python, use `collections.deque` for O(1) operations at both ends.",
        ],
        code: `from collections import deque

tasks = deque()
tasks.append("send email")   # enqueue
tasks.append("resize image")
tasks.popleft()              # "send email" - dequeue`,
        language: "Python",
      },
      {
        heading: "Linked lists",
        paragraphs: [
          "A linked list is a chain of **nodes**, each holding a value and a pointer to the next node. Inserting at the front is O(1), but finding the 50th item is O(n) because you must walk the chain.",
        ],
        code: `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev`,
        language: "Python",
      },
    ],
    keyPoints: [
      "Stack = LIFO (push/pop); great for matching and undo.",
      "Queue = FIFO; use deque for O(1) operations.",
      "Linked lists: O(1) insert at head, O(n) access by position.",
      "Reversing a linked list is a classic pointer exercise.",
    ],
  },
  {
    slug: "recursion",
    title: "Recursion",
    module: "Techniques",
    duration: 15,
    summary: "Solve problems by solving smaller versions of themselves.",
    sections: [
      {
        heading: "A function that calls itself",
        paragraphs: [
          "Recursion breaks a problem into a smaller copy of the same problem. Every recursive function needs two parts:",
          "- A **base case** that stops the recursion.\n- A **recursive case** that moves toward the base case.",
        ],
        code: `def factorial(n):
    if n <= 1:          # base case
        return 1
    return n * factorial(n - 1)   # recursive case

factorial(5)  # 120`,
        language: "Python",
      },
      {
        heading: "Recursion on trees",
        paragraphs: ["Trees are naturally recursive: each child is itself a tree. Many tree problems are only a few lines with recursion."],
        code: `def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))`,
        language: "Python",
      },
      {
        heading: "Memoization",
        paragraphs: [
          "Naive recursion can repeat the same work many times. The naive Fibonacci is O(2ⁿ). **Memoization** caches results so each subproblem is solved once, bringing it down to O(n). This idea is the foundation of **dynamic programming**.",
        ],
        code: `from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

fib(80)  # instant`,
        language: "Python",
      },
    ],
    keyPoints: [
      "Every recursion needs a base case and progress toward it.",
      "Trees and nested structures fit recursion naturally.",
      "Each call uses stack memory; very deep recursion can overflow.",
      "Memoization turns repeated recursion into dynamic programming.",
    ],
  },
  {
    slug: "sorting-and-searching",
    title: "Sorting and Searching",
    module: "Techniques",
    duration: 20,
    summary: "Binary search and the sorting algorithms every developer should understand.",
    sections: [
      {
        heading: "Binary search",
        paragraphs: [
          "On a **sorted** list, binary search checks the middle item and throws away half the list each step. Searching a million items takes about 20 steps: **O(log n)**.",
        ],
        code: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        language: "Python",
      },
      {
        heading: "Simple sorts: O(n²)",
        paragraphs: [
          "Bubble, selection and insertion sort are easy to understand and fine for tiny lists. Insertion sort is actually fast on *nearly sorted* data, which is why real libraries use it for small chunks.",
        ],
      },
      {
        heading: "Merge sort: O(n log n)",
        paragraphs: ["Merge sort splits the list in half, sorts each half recursively, then merges the two sorted halves. It's a perfect example of **divide and conquer**."],
        code: `def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left, right = merge_sort(nums[:mid]), merge_sort(nums[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]`,
        language: "Python",
      },
      {
        heading: "In practice",
        paragraphs: ["Use your language's built-in sort (`sorted()`, `Array.prototype.sort`): it's highly optimised, typically O(n log n). Know the algorithms so you can reason about cost and pick the right tool, not so you rewrite them."],
      },
    ],
    keyPoints: [
      "Binary search needs sorted data and runs in O(log n).",
      "Simple sorts are O(n²); merge sort and quicksort average O(n log n).",
      "Divide and conquer: split, solve, combine.",
      "Use built-in sorts in real code.",
    ],
  },
];
