<h1 align="center">
   <br>
   <a href='https://www.linkpicture.com/view.php?img=LPic63ab0e5ff1b4d378618310'>
      <img src='https://www.linkpicture.com/q/ASAP-Aapoorthi-Shrinkhala-Prabhandhak.svg' type='image'
         alt="ASAP Logo" /></a>
</h1>
<h2 align="center" width="300">ASAP – Aapoorthi Shrinkhala Prabhandhak will use blockchain technology to enable
   efficient communication and data exchange across global supply chains, providing proof of product origin and
   ownership to customers.</h2>

<p align="center">
   <a href='https://www.linkpicture.com/view.php?img=LPic63ab0fd52cfc91731415250'><img
         src='https://www.linkpicture.com/q/branch-master_1.svg' type='image' alt="branch" /></a>
   <a href='https://www.linkpicture.com/view.php?img=LPic63ab0fd52cfc91731415250'><img
         src='https://www.linkpicture.com/q/license.svg' type='image' alt="license" /></a>
</p>

<p align="center">
   <a href="#platform">Platform</a> •
   <a href="#core-features">Core features</a> •
   <a href="#project-structure">Project Structure</a> •
   <a href="#resources">Resources</a> •
   <a href="#contributing">Contributing</a> •
   <a href="#license">License</a>
</p>

---

## Platform

<img align="right" width="400" src='https://www.linkpicture.com/q/project-diagram.svg' type='image'></a>

**Smart Contracts**: The smart contracts built in Solidity and running on the Ethereum blockchain are at the heart of ASAP. These constitute an open platform with which anybody may interact.

**ASAP Dashboard**: It provides an overview of the platform's key Smart-Contract based features.

**ASAP Web3 library**: A JS framework that makes it easier to engage with ASAP contracts by allowing communication between existing Supply Chain Management applications and distributed ledger technology.

**ASAP Client App**: A mobile-first online application that allows end consumers to access each product's entire provenance history.

## Core features overview

### Representation of actual products as non-fungible digital tokens and recipes for their modernization

To depict a manufacturing process digitally, tokens can be minted, added to a batch, or changed into a new token based on a predefined formula.

#### Batching

Each batch of materials corresponds to a single token with distinct characteristics. Batches of materials can be transported or utilised as input for new materials.

#### Transport

Batches can be passed from one entity to the next.

#### Company and goods certification

Supply chain entities and materials can be audited by third-party "certificate authority" organisations. These credentials express effect about their business, products, and supply chain policies.

- **Company identity**: Each organisation that uses the ASAP ecosystem is identifiable by an Ethereum address.
  - Manufacturing firms: Acquire raw resources, manufacture materials, batch them, and transport them.
  - Transportation company: An intermediary between different sorts of businesses that may manage transportation.
- **Raw Materials**
  - Non-fungible digital tokens are generated on a blockchain for each batch of manufactured items.
- **Materials**
  - Similar to raw materials, but made up of several raw ingredients.
- **Batches**
  - Batches are groups of the same substance or raw material variety.
- **Transports**
  - Mechanism for exchanging property. A transport is made up of the sender, the receiver, and the transport business.
- **Certificates**
  - Certificates are a way for businesses to explain the effect of their products, services, and supply chain processes.
- **Certificate Authority**:
  - Certificate authority can provide certifications to goods, raw resources, and businesses.

## Project structure

```
├── frontend - ASAP Dashboard and Client App source
├── library - ASAP Library
├── truffle - ASAP Smart Contracts
├── docs - Overall project documentation
├── presentation - Proofchian presentation website
├── misc - Other utility code
├── lerna.json
├── package.json
├── README.md
└── ...
```

## Resources

- [ASAP DEMO](https://demo.proofchain.alexcambose.ro/)

- [Presentation website](https://proofchain.alexcambose.ro/)

- [General documentation](https://docs.proofchain.alexcambose.ro/)

- [Frontend information](./frontend/)

- [Smart contracts information](./truffle/)

- [Smart contracts docs](./truffle/docs)

- [Library informtion](./library/)

- [Library docs](https://library.proofchain.alexcambose.ro/)

## Contributing

Pull requests are encouraged. Please open an issue first to discuss what you want to modify before making substantial changes.

Please ensure that tests are updated as needed.

## License

[MIT](https://choosealicense.com/licenses/mit/)
