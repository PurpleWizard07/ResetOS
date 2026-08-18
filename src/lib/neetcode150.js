/**
 * The canonical NeetCode 150, as static reference data.
 *
 * This list is a fixed, published curriculum — it is not user data, so it
 * lives in source rather than being typed into the database by hand. The
 * database stores only what is *yours*: whether you solved it, your writeup,
 * your approaches. `seedCatalog` in src/hooks/data/useDsa.js pushes this file
 * into `dsa_problems`, keyed by `slug`, so re-running it can never duplicate a
 * problem and can never overwrite something you wrote.
 *
 * `slug` is the LeetCode URL slug. It is the stable identifier for a problem
 * everywhere in the app: unique, human-readable, and unchanged even if a
 * title is reworded here later.
 *
 * Language rule for everything in this file (and for the UI that renders it):
 * plain words. A pattern is "Monotonic Stack", not "an invariant-preserving
 * monotonic stack with amortized linear complexity".
 */

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

/**
 * The 18 NeetCode groups, in the official order — this array's index IS the
 * study order, which is what the "Next up" view walks down.
 *
 * `blurb` is the one-line "what this group is about" shown under a category
 * heading. Written as the move you make, not as a definition.
 */
export const CATEGORIES = [
  { name: "Arrays & Hashing", blurb: "Count things and look them up fast." },
  { name: "Two Pointers", blurb: "Walk in from both ends of a sorted range." },
  { name: "Sliding Window", blurb: "Grow and shrink a range as you scan." },
  { name: "Stack", blurb: "Remember what is still waiting to be resolved." },
  { name: "Binary Search", blurb: "Throw away half the options each step." },
  { name: "Linked List", blurb: "Rewire pointers without losing the list." },
  { name: "Trees", blurb: "Solve both children, then combine." },
  { name: "Tries", blurb: "Let words share their common prefixes." },
  { name: "Heap / Priority Queue", blurb: "Always reach for the best item next." },
  { name: "Backtracking", blurb: "Try a choice, then undo it and try another." },
  { name: "Graphs", blurb: "Walk nodes and edges without revisiting." },
  { name: "Advanced Graphs", blurb: "Cheapest paths and valid orderings." },
  { name: "1-D Dynamic Programming", blurb: "Build each answer from smaller answers." },
  { name: "2-D Dynamic Programming", blurb: "A table over two things that change." },
  { name: "Greedy", blurb: "Take the best step available right now." },
  { name: "Intervals", blurb: "Sort by time, then sweep left to right." },
  { name: "Math & Geometry", blurb: "Digits, grids, and formulas." },
  { name: "Bit Manipulation", blurb: "Work with the raw bits of a number." },
];

/**
 * Problems per category, in NeetCode's order.
 * Tuple shape: [title, difficulty, leetcodeSlug, pattern, tags]
 *
 * `pattern` is the single technique you would name out loud before writing
 * code — one per problem, drawn from a small shared vocabulary so that
 * filtering by pattern stays useful. `tags` are the secondary "what is
 * involved here" labels.
 */
const BY_CATEGORY = {
  "Arrays & Hashing": [
    ["Contains Duplicate", "Easy", "contains-duplicate", "Hash Set", ["Array", "Hash Set"]],
    ["Valid Anagram", "Easy", "valid-anagram", "Hash Map", ["String", "Hash Map", "Counting"]],
    ["Two Sum", "Easy", "two-sum", "Hash Map", ["Array", "Hash Map"]],
    ["Group Anagrams", "Medium", "group-anagrams", "Hash Map", ["String", "Hash Map", "Sorting"]],
    ["Top K Frequent Elements", "Medium", "top-k-frequent-elements", "Bucket Sort", ["Array", "Hash Map", "Heap"]],
    ["Encode and Decode Strings", "Medium", "encode-and-decode-strings", "Design", ["String", "Design"]],
    ["Product of Array Except Self", "Medium", "product-of-array-except-self", "Prefix & Suffix", ["Array", "Prefix Sum"]],
    ["Valid Sudoku", "Medium", "valid-sudoku", "Hash Set", ["Matrix", "Hash Set"]],
    ["Longest Consecutive Sequence", "Medium", "longest-consecutive-sequence", "Hash Set", ["Array", "Hash Set"]],
  ],
  "Two Pointers": [
    ["Valid Palindrome", "Easy", "valid-palindrome", "Two Pointers", ["String", "Two Pointers"]],
    ["Two Sum II Input Array Is Sorted", "Medium", "two-sum-ii-input-array-is-sorted", "Two Pointers", ["Array", "Two Pointers"]],
    ["3Sum", "Medium", "3sum", "Two Pointers", ["Array", "Sorting", "Two Pointers"]],
    ["Container With Most Water", "Medium", "container-with-most-water", "Two Pointers", ["Array", "Greedy", "Two Pointers"]],
    ["Trapping Rain Water", "Hard", "trapping-rain-water", "Two Pointers", ["Array", "Two Pointers", "Prefix Sum"]],
  ],
  "Sliding Window": [
    ["Best Time to Buy and Sell Stock", "Easy", "best-time-to-buy-and-sell-stock", "Sliding Window", ["Array", "Greedy"]],
    ["Longest Substring Without Repeating Characters", "Medium", "longest-substring-without-repeating-characters", "Sliding Window", ["String", "Hash Set"]],
    ["Longest Repeating Character Replacement", "Medium", "longest-repeating-character-replacement", "Sliding Window", ["String", "Hash Map"]],
    ["Permutation In String", "Medium", "permutation-in-string", "Sliding Window", ["String", "Hash Map", "Counting"]],
    ["Minimum Window Substring", "Hard", "minimum-window-substring", "Sliding Window", ["String", "Hash Map"]],
    ["Sliding Window Maximum", "Hard", "sliding-window-maximum", "Monotonic Deque", ["Array", "Queue", "Monotonic"]],
  ],
  Stack: [
    ["Valid Parentheses", "Easy", "valid-parentheses", "Stack", ["String", "Stack"]],
    ["Min Stack", "Medium", "min-stack", "Design", ["Stack", "Design"]],
    ["Evaluate Reverse Polish Notation", "Medium", "evaluate-reverse-polish-notation", "Stack", ["Array", "Stack", "Math"]],
    ["Generate Parentheses", "Medium", "generate-parentheses", "Backtracking", ["String", "Backtracking", "Recursion"]],
    ["Daily Temperatures", "Medium", "daily-temperatures", "Monotonic Stack", ["Array", "Monotonic"]],
    ["Car Fleet", "Medium", "car-fleet", "Monotonic Stack", ["Array", "Sorting", "Monotonic"]],
    ["Largest Rectangle In Histogram", "Hard", "largest-rectangle-in-histogram", "Monotonic Stack", ["Array", "Monotonic"]],
  ],
  "Binary Search": [
    ["Binary Search", "Easy", "binary-search", "Binary Search", ["Array", "Binary Search"]],
    ["Search a 2D Matrix", "Medium", "search-a-2d-matrix", "Binary Search", ["Matrix", "Binary Search"]],
    ["Koko Eating Bananas", "Medium", "koko-eating-bananas", "Binary Search on Answer", ["Array", "Binary Search"]],
    ["Find Minimum In Rotated Sorted Array", "Medium", "find-minimum-in-rotated-sorted-array", "Binary Search", ["Array", "Binary Search"]],
    ["Search In Rotated Sorted Array", "Medium", "search-in-rotated-sorted-array", "Binary Search", ["Array", "Binary Search"]],
    ["Time Based Key Value Store", "Medium", "time-based-key-value-store", "Design", ["Hash Map", "Binary Search", "Design"]],
    ["Median of Two Sorted Arrays", "Hard", "median-of-two-sorted-arrays", "Binary Search", ["Array", "Binary Search"]],
  ],
  "Linked List": [
    ["Reverse Linked List", "Easy", "reverse-linked-list", "Pointer Rewiring", ["Linked List", "Recursion"]],
    ["Merge Two Sorted Lists", "Easy", "merge-two-sorted-lists", "Two Pointers", ["Linked List"]],
    ["Reorder List", "Medium", "reorder-list", "Fast & Slow Pointers", ["Linked List", "Two Pointers"]],
    ["Remove Nth Node From End of List", "Medium", "remove-nth-node-from-end-of-list", "Two Pointers", ["Linked List", "Two Pointers"]],
    ["Copy List With Random Pointer", "Medium", "copy-list-with-random-pointer", "Hash Map", ["Linked List", "Hash Map"]],
    ["Add Two Numbers", "Medium", "add-two-numbers", "Digit Carry", ["Linked List", "Math"]],
    ["Linked List Cycle", "Easy", "linked-list-cycle", "Fast & Slow Pointers", ["Linked List", "Two Pointers"]],
    ["Find The Duplicate Number", "Medium", "find-the-duplicate-number", "Fast & Slow Pointers", ["Array", "Two Pointers"]],
    ["LRU Cache", "Medium", "lru-cache", "Design", ["Hash Map", "Linked List", "Design"]],
    ["Merge K Sorted Lists", "Hard", "merge-k-sorted-lists", "Heap", ["Linked List", "Heap", "Divide & Conquer"]],
    ["Reverse Nodes In K Group", "Hard", "reverse-nodes-in-k-group", "Pointer Rewiring", ["Linked List", "Recursion"]],
  ],
  Trees: [
    ["Invert Binary Tree", "Easy", "invert-binary-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Maximum Depth of Binary Tree", "Easy", "maximum-depth-of-binary-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Diameter of Binary Tree", "Easy", "diameter-of-binary-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Balanced Binary Tree", "Easy", "balanced-binary-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Same Tree", "Easy", "same-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Subtree of Another Tree", "Easy", "subtree-of-another-tree", "Tree DFS", ["Tree", "Recursion"]],
    ["Lowest Common Ancestor of a Binary Search Tree", "Medium", "lowest-common-ancestor-of-a-binary-search-tree", "BST Walk", ["Tree", "BST"]],
    ["Binary Tree Level Order Traversal", "Medium", "binary-tree-level-order-traversal", "Tree BFS", ["Tree", "BFS", "Queue"]],
    ["Binary Tree Right Side View", "Medium", "binary-tree-right-side-view", "Tree BFS", ["Tree", "BFS"]],
    ["Count Good Nodes In Binary Tree", "Medium", "count-good-nodes-in-binary-tree", "Tree DFS", ["Tree", "DFS"]],
    ["Validate Binary Search Tree", "Medium", "validate-binary-search-tree", "BST Walk", ["Tree", "BST", "Recursion"]],
    ["Kth Smallest Element In a BST", "Medium", "kth-smallest-element-in-a-bst", "Inorder Traversal", ["Tree", "BST", "Stack"]],
    ["Construct Binary Tree From Preorder And Inorder Traversal", "Medium", "construct-binary-tree-from-preorder-and-inorder-traversal", "Divide & Conquer", ["Tree", "Recursion", "Hash Map"]],
    ["Binary Tree Maximum Path Sum", "Hard", "binary-tree-maximum-path-sum", "Tree DFS", ["Tree", "DFS", "DP"]],
    ["Serialize And Deserialize Binary Tree", "Hard", "serialize-and-deserialize-binary-tree", "Design", ["Tree", "DFS", "Design"]],
  ],
  Tries: [
    ["Implement Trie Prefix Tree", "Medium", "implement-trie-prefix-tree", "Trie", ["Trie", "Design", "String"]],
    ["Design Add And Search Words Data Structure", "Medium", "design-add-and-search-words-data-structure", "Trie", ["Trie", "DFS", "Design"]],
    ["Word Search II", "Hard", "word-search-ii", "Trie + Backtracking", ["Trie", "Backtracking", "Grid"]],
  ],
  "Heap / Priority Queue": [
    ["Kth Largest Element In a Stream", "Easy", "kth-largest-element-in-a-stream", "Heap", ["Heap", "Design"]],
    ["Last Stone Weight", "Easy", "last-stone-weight", "Heap", ["Array", "Heap"]],
    ["K Closest Points to Origin", "Medium", "k-closest-points-to-origin", "Heap", ["Array", "Heap", "Sorting"]],
    ["Kth Largest Element In An Array", "Medium", "kth-largest-element-in-an-array", "Quickselect", ["Array", "Heap", "Sorting"]],
    ["Task Scheduler", "Medium", "task-scheduler", "Greedy + Heap", ["Array", "Heap", "Greedy", "Counting"]],
    ["Design Twitter", "Medium", "design-twitter", "Design", ["Heap", "Hash Map", "Design"]],
    ["Find Median From Data Stream", "Hard", "find-median-from-data-stream", "Two Heaps", ["Heap", "Design"]],
  ],
  Backtracking: [
    ["Subsets", "Medium", "subsets", "Backtracking", ["Array", "Backtracking"]],
    ["Combination Sum", "Medium", "combination-sum", "Backtracking", ["Array", "Backtracking"]],
    ["Permutations", "Medium", "permutations", "Backtracking", ["Array", "Backtracking"]],
    ["Subsets II", "Medium", "subsets-ii", "Backtracking", ["Array", "Backtracking", "Sorting"]],
    ["Combination Sum II", "Medium", "combination-sum-ii", "Backtracking", ["Array", "Backtracking", "Sorting"]],
    ["Word Search", "Medium", "word-search", "Backtracking", ["Grid", "Backtracking", "DFS"]],
    ["Palindrome Partitioning", "Medium", "palindrome-partitioning", "Backtracking", ["String", "Backtracking", "DP"]],
    ["Letter Combinations of a Phone Number", "Medium", "letter-combinations-of-a-phone-number", "Backtracking", ["String", "Backtracking"]],
    ["N Queens", "Hard", "n-queens", "Backtracking", ["Backtracking", "Grid"]],
  ],
  Graphs: [
    ["Number of Islands", "Medium", "number-of-islands", "Grid DFS", ["Grid", "DFS", "BFS"]],
    ["Max Area of Island", "Medium", "max-area-of-island", "Grid DFS", ["Grid", "DFS"]],
    ["Clone Graph", "Medium", "clone-graph", "Graph DFS", ["Graph", "DFS", "Hash Map"]],
    ["Walls And Gates", "Medium", "walls-and-gates", "Multi-source BFS", ["Grid", "BFS"]],
    ["Rotting Oranges", "Medium", "rotting-oranges", "Multi-source BFS", ["Grid", "BFS", "Queue"]],
    ["Pacific Atlantic Water Flow", "Medium", "pacific-atlantic-water-flow", "Reverse DFS", ["Grid", "DFS"]],
    ["Surrounded Regions", "Medium", "surrounded-regions", "Border DFS", ["Grid", "DFS"]],
    ["Course Schedule", "Medium", "course-schedule", "Cycle Detection", ["Graph", "DFS", "Topological Sort"]],
    ["Course Schedule II", "Medium", "course-schedule-ii", "Topological Sort", ["Graph", "Topological Sort", "BFS"]],
    ["Graph Valid Tree", "Medium", "graph-valid-tree", "Union Find", ["Graph", "Union Find", "DFS"]],
    ["Number of Connected Components In An Undirected Graph", "Medium", "number-of-connected-components-in-an-undirected-graph", "Union Find", ["Graph", "Union Find", "DFS"]],
    ["Redundant Connection", "Medium", "redundant-connection", "Union Find", ["Graph", "Union Find"]],
    ["Word Ladder", "Hard", "word-ladder", "BFS", ["String", "BFS", "Graph"]],
  ],
  "Advanced Graphs": [
    ["Reconstruct Itinerary", "Hard", "reconstruct-itinerary", "Eulerian Path", ["Graph", "DFS"]],
    ["Min Cost to Connect All Points", "Medium", "min-cost-to-connect-all-points", "Minimum Spanning Tree", ["Graph", "Heap", "Union Find"]],
    ["Network Delay Time", "Medium", "network-delay-time", "Dijkstra", ["Graph", "Heap"]],
    ["Swim In Rising Water", "Hard", "swim-in-rising-water", "Dijkstra", ["Grid", "Heap", "Binary Search"]],
    ["Alien Dictionary", "Hard", "alien-dictionary", "Topological Sort", ["Graph", "Topological Sort", "String"]],
    ["Cheapest Flights Within K Stops", "Medium", "cheapest-flights-within-k-stops", "Bellman-Ford", ["Graph", "DP", "BFS"]],
  ],
  "1-D Dynamic Programming": [
    ["Climbing Stairs", "Easy", "climbing-stairs", "Dynamic Programming", ["DP", "Math"]],
    ["Min Cost Climbing Stairs", "Easy", "min-cost-climbing-stairs", "Dynamic Programming", ["Array", "DP"]],
    ["House Robber", "Medium", "house-robber", "Dynamic Programming", ["Array", "DP"]],
    ["House Robber II", "Medium", "house-robber-ii", "Dynamic Programming", ["Array", "DP"]],
    ["Longest Palindromic Substring", "Medium", "longest-palindromic-substring", "Expand Around Center", ["String", "DP"]],
    ["Palindromic Substrings", "Medium", "palindromic-substrings", "Expand Around Center", ["String", "DP"]],
    ["Decode Ways", "Medium", "decode-ways", "Dynamic Programming", ["String", "DP"]],
    ["Coin Change", "Medium", "coin-change", "Dynamic Programming", ["Array", "DP"]],
    ["Maximum Product Subarray", "Medium", "maximum-product-subarray", "Dynamic Programming", ["Array", "DP"]],
    ["Word Break", "Medium", "word-break", "Dynamic Programming", ["String", "DP", "Hash Set"]],
    ["Longest Increasing Subsequence", "Medium", "longest-increasing-subsequence", "Dynamic Programming", ["Array", "DP", "Binary Search"]],
    ["Partition Equal Subset Sum", "Medium", "partition-equal-subset-sum", "Subset Sum DP", ["Array", "DP"]],
  ],
  "2-D Dynamic Programming": [
    ["Unique Paths", "Medium", "unique-paths", "Grid DP", ["DP", "Math"]],
    ["Longest Common Subsequence", "Medium", "longest-common-subsequence", "Grid DP", ["String", "DP"]],
    ["Best Time to Buy And Sell Stock With Cooldown", "Medium", "best-time-to-buy-and-sell-stock-with-cooldown", "State Machine DP", ["Array", "DP"]],
    ["Coin Change II", "Medium", "coin-change-ii", "Counting DP", ["Array", "DP"]],
    ["Target Sum", "Medium", "target-sum", "Subset Sum DP", ["Array", "DP", "Backtracking"]],
    ["Interleaving String", "Medium", "interleaving-string", "Grid DP", ["String", "DP"]],
    ["Longest Increasing Path In a Matrix", "Hard", "longest-increasing-path-in-a-matrix", "DFS + Memo", ["Grid", "DP", "DFS"]],
    ["Distinct Subsequences", "Hard", "distinct-subsequences", "Grid DP", ["String", "DP"]],
    ["Edit Distance", "Medium", "edit-distance", "Grid DP", ["String", "DP"]],
    ["Burst Balloons", "Hard", "burst-balloons", "Interval DP", ["Array", "DP"]],
    ["Regular Expression Matching", "Hard", "regular-expression-matching", "Grid DP", ["String", "DP", "Recursion"]],
  ],
  Greedy: [
    ["Maximum Subarray", "Medium", "maximum-subarray", "Kadane's Algorithm", ["Array", "Greedy", "DP"]],
    ["Jump Game", "Medium", "jump-game", "Greedy", ["Array", "Greedy"]],
    ["Jump Game II", "Medium", "jump-game-ii", "Greedy", ["Array", "Greedy", "BFS"]],
    ["Gas Station", "Medium", "gas-station", "Greedy", ["Array", "Greedy"]],
    ["Hand of Straights", "Medium", "hand-of-straights", "Greedy", ["Array", "Greedy", "Hash Map"]],
    ["Merge Triplets to Form Target Triplet", "Medium", "merge-triplets-to-form-target-triplet", "Greedy", ["Array", "Greedy"]],
    ["Partition Labels", "Medium", "partition-labels", "Greedy", ["String", "Greedy", "Hash Map"]],
    ["Valid Parenthesis String", "Medium", "valid-parenthesis-string", "Greedy", ["String", "Greedy", "DP"]],
  ],
  Intervals: [
    ["Insert Interval", "Medium", "insert-interval", "Interval Sweep", ["Array", "Interval"]],
    ["Merge Intervals", "Medium", "merge-intervals", "Interval Sort", ["Array", "Sorting", "Interval"]],
    ["Non Overlapping Intervals", "Medium", "non-overlapping-intervals", "Greedy", ["Array", "Greedy", "Interval"]],
    ["Meeting Rooms", "Easy", "meeting-rooms", "Interval Sort", ["Array", "Sorting", "Interval"]],
    ["Meeting Rooms II", "Medium", "meeting-rooms-ii", "Heap", ["Array", "Heap", "Interval"]],
    ["Minimum Interval to Include Each Query", "Hard", "minimum-interval-to-include-each-query", "Heap", ["Array", "Heap", "Sorting"]],
  ],
  "Math & Geometry": [
    ["Rotate Image", "Medium", "rotate-image", "Matrix Transform", ["Matrix", "Math"]],
    ["Spiral Matrix", "Medium", "spiral-matrix", "Boundary Walk", ["Matrix", "Simulation"]],
    ["Set Matrix Zeroes", "Medium", "set-matrix-zeroes", "In-place Marking", ["Matrix", "Hash Set"]],
    ["Happy Number", "Easy", "happy-number", "Fast & Slow Pointers", ["Math", "Hash Set"]],
    ["Plus One", "Easy", "plus-one", "Digit Carry", ["Array", "Math"]],
    ["Pow(x, n)", "Medium", "powx-n", "Fast Exponentiation", ["Math", "Recursion"]],
    ["Multiply Strings", "Medium", "multiply-strings", "Digit Math", ["String", "Math"]],
    ["Detect Squares", "Medium", "detect-squares", "Design", ["Hash Map", "Design", "Geometry"]],
  ],
  "Bit Manipulation": [
    ["Single Number", "Easy", "single-number", "XOR", ["Array", "Bit"]],
    ["Number of One Bits", "Easy", "number-of-1-bits", "Bit Manipulation", ["Bit", "Math"]],
    ["Counting Bits", "Easy", "counting-bits", "Bit Manipulation", ["Bit", "DP"]],
    ["Reverse Bits", "Easy", "reverse-bits", "Bit Manipulation", ["Bit"]],
    ["Missing Number", "Easy", "missing-number", "XOR", ["Array", "Bit", "Math"]],
    ["Sum of Two Integers", "Medium", "sum-of-two-integers", "Bit Manipulation", ["Bit", "Math"]],
    ["Reverse Integer", "Medium", "reverse-integer", "Overflow Check", ["Math", "Bit"]],
  ],
};

