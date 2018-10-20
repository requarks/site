FROM node:8-alpine

ENV VIRTUAL_HOST requarks.io,www.requarks.io

WORKDIR /var/www/

COPY assets assets/
COPY controllers controllers/
COPY middlewares middlewares/
COPY modules modules/
COPY node_modules node_modules/
COPY views views/
COPY index.js package.json /var/www/

EXPOSE 8000
ENTRYPOINT ["node", "index.js"]
