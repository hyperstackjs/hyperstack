#
# Hyperstack compile optimized build
# Will run compiled ts to js code from dist/
#
FROM node:18-alpine as base 
RUN npm i -g pnpm

FROM base as dependencies

WORKDIR /app 
COPY package.json pnpm-lock.yaml ./
RUN \
  apk add --no-cache g++ make python3 postgresql-libs git

RUN \
  apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
  pnpm install libpq && \
  apk --purge del .build-deps  
RUN pnpm install


FROM base as build 
WORKDIR /app 
COPY . . 
COPY --from=dependencies /usr/lib /usr/lib
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build 
RUN pnpm prune --prod 

FROM base as deploy

WORKDIR /app  
COPY --from=build /usr/lib /usr/lib
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules 

WORKDIR /app/dist  
CMD ["node", "bin/hyperstack.js", "start"]