/** Ordered category names — the study order. */
export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const CATEGORY_BLURB = Object.fromEntries(CATEGORIES.map((c) => [c.name, c.blurb]));

/**
 * The flat list, in study order. `number` is the 1..150 position shown in the
 * UI as the problem number; `categoryOrder` is the 1..18 group position. Both
 * are stored on the row, so sorting and grouping never have to read this file.
 */
export const NEETCODE_150 = CATEGORIES.flatMap((cat, ci) =>
  BY_CATEGORY[cat.name].map(([title, difficulty, slug, pattern, tags]) => ({
    slug,
    title,
    difficulty,
    source: "LeetCode",
    url: `https://leetcode.com/problems/${slug}/`,
    category: cat.name,
    categoryOrder: ci + 1,
    pattern,
    tags,
  }))
).map((p, i) => ({ ...p, number: i + 1 }));

export const TOTAL_PROBLEMS = NEETCODE_150.length;

export const PROBLEM_BY_SLUG = new Map(NEETCODE_150.map((p) => [p.slug, p]));

/**
 * The columns that describe the *curriculum* rather than your progress. A
 * re-seed refreshes exactly these from this file, so a corrected title or
 * difficulty propagates to a database that was seeded earlier — while
 * everything you wrote is left untouched.
 *
 * `pattern` and `tags` are deliberately NOT here: they seed once and are
 * yours to edit afterwards.
 */
export const catalogFields = (p) => ({
  name: p.title,
  source: p.source,
  link: p.url,
  difficulty: p.difficulty,
  category: p.category,
  category_order: p.categoryOrder,
  problem_order: p.number,
});

/** Full insert payload for a problem that isn't in the database yet. */
export const seedRow = (p) => ({
  ...catalogFields(p),
  slug: p.slug,
  pattern: p.pattern,
  tags: p.tags,
  // A null date means "not solved yet" — see supabase/schema.sql.
  date: null,
  last_revised: null,
  restated: "",
  key_insight: "",
  why_it_works: "",
  pitfalls: "",
  notes: "",
});
