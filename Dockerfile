ARG PACKAGE_VERSION

FROM darkfidis/express-template:1.0.0 as app

WORKDIR /usr/src/app

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8342

HEALTHCHECK CMD curl --fail http://localhost:8342/ping || exit 1

CMD ["node", "-r", "source-map-support/register", "dist/built/src/main"]
