# Curiosity Report

## Netfilx DevOps

Reading about how Netfilx started Chaos Monkey during the Chaos deliverable intrigued me. I was curious about how Netfilx became a major player in developing DevOps tools. So, for my curiosity report I will be diving into Netfilx, and learning about their involvement in DevOps.

### Brief History/Overview

Netfilx is the most popular streaming service in the world. It has over 300 million subscribers, and a net income over $10 billion. Available in over 190 countries, it is incredible it doesn't have major uptime problems.

### DevOps

In 2008 Netflix had a major database corruption. At the time they were still mainly a DVD rental buisness. The corruption caused a three day outage in their shipping services. One third of their customers were affected by the outage. They recognized that their system which had been vertically scaling and had a single point of failure needed to be updated. So, they switched from relational databases in their datacenter to horizontally scalable distributed systems in the cloud. This switch was mostly to amazons cloud services. Eventually they got to the point that they were launching more than one million conatainers per week, and have developed their own container management tool Titus.

After the switch to AWS Netfilx started looking for a way to improve their systems handeling of unexpected outage. That's where Chaos Monkey comes in. They came up with the idea that the best way to be prepared for any unseen errors was to fail constantly without making their services go down. So they developed a tool for automating failure and continuous testing: Chaos Monkey. The name for Chaos Monkey comes from the idea of unleashing a wild monkey with a weapon in your data center that randomly shoots down instances and chews through cables, while you continue to serve customers without interruption. The creation of Chaos Monkey eventually led to the development of The Simian Army, a collection of different "monkeys" that each cause different problems or enact different checks ensuring that your system is always prepared for any sort of outage.

On top of developing new technologies, Netfilx has also restructured their development cycle and practices to make their culture cutting edge. They initially had siloed teams, or teams that each focued on a different part of the design process. E.g. design, development, testing, etc.. Specialized roles have some advantages, but it causes some inefficiencies across the software development life cycle (SDLC). Communication overhead and bottlenecks cause loss in knowledge. This in turn makes problems more difficult to detect and therefore more time consuming to resolve. To solve this problem Netfilx broke apart their silos, giving full ownership of the SDLC to different teams working on different technologies. This way each team owned all their errors and had all the knowledge about thier product.

Here are a few main ideas to take from this strategy:

1. Avoid systems that say no to developers

- Remove push schedules, windows etc. for engineers.
- Give production access to every engineer

2. Give freedom AND responsibility to Engineers

- Hire people who you trust, and let them solve problems in their own way

3. Focus on enablement

- Allow teams to work in their way (language, IDE, etc.)
- Don't over-control or contain
- Eliminate processes and procedures to encourage quick movement

4. "You build it, you run it"

These principles don't work for every product, but have clearly worked for Netflix. With near zero down-time, they are a gold standard for DevOps.
