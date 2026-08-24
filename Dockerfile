# GitHub Action runtime image. Built fresh per run from this Dockerfile (action.yml points
# `runs.image` at it directly) rather than a prebuilt/published image -- keeps this branch's
# scope to a working Action; publishing a prebuilt image to a registry for faster cold starts
# is a follow-up, not required for correctness.
#
# Two stages so the shipped image only carries production dependencies -- config-disassembler's
# native addon is the reason this can't be a plain esbuild-bundled JS action: it ships
# platform-specific prebuilt binaries as optional dependencies, resolved by npm at install time
# for whatever platform actually runs `npm install`. Building (and installing) on the same
# node:22-slim (glibc, linux/amd64) image the Action itself runs on guarantees the right one
# (config-disassembler-linux-x64-gnu) lands in node_modules.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p . --pretty \
    && mkdir -p lib/metadata/registry \
    && cp src/metadata/registry/metadataRegistry.json lib/metadata/registry/metadataRegistry.json

# The runtime stage does NOT `npm ci` the repo's own package.json -- that lists
# @oclif/core/@salesforce/core/@salesforce/sf-plugins-core as production dependencies too
# (needed for the sf CLI plugin), which the Action's code never imports at runtime (verified:
# nothing compiled from src/action, src/core, src/metadata, src/service, or src/helpers requires
# any @oclif/@salesforce package -- the one @oclif/core import in helpers/types.ts is type-only
# and is erased by tsc). Installing a standalone manifest with just the two packages the Action
# actually needs keeps that CLI-plugin toolchain out of the image entirely.
FROM node:22-slim
WORKDIR /app
# Keep these two versions in sync with root package.json's "config-disassembler" dependency
# and "@actions/core" devDependency.
COPY docker/action-runtime-package.json ./package.json
RUN npm install --omit=dev
COPY --from=build /app/lib ./lib

ENTRYPOINT ["node", "lib/action/index.js"]
