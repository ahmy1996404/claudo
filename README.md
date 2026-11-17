# claudo

A cozy rainy cafe theme for the Claude desktop and mobile apps. You sit by a cafe window while a storm rolls over the city: lightning cracks behind the skyline, cars and people with umbrellas pass in the rain, drops hit and race down the glass, string lights glow along the top, a pendant lamp warms a shelf with a candle and a steaming mug, a plant sways, and a cat sleeps beside a little radio playing to itself.

It comes in two versions of the same idea: a grey rainy afternoon in light mode and a rainy night in dark mode, with espresso and latte colors and a rain-blue accent. All the art stays in the top third of the window and at the very edges, so the middle and the message box stay clear, and every text color keeps at least 13:1 contrast. With reduced motion turned on, the scene holds still.

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
