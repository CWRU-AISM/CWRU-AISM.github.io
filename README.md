# AISM Lab website

Website of the Augmented Intelligence for Smart Manufacturing Lab at Case Western Reserve University. It is a plain Jekyll site with no theme, so GitHub Pages builds it as-is.

Most updates only touch the YAML files in `_data/`. Edit one, commit, push, and GitHub Pages rebuilds the site within a minute or two.

## Common edits

| To change | Edit |
|---|---|
| People and alumni | `_data/people.yml` |
| News | `_data/news.yml` (newest first; the home page shows the top five) |
| Publications | `_data/publications.yml` (sorted by `date` and grouped by `year` automatically) |
| Research areas, topics, and their papers | `_data/research.yml` (order of areas on the home page is set in `index.html`) |
| Home page video grid | `_data/grid.yml` |
| PI email, office, lab rooms, Scholar link | `_config.yml` under `pi:` |
| Partners on the home page globe | `_data/collaborators.yml` |
| PI bio | `people.html` |
| Page text and openings | `index.html`, `research.html`, `contact.html` |
| Group and lab photos | `assets/img/lab/` (used on People and Contact) |

### Add a person

1. Put a square headshot in `assets/img/people/`, named like `first-last.jpg`. Around 400×400 is plenty.
2. Add an entry under the right group in `_data/people.yml`:

   ```yaml
   - name: First Last
     photo: first-last.jpg
     website: https://example.github.io/
     note: One line on their research
   ```

   The photo and name link to `website`, or to `scholar`, or to `linkedin`, whichever comes first. Leave out `photo` for a blank avatar showing their initial. Empty groups are hidden, so the Postdoc, Collaborator, and Master's sections appear once someone is added.
3. When someone graduates, move them to `alumni:` and fill in `degree` and `now`.

### Add a publication

```yaml
- title: "Paper title"
  date: 2027-03-15      # sets the order on the page, newest first
  authors: "A. Author, Peng Wang"
  venue: "Journal or Conference name"
  type: journal         # preprint (includes under review), conference, journal, or chapter
  year: 2027
  doi: https://doi.org/...
  # optional: arxiv, project, code, pdf
```

### Add a video to the home grid

Encode the clip small and silent, then add an entry to `_data/grid.yml`. The grid is four tiles per row (currently 4×3), so keep the count a multiple of four. A still photo works too: save a 640×360 `.jpg` and mark the entry `still: true`.

```sh
ffmpeg -ss 0 -t 12 -i source.mp4 -an \
  -vf "scale=640:360:force_original_aspect_ratio=increase,crop=640:360,fps=30" \
  -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart \
  assets/media/grid/name.mp4
ffmpeg -ss 1.5 -i assets/media/grid/name.mp4 -frames:v 1 -q:v 4 assets/media/grid/name.jpg
```

Clips with a white background that shouldn't be cropped can swap the `crop` step for `pad=640:360:-1:-1:color=white`. Keep each clip under about 1 MB.

To put several clips into one tile (as with the SPARK robot runs), speed each up with `setpts=PTS/<factor>` and join them with ffmpeg's `concat` filter.

## Run it locally and see changes live

### 1. Install Ruby and Bundler (once)

The site builds with Jekyll, which runs on Ruby 3.x.

- **Ubuntu / Debian**

  ```sh
  sudo apt update
  sudo apt install ruby-full build-essential zlib1g-dev
  echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
  echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  gem install bundler
  ```

- **macOS** (with [Homebrew](https://brew.sh); the system Ruby is too old)

  ```sh
  brew install ruby
  echo 'export PATH="$(brew --prefix ruby)/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  gem install bundler
  ```

- **Windows**: install Ruby+Devkit 3.x from [rubyinstaller.org](https://rubyinstaller.org/), let it run `ridk install` at the end, then run `gem install bundler` in a new terminal.

Check with `ruby -v` (3.x) and `bundle -v`.

### 2. Install the site's gems (once, and again whenever `Gemfile` changes)

From the repository folder:

```sh
bundle config set --local path vendor/bundle
bundle install
```

This installs the `github-pages` gem, which pins the same Jekyll version GitHub uses, so what you see locally is what gets deployed.

### 3. Serve with live reload

```sh
bundle exec jekyll serve --livereload
```

Open http://localhost:4000. Jekyll rebuilds the site whenever you save a file, and the browser refreshes on its own. Changes to `_config.yml` are the one exception: stop the server with Ctrl+C and start it again.

To view it from another device on the same network, add `--host 0.0.0.0` and open `http://<your-computer's-IP>:4000`.

### No Ruby? Use Docker instead

```sh
docker run --rm -it -p 4000:4000 -p 35729:35729 -v "$PWD":/srv -w /srv \
  -e BUNDLE_PATH=/srv/vendor/bundle ruby:3.3 \
  sh -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"
```

Then open http://localhost:4000. Live reload works the same way.

### Troubleshooting

- `Could not find gem` or other bundler errors: run `bundle install` again.
- `cannot load such file -- webrick`: you are on an old checkout. Run `bundle add webrick`.
- Port 4000 already in use: add `--port 4001`.
- A page looks stale: stop the server, delete the `_site` folder, and start it again.

## Deploy

The site is live at https://cwru-aism.github.io/. Every push to `main` rebuilds and deploys it through the workflow in `.github/workflows/pages.yml`, which takes about a minute. Progress shows under the repository's Actions tab, and a failed build there leaves the previous version of the site online.

The repository is public. Pages is set to deploy from GitHub Actions (Settings, then Pages, then Source). The org's project pages (`/spark-page/`, `/QUANpaper/` and so on) are served alongside the site and are not affected by it.

## Design

`DESIGN.md` records the fonts, colors, and layout rules. The tokens live at the top of `assets/css/site.css`.
