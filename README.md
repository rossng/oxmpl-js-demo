# OxMPL Motion Planning Demo

A web-based demonstration of the [OxMPL](https://github.com/juniorsundar/oxmpl) motion planning library using WebAssembly bindings. Shows the RRT (Rapidly-exploring Random Tree) algorithm solving path planning problems with obstacle avoidance.

## Setup

1. Clone with submodules:
   ```bash
   git clone --recursive <repo-url>
   cd oxmpl-demo
   ```

   If already cloned without submodules:
   ```bash
   git submodule update --init --recursive
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

Open the browser to the displayed local URL. Adjust the planning parameters using the controls and click "Plan Path" to see the algorithm find a collision-free route from start to goal.