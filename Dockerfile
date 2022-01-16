FROM node:lts as builder

WORKDIR /app

COPY . .

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

ARG NUXT_ENV_API_HOST
ARG NUXT_ENV_API_HOST_WS

ENV NUXT_ENV_API_HOST=$NUXT_ENV_API_HOST
ENV NUXT_ENV_API_HOST_WS=$NUXT_ENV_API_HOST_WS

RUN yarn build

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

FROM node:lts

WORKDIR /app

COPY --from=builder /app  .

ENV HOST 0.0.0.0
EXPOSE 80

CMD [ "yarn", "start" ]
