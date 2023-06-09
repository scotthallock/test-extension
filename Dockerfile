# ============ Build the backend ============ 
FROM node:18.12-alpine3.16 AS backend-builder
WORKDIR /backend
# cache packages in layer
COPY backend/package.json /backend/package.json
COPY backend/package-lock.json /backend/package-lock.json
RUN --mount=type=cache,target=/usr/src/backend/.npm \
    npm set cache /usr/src/backend/.npm && \
    npm ci
# copy files
COPY backend /backend


# ============ Build the frontend ============ 
FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# copy files
COPY ui /ui
# build with vite
RUN npm run build


# ============ Configure the Docker Extension ============ 
FROM alpine
LABEL org.opencontainers.image.title="Test extension" \
    org.opencontainers.image.description="Just a little test extension for Docker Desktop" \
    org.opencontainers.image.vendor="PSDJ" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.categories="" \
    com.docker.extension.changelog=""

COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=backend-builder /backend backend
COPY --from=client-builder /ui/build ui

# ============ Start the Extension ============ 

# The `alpine` image does not have node by default.
# So we must install npm (and node) with this command:
RUN apk add --update npm

# Start the backend service
WORKDIR /backend
CMD ["npm", "start"]