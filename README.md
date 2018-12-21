# Element CLI

The [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface) for developing and managing building [blocks](https://github.com/volusion/element-tutorial) for the next generation of [Volusion](https://www.volusion.com) storefronts

## Table of Contents

- [Installing](#installing)
- [Using the CLI](#using-the-cli)
- [Developing for the CLI](#developing-for-the-cli)
- [Built With](#built-with)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Installing

After [installing Node.js](https://nodejs.org/en/download/), run

```bash
npm install -g @volusion/element-cli
```

## Using the CLI

### `element login`

The command for logging into the Element ecosystem. This is necessary for publishing and updating [blocks](https://github.com/volusion/element-tutorial#vocabulary).

Use the same credentials you use to log into your [Volusion store admin](https://admin.volusion.com).

* * *

### `element new NAME`

The command for scaffolding a new block. The command will clone the [Element Block Starter repo](https://github.com/volusion/element-blockstarter), allowing you to quickly get started with your development process.

* * *

### `element publish --name "A NAME TO DISPLAY TO USERS" --category "OPTIONAL CATEGORY"`

From the root directory of the block you intend to eventually make available to users of the Site Designer on the [Volusion store admin](https://admin.volusion.com).

By default, _newly-published blocks will only be visible to you and the other members of your organization_.

In the event that a `-c/--category` flag is not passed, you will be prompted with a list of valid Category names from which to select.

_Protip_: `element publish -n "A NAME TO DISPLAY TO USERS" -c "OPTIONAL CATEGORY"`

* * *

### `element update`

After you make changes to your block, and are ready test to them in the Site Designer, run this command from the root directory of the block. You'll likely run this command often.

### `element update --toggle-public`

There's only one optional flag for this command, and it's to make your initially-private block public, and available in the world.

_Protip_: `element update -p`

* * *

### Adding a Thumbnail

Create a PNG file, ideally less than 100 kb in size, and save it in the root directory of the block as `thumbnail.png.` When publishing or updating your block, this file will be saved and then be shown in the Volusion store admin's [Site Designer](https://admin.volusion.com/designer).

### Getting CLI Help

```bash
element --help

# Or for individual commands, e.g.
element publish --help
```

## Developing for the CLI

Please see the [DEVELOPING](./DEVELOPING.md) document for more information on the project requirements and workflow.

## Built With

- [Commander](https://github.com/tj/commander.js) - User interaction framework 🖼
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Hidden fields 🙈 and fancy selections 💅
- [Axios](https://github.com/axios/axios) - Making calls across the network ☎️
- [Mermaid](https://github.com/mermaidjs/mermaid.cli) - Building the diagrams 🧜‍♀️ 🧜‍♂️

## Contributing

We're very excited that you're interested in contributing! At present, we are working toward formalizing a process for providing feedback on and accepting pull requests. If you would like us to prioritize this process, please vote on [this open issue](https://github.com/volusion/element-cli/issues/1) with a 👍 . We do already have a [Code of Conduct](CODE_OF_CONDUCT.md) in place.

## Code of Conduct

Our Code of Conduct, by way of the Contributor Covenant, [can be found here](CODE_OF_CONDUCT.md).

## License

&copy; 2018 onward by Volusion
[MIT License](LICENSE)
