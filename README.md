# Kilojoules

A tiny web app that puts the kilojoules from a workout into perspective.
Type in what you burned and it tells you how many Big Macs (or whatever
else you've added) that is.

- Plain HTML, CSS and JavaScript. No framework, no build step.
- Comparisons live in the browser's local storage. Nothing leaves the device.
- Installable as a progressive web app, and works offline once installed.

## Running it locally

Any static file server will do, for example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploying

Pushes to `main` deploy to GitHub Pages via the workflow in
`.github/workflows/deploy.yml`. For that to work, set the repository's
Pages source to **GitHub Actions** under Settings → Pages.

## Installing on an iPhone

Open the site in Safari, tap Share, then **Add to Home Screen**.
