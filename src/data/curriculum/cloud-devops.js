export default [
  {
    slug: "cloud-computing-basics",
    title: "Cloud Computing Basics",
    module: "Foundations",
    duration: 12,
    summary: "IaaS, PaaS, SaaS, regions, and why companies rent computers instead of buying them.",
    sections: [
      {
        heading: "Renting computers on demand",
        paragraphs: [
          "Cloud computing means renting servers, storage and services over the internet and paying for what you use. Instead of buying hardware for peak traffic, you scale up when needed and down when you don't.",
        ],
      },
      {
        heading: "Service models",
        paragraphs: [
          "- **IaaS** (Infrastructure as a Service): virtual machines and networks. *AWS EC2, Google Compute Engine.* You manage the OS and up.\n- **PaaS** (Platform as a Service): you push code; the platform runs it. *Render, Heroku, Vercel, Google App Engine.*\n- **SaaS** (Software as a Service): finished software you use. *Gmail, Notion.*\n- **Serverless**: run functions on demand without managing servers. *AWS Lambda, Cloudflare Workers.*",
        ],
      },
      {
        heading: "Regions and availability",
        paragraphs: [
          "Cloud providers run data centres in **regions** around the world (e.g. `ap-south-1` in Mumbai). Pick a region close to your users for low latency, and spread critical systems across **availability zones** so one failure doesn't take you down.",
        ],
      },
      {
        heading: "The big three",
        paragraphs: ["**AWS**, **Microsoft Azure** and **Google Cloud** offer similar building blocks with different names. Learn the concepts (compute, storage, networking, IAM, databases) and you can move between them."],
      },
    ],
    keyPoints: [
      "Cloud = rent computing on demand, pay for usage.",
      "IaaS → PaaS → SaaS: you manage less at each step.",
      "Choose regions near users; use multiple zones for resilience.",
      "Concepts transfer across AWS, Azure and GCP.",
    ],
  },
  {
    slug: "linux-command-line",
    title: "The Linux Command Line",
    module: "Foundations",
    duration: 15,
    summary: "The terminal skills every DevOps and backend engineer uses daily.",
    sections: [
      {
        heading: "Why Linux?",
        paragraphs: ["Most servers in the cloud run Linux. Being comfortable in a terminal lets you inspect, fix and automate them."],
      },
      {
        heading: "Moving around and managing files",
        paragraphs: [],
        code: `pwd                    # where am I?
ls -la                 # list files, including hidden
cd /var/log            # change directory
mkdir -p projects/api  # create folders
cp app.js app.bak.js   # copy
mv old.txt new.txt     # move / rename
rm -r build/           # delete (careful: there's no undo)`,
        language: "Shell",
      },
      {
        heading: "Reading and searching",
        paragraphs: [],
        code: `cat config.json             # print a file
less server.log             # scroll a long file (q to quit)
tail -f server.log          # follow a log live
grep -rn "ERROR" logs/      # search text recursively
ps aux | grep node          # find running processes`,
        language: "Shell",
      },
      {
        heading: "Permissions and remote access",
        paragraphs: [
          "Every file has permissions for its owner, group and others. `chmod +x deploy.sh` makes a script executable. `sudo` runs a command as the administrator, so use it deliberately.",
          "`ssh user@server-ip` opens a terminal on a remote machine. Use SSH keys instead of passwords.",
        ],
      },
    ],
    keyPoints: [
      "Most cloud servers run Linux.",
      "ls, cd, cp, mv, rm, mkdir cover daily file work.",
      "tail -f and grep are your debugging friends.",
      "Use SSH keys and sudo carefully.",
    ],
  },
  {
    slug: "docker-containers",
    title: "Containers with Docker",
    module: "Building & Shipping",
    duration: 20,
    summary: "Package an app with everything it needs so it runs the same everywhere.",
    sections: [
      {
        heading: "\"It works on my machine\"",
        paragraphs: [
          "A **container** packages your code with its runtime, libraries and settings. It runs the same on your laptop, a teammate's laptop and production. Containers are lighter than virtual machines because they share the host's kernel.",
        ],
      },
      {
        heading: "A Dockerfile",
        paragraphs: ["A Dockerfile is a recipe for building an **image**. Running an image creates a **container**."],
        code: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5050
CMD ["node", "src/server.js"]`,
        language: "Dockerfile",
      },
      {
        heading: "Build and run",
        paragraphs: [],
        code: `docker build -t notequest-api .
docker run -p 5050:5050 --env-file .env notequest-api
docker ps            # running containers
docker logs <id>     # see output`,
        language: "Shell",
      },
      {
        heading: "Docker Compose",
        paragraphs: ["Real apps need several services. Compose describes them in one file and starts them together."],
        code: `services:
  api:
    build: .
    ports: ["5050:5050"]
    environment:
      MONGODB_URI: mongodb://db:27017/notequest
    depends_on: [db]
  db:
    image: mongo:7
    volumes: [mongo-data:/data/db]
volumes:
  mongo-data:`,
        language: "YAML",
      },
    ],
    keyPoints: [
      "Containers bundle an app with its dependencies.",
      "Dockerfile → image → container.",
      "Map ports with -p and pass config with environment variables.",
      "Compose runs multi-service apps locally.",
    ],
  },
  {
    slug: "ci-cd-pipelines",
    title: "CI/CD Pipelines",
    module: "Building & Shipping",
    duration: 15,
    summary: "Automatically test, build and deploy every change.",
    sections: [
      {
        heading: "Continuous Integration and Delivery",
        paragraphs: [
          "- **CI**: every push automatically installs dependencies, runs linters and tests, and builds the project. Broken code is caught in minutes.\n- **CD**: changes that pass CI are automatically deployed to staging or production.",
        ],
      },
      {
        heading: "A GitHub Actions workflow",
        paragraphs: [],
        code: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
        language: "YAML",
      },
      {
        heading: "Good pipeline habits",
        paragraphs: [
          "- Keep pipelines fast; slow CI gets ignored.\n- Store secrets in the CI provider's secret store, never in the repo.\n- Protect `main`: require passing checks and a review before merging.\n- Make deploys easy to roll back.",
        ],
      },
    ],
    keyPoints: [
      "CI tests and builds every change automatically.",
      "CD ships passing changes automatically.",
      "GitHub Actions workflows live in .github/workflows.",
      "Protect main and keep secrets in the CI secret store.",
    ],
  },
  {
    slug: "monitoring-and-scaling",
    title: "Monitoring and Scaling",
    module: "Running in Production",
    duration: 15,
    summary: "Know when something breaks and keep apps fast as traffic grows.",
    sections: [
      {
        heading: "The three pillars of observability",
        paragraphs: [
          "- **Logs**: what happened, line by line.\n- **Metrics**: numbers over time such as requests/second, error rate, CPU, latency.\n- **Traces**: one request's journey across services.",
          "Set **alerts** on what users feel (error rate, slow responses), not just CPU.",
        ],
      },
      {
        heading: "Scaling up vs scaling out",
        paragraphs: [
          "- **Vertical scaling**: a bigger machine. Simple, but has a ceiling.\n- **Horizontal scaling**: more machines behind a **load balancer**. Requires stateless app servers (sessions in a database or cookie, not in memory).",
        ],
      },
      {
        heading: "Cheap wins first",
        paragraphs: [
          "- Add database **indexes** for slow queries.\n- **Cache** expensive results (Redis, CDN).\n- Serve static files from a **CDN**.\n- Measure before and after every change.",
        ],
      },
    ],
    keyPoints: [
      "Logs, metrics and traces explain what production is doing.",
      "Alert on user-facing symptoms.",
      "Horizontal scaling needs stateless servers.",
      "Indexes, caching and CDNs are the first performance wins.",
    ],
  },
];
