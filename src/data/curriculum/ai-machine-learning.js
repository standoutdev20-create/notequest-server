export default [
  {
    slug: "what-is-machine-learning",
    title: "What Is Machine Learning?",
    module: "Foundations",
    duration: 12,
    summary: "How machines learn patterns from data, and the main kinds of ML.",
    sections: [
      {
        heading: "Rules vs learning",
        paragraphs: [
          "Traditional programs follow rules a human writes: `if email contains 'lottery' then spam`. **Machine learning** flips this around: you give the computer many examples (emails labelled spam / not spam) and it *learns* the rules itself.",
        ],
      },
      {
        heading: "Three kinds of machine learning",
        paragraphs: [
          "- **Supervised learning**: learn from labelled examples. Predict house prices (regression) or spam vs not spam (classification).\n- **Unsupervised learning**: find structure in unlabelled data, e.g. grouping customers into segments (clustering).\n- **Reinforcement learning**: learn by trial and error with rewards, as in game-playing agents and robotics.",
        ],
      },
      {
        heading: "AI, ML and deep learning",
        paragraphs: [
          "**AI** is the broad goal of machines doing intelligent tasks. **ML** is the most successful approach to AI today. **Deep learning** is ML using large neural networks, and it powers image recognition, speech, and large language models like ChatGPT and Claude.",
        ],
      },
      {
        heading: "The ML workflow",
        paragraphs: [
          "- Define the problem and how you'll measure success.\n- Collect and clean data.\n- Split into training and test sets.\n- Train a model.\n- Evaluate on data it has never seen.\n- Deploy and monitor; models degrade as the world changes.",
        ],
      },
    ],
    keyPoints: [
      "ML learns rules from examples instead of hand-written logic.",
      "Supervised, unsupervised and reinforcement learning are the main types.",
      "Deep learning = ML with large neural networks.",
      "Always evaluate on data the model hasn't seen.",
    ],
  },
  {
    slug: "data-preparation",
    title: "Preparing Data",
    module: "Foundations",
    duration: 15,
    summary: "Clean, explore and split data with pandas; this is where most ML time goes.",
    sections: [
      {
        heading: "Garbage in, garbage out",
        paragraphs: ["A model can only be as good as its data. Practitioners often spend most of a project understanding and cleaning data."],
      },
      {
        heading: "Exploring with pandas",
        paragraphs: [],
        code: `import pandas as pd

df = pd.read_csv("students.csv")
df.head()          # first rows
df.info()          # column types and missing values
df.describe()      # summary statistics
df["course"].value_counts()`,
        language: "Python",
      },
      {
        heading: "Cleaning",
        paragraphs: [
          "- **Missing values**: drop rows, or fill with the median / most common value.\n- **Categories → numbers**: models need numbers, so one-hot encode text categories.\n- **Scaling**: put features on similar scales so one large-valued column doesn't dominate.\n- **Outliers**: investigate before deleting; sometimes they're the interesting part.",
        ],
        code: `df["hours_studied"] = df["hours_studied"].fillna(df["hours_studied"].median())
df = pd.get_dummies(df, columns=["course"])`,
        language: "Python",
      },
      {
        heading: "Train / test split",
        paragraphs: ["Keep part of your data hidden from training. If you evaluate on the same data you trained on, you're measuring memory, not learning."],
        code: `from sklearn.model_selection import train_test_split

X = df.drop(columns=["passed"])
y = df["passed"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)`,
        language: "Python",
      },
    ],
    keyPoints: [
      "Data quality limits model quality.",
      "Explore with head(), info() and describe() before modelling.",
      "Handle missing values, encode categories, scale features.",
      "Always hold out a test set.",
    ],
  },
  {
    slug: "supervised-learning",
    title: "Supervised Learning in Practice",
    module: "Core Models",
    duration: 20,
    summary: "Train and evaluate regression and classification models with scikit-learn.",
    sections: [
      {
        heading: "Regression: predicting numbers",
        paragraphs: ["**Linear regression** fits a line through the data. It's simple, fast and surprisingly strong as a baseline."],
        code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)
print("Average error:", mean_absolute_error(y_test, pred))`,
        language: "Python",
      },
      {
        heading: "Classification: predicting categories",
        paragraphs: ["Logistic regression, decision trees and random forests are popular classifiers. Random forests combine many trees and work well on tabular data with little tuning."],
        code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

clf = RandomForestClassifier(n_estimators=200, random_state=42).fit(X_train, y_train)
pred = clf.predict(X_test)
print(accuracy_score(y_test, pred))
print(classification_report(y_test, pred))`,
        language: "Python",
      },
      {
        heading: "Choosing the right metric",
        paragraphs: [
          "Accuracy can mislead. If only 1% of transactions are fraud, a model that always says \"not fraud\" is 99% accurate and completely useless.",
          "- **Precision**: of the items we flagged, how many were right?\n- **Recall**: of the real positives, how many did we catch?\n- **F1**: a balance of the two.",
        ],
      },
      {
        heading: "Overfitting",
        paragraphs: ["A model that's perfect on training data but poor on test data has **overfit**: it memorised noise. Fix it with simpler models, more data, regularisation, or cross-validation."],
      },
    ],
    keyPoints: [
      "Regression predicts numbers; classification predicts labels.",
      "Start with a simple baseline model.",
      "Pick metrics that match the real cost of mistakes.",
      "A big train/test gap means overfitting.",
    ],
  },
  {
    slug: "neural-networks",
    title: "Neural Networks and Deep Learning",
    module: "Core Models",
    duration: 20,
    summary: "Neurons, layers, training with gradient descent, and where deep learning shines.",
    sections: [
      {
        heading: "Neurons and layers",
        paragraphs: [
          "A neural network is layers of simple units. Each **neuron** multiplies its inputs by **weights**, adds them up, and passes the result through an **activation function** like ReLU. Stacking many layers lets the network learn very complex patterns.",
        ],
      },
      {
        heading: "How networks learn",
        paragraphs: [
          "- Make a prediction (**forward pass**).\n- Measure how wrong it was with a **loss function**.\n- Work out how each weight contributed to the error (**backpropagation**).\n- Nudge every weight slightly to reduce the error (**gradient descent**).\n- Repeat over the data many times (**epochs**).",
        ],
      },
      {
        heading: "A tiny network in PyTorch",
        paragraphs: [],
        code: `import torch
from torch import nn

model = nn.Sequential(
    nn.Linear(10, 32), nn.ReLU(),
    nn.Linear(32, 1),  nn.Sigmoid(),
)
loss_fn = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(100):
    pred = model(X)
    loss = loss_fn(pred, y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()`,
        language: "Python",
      },
      {
        heading: "Where deep learning shines",
        paragraphs: [
          "- **Images**: convolutional networks (CNNs).\n- **Language and sequences**: transformers.\n- **Audio and speech**.\n- For small tabular datasets, classic models like random forests often still win.",
        ],
      },
    ],
    keyPoints: [
      "Networks are layers of weighted sums plus activations.",
      "Training = forward pass, loss, backpropagation, gradient descent.",
      "Deep learning excels on images, text and audio.",
      "Classic ML is often better for small tabular data.",
    ],
  },
  {
    slug: "llms-and-prompting",
    title: "Large Language Models and Prompting",
    module: "Modern AI",
    duration: 15,
    summary: "How LLMs work at a high level, and how to use them well in your apps.",
    sections: [
      {
        heading: "What an LLM is",
        paragraphs: [
          "A **large language model** is a transformer neural network trained on huge amounts of text to predict the next token (a piece of a word). Doing that at scale gives it surprisingly broad abilities: writing, summarising, coding and reasoning.",
        ],
      },
      {
        heading: "Writing good prompts",
        paragraphs: [
          "- **Be specific** about the task, audience and format.\n- **Give context**: paste the relevant document or data.\n- **Show examples** of the output you want.\n- **Ask for structure**, such as JSON or a table, when code will read the answer.\n- **Iterate**: treat prompts like code and test them on real inputs.",
        ],
        code: `You are reviewing a beginner's JavaScript.
Explain each bug in one sentence, then show the fixed code.
Respond in Markdown with the headings "Bugs" and "Fixed code".

Code:
const total = items.map(i => i.price).reduce((a, b) => a + b)`,
        language: "Prompt",
      },
      {
        heading: "Building with LLM APIs",
        paragraphs: [
          "Apps call models over an HTTP API: send messages, get a response. Common patterns include **RAG** (retrieve relevant documents and include them in the prompt), **tool use** (let the model call your functions), and **structured output**.",
        ],
      },
      {
        heading: "Limits to respect",
        paragraphs: [
          "LLMs can sound confident while being wrong (**hallucination**). Verify important facts, keep a human in the loop for high-stakes decisions, and never send secrets or personal data you aren't allowed to share.",
        ],
      },
    ],
    keyPoints: [
      "LLMs are transformers trained to predict the next token.",
      "Specific prompts with context and examples work best.",
      "RAG and tool use connect models to your data and code.",
      "Verify outputs; models can hallucinate.",
    ],
  },
];
