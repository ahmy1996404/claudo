# claudo

A realistic deep space theme for the Claude desktop and mobile apps. A black hole hangs near the top of the window, its hot accretion disk bent around the shadow by its own gravity, with bright spots circling the disk. Around it, colorful nebulae with dark dust lanes slowly breathe, a young star cluster glows, a comet drifts by past two distant galaxies, meteors streak past, a satellite crosses the sky, and across a dense starfield some stars glow bright and then fade back into the dark.

It comes in two versions of the same idea: a pale, airglow-lit sky in light mode and near-black space in dark mode, with a periwinkle accent. All the art stays in the top part of the window and away from the middle and the message box, and every text color keeps at least 15:1 contrast. With reduced motion turned on, the scene holds still.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install claudo --marketplace ahmy1996404/claudo
```

Answer `y` to add the marketplace, then pick a scope (user scope is first; press Enter). The theme turns on right away.

From a shell:

```bash
claude plugin install claudo --marketplace ahmy1996404/claudo
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `ahmy1996404/claudo`, then **Add plugin**.

## What it changes

- **Colors**: a full light and dark palette for the app (surfaces, text, accent, and red, green and amber for errors, success and warnings).
- **Backdrop**: an animated scene behind the conversation in the desktop and mobile apps. The terminal and editors keep their own look.

It runs no tools, reads no files and sends nothing anywhere: it only sets the app's theme when a session starts.

## License

MIT
