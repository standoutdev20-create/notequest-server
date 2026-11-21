export default [
  {
    slug: "network-models-osi-tcpip",
    title: "Network Models: OSI and TCP/IP",
    module: "Foundations",
    duration: 15,
    summary: "The layered model that explains how data travels across networks.",
    sections: [
      {
        heading: "Why layers?",
        paragraphs: [
          "Networking is split into **layers**, each solving one problem and relying on the layer below. You can change Wi-Fi to fibre without rewriting your browser, because the layers are independent.",
        ],
      },
      {
        heading: "The TCP/IP model",
        paragraphs: [
          "- **Application**: HTTP, DNS, SMTP. What your apps speak.\n- **Transport**: TCP and UDP. Reliable or fast delivery between programs, identified by **ports**.\n- **Internet**: IP. Addressing and routing packets between networks.\n- **Link**: Ethernet, Wi-Fi. Moving bits across one physical network.",
          "The **OSI model** has seven layers (Physical, Data Link, Network, Transport, Session, Presentation, Application). It's mostly used as vocabulary: \"that's a layer 7 problem\" means an application issue.",
        ],
      },
      {
        heading: "TCP vs UDP",
        paragraphs: [
          "- **TCP** sets up a connection, numbers every packet, and resends lost ones. It's reliable and ordered, which is why the web, email and file transfer use it.\n- **UDP** just sends packets: faster with less overhead, but no guarantees. Used by video calls, games and DNS.",
        ],
      },
    ],
    keyPoints: [
      "Layers separate concerns so technologies can change independently.",
      "TCP/IP: Application, Transport, Internet, Link.",
      "TCP is reliable and ordered; UDP is fast and best-effort.",
      "Ports identify programs; IP addresses identify machines.",
    ],
  },
  {
    slug: "ip-addressing-and-subnets",
    title: "IP Addressing and Subnets",
    module: "Foundations",
    duration: 15,
    summary: "IPv4, IPv6, private ranges, CIDR and how routers decide where packets go.",
    sections: [
      {
        heading: "IP addresses",
        paragraphs: [
          "An **IPv4** address is 32 bits written as four numbers: `192.168.1.10`. There are only about 4.3 billion of them, so **IPv6** uses 128 bits: `2001:db8::1`.",
        ],
      },
      {
        heading: "Private ranges and NAT",
        paragraphs: [
          "Home and office networks use **private** ranges that aren't reachable from the internet: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Your router uses **NAT** to share one public IP among all your devices.",
        ],
      },
      {
        heading: "CIDR and subnets",
        paragraphs: ["The `/24` in `192.168.1.0/24` says how many bits are the **network** part. The rest identify hosts."],
        code: `192.168.1.0/24   → 256 addresses (192.168.1.0 – 192.168.1.255)
10.0.0.0/16      → 65,536 addresses
10.0.1.0/28      → 16 addresses

Usable hosts = 2^(32 - prefix) - 2   (network + broadcast reserved)`,
        language: "Text",
      },
      {
        heading: "Routing",
        paragraphs: ["Each router looks at a packet's destination IP and forwards it to the next hop, using its **routing table**. Your device sends anything not on its local subnet to the **default gateway**, usually your router."],
      },
    ],
    keyPoints: [
      "IPv4 is 32-bit; IPv6 is 128-bit.",
      "Private ranges plus NAT let many devices share one public IP.",
      "CIDR /n = n network bits; smaller n = bigger network.",
      "Routers forward packets hop by hop using routing tables.",
    ],
  },
  {
    slug: "dns-and-http",
    title: "DNS and HTTP",
    module: "Application Layer",
    duration: 15,
    summary: "How names become addresses, and how browsers talk to servers.",
    sections: [
      {
        heading: "DNS: the internet's phone book",
        paragraphs: [
          "DNS turns `notequest.in` into an IP address. Your computer asks a **resolver**, which asks the root servers, then the `.in` servers, then the domain's own servers, and caches the answer.",
          "- **A / AAAA**: name → IPv4 / IPv6 address.\n- **CNAME**: alias to another name.\n- **MX**: mail servers for the domain.\n- **TXT**: verification and email security records.",
        ],
        code: `dig notequest.in A +short
nslookup notequest.in`,
        language: "Shell",
      },
      {
        heading: "HTTP methods and status codes",
        paragraphs: [
          "HTTP is a request/response protocol on top of TCP. Methods say what you want: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Status codes say what happened: **2xx** success, **3xx** redirect, **4xx** client error, **5xx** server error.",
        ],
      },
      {
        heading: "HTTPS",
        paragraphs: [
          "HTTPS is HTTP inside **TLS** encryption. The server proves its identity with a certificate signed by a trusted authority, and the two sides agree on keys so no one in the middle can read or change the traffic. Every site should use HTTPS; free certificates come from Let's Encrypt.",
        ],
      },
    ],
    keyPoints: [
      "DNS resolves names to IP addresses using a hierarchy plus caching.",
      "A, CNAME, MX and TXT are the record types you'll meet first.",
      "HTTP methods describe intent; status codes describe results.",
      "HTTPS = HTTP + TLS encryption and server authentication.",
    ],
  },
  {
    slug: "network-security-basics",
    title: "Network Security Basics",
    module: "Security",
    duration: 15,
    summary: "Firewalls, common attacks and the habits that keep systems safe.",
    sections: [
      {
        heading: "Defence in depth",
        paragraphs: ["No single control is enough. Layer protections so that if one fails, others still stand: firewalls, encryption, strong authentication, updates and monitoring."],
      },
      {
        heading: "Firewalls and ports",
        paragraphs: [
          "A firewall allows or blocks traffic by IP, port and protocol. Follow **least privilege**: open only what's needed. A typical web server exposes `443` (HTTPS) and maybe `80` (redirect to HTTPS), with SSH (`22`) limited to your own IPs.",
        ],
      },
      {
        heading: "Common attacks",
        paragraphs: [
          "- **Phishing**: tricking people into giving up passwords. Use MFA everywhere.\n- **Man-in-the-middle**: intercepting traffic on insecure networks. HTTPS and VPNs protect you.\n- **DDoS**: flooding a service with traffic. CDNs and rate limiting help.\n- **Unpatched software**: the most common way in. Keep systems updated.",
        ],
      },
      {
        heading: "Everyday habits for developers",
        paragraphs: [
          "- Use a password manager and MFA.\n- Never commit secrets; rotate any that leak.\n- Hash passwords with bcrypt/argon2 and never store them in plain text.\n- Validate all input on the server.",
        ],
      },
    ],
    keyPoints: [
      "Layer defences: no single control is enough.",
      "Open only the ports you need.",
      "Phishing, MITM, DDoS and unpatched software are the big threats.",
      "MFA, HTTPS, hashing and updates prevent most incidents.",
    ],
  },
];
