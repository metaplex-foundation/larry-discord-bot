<a href="https://discord.gg/metaplex"><img src="https://img.shields.io/discord/848060988636921856?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
# Larry the Metaplex Discord Bot 

Larry is a suite of two separate bots:
1. The docs bot
2. The mod bot

Larry splits these functions into two bots to both allow for more modularity and to improve each of the bots performance. 

---
## The Docs Bot: 
The first bot allows you to hook into any Algolia DocSearch index and uses the interaction autocomplete functionality to make it easy for users to query documentation. 
>TODO:
> - [ ] Add funcitonality to store custom FAQs on a per server basis
> - [ ] Convert the docs commands to a class and enable servers to deploy their own docs commands with an Algolia index and key 

---
## The Mod Bot:
The mod bot does a number of things:
- check members on join and compares their username to that of the moderation team of a server (configurable on a per server basis). If it matches, the user is immediately kicked and the team is alerted. 
- get a list of probable bots in a server, and can perform bulk actions (kick/ban) on all of them.
- A number of other helpful things.
>TODO:
> - [ ]  Finish this bot
