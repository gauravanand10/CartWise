# CartWise frontend — production image. Chapter 25.
#
# Vite builds to static files; nginx serves them. `npm run dev` does not appear anywhere in this
# file, which is the distinction the chapter asks for: the dev server is a development tool with a
# file watcher, an HMR websocket and unminified modules, and running it as a production server
# means shipping all three plus a Node process to hold them.

# ---------------------------------------------------------------------------------------------
# Stage 1 — build
# ---------------------------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /build

# Lockfile-only install first, for the same layer-caching reason as the backend's pom: dependencies
# change far less often than source.
#
# `npm ci`, not `npm install` — it installs exactly what package-lock.json pins and fails if the
# lockfile and package.json disagree, rather than quietly resolving something newer. A production
# image should build the same way twice.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# CHAPTER 30 — THE DEPLOYED API HOST, AS A BUILD ARGUMENT.
#
# Compose never needed this: `docker-compose.yml` publishes both services to the host's own
# loopback (frontend on :8081, backend on :8080), so the unset default in `services/api.ts` —
# `http://localhost:8080/api` — happens to be correct there. It is correct BECAUSE the browser
# runs on the same machine as both containers, which is a coincidence of local Compose and not
# true of any real deployment.
#
# On Railway or Render the frontend and backend are two separate services, each with its own
# HTTPS hostname, and neither is `localhost` to the browser. Vite reads `import.meta.env.*` at
# BUILD time, not at container start — an `ENV` set on the running nginx container would be
# invisible to a bundle that was already written to static files. A build ARG is therefore the
# only point in this Dockerfile where the value can still reach the bundle.
#
# Unset, this defaults to the same `http://localhost:8080/api` the unset environment variable
# already falls back to — so an image built exactly as Compose has always built it is unaffected.
# A platform deployment supplies the real one:
#
#     docker build --build-arg VITE_API_URL=https://cartwise-api.up.railway.app/api .
#
# See railway.toml / render.yaml for where that value comes from during an actual deploy.
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL

# `npm run build` is `tsc -b && vite build`, so a type error fails the image build rather than
# shipping a broken bundle. That is worth keeping even though CI type-checks separately: the two
# catch the same class of problem at different moments, and only this one blocks the artifact.
RUN npm run build

# ---------------------------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# The SPA routing config. Without it, any deep link — /browse, /product/iphone-16-pro — 404s,
# because nginx looks for a file at that path and React Router never gets the chance to handle it.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /build/dist /usr/share/nginx/html

# nginx's own unprivileged image variant would be tidier still, but the stock image drops to the
# `nginx` user for its workers already and the master needs root only to bind port 80 inside the
# container's own namespace. Left as-is rather than restructured, and noted so the choice is
# visible rather than accidental.

EXPOSE 80

# No secrets here either, and unlike the backend the reason is structural rather than a matter of
# discipline: this image contains a *static bundle*. Anything the frontend knows is already in
# JavaScript that every visitor downloads, so there is no such thing as a secret this image could
# hold. The API base URL is baked at build time and is public information.
#
# The corollary is worth stating because it is a common mistake: a VITE_* variable is not a way to
# pass a secret to a browser app. It is compiled into the bundle and is readable in devtools.

# nginx's own entrypoint handles config templating and signal forwarding; overriding CMD is
# unnecessary and would lose both.
