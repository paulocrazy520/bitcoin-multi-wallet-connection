FROM node:18.15.0

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
ENV NODE_ENV=production

EXPOSE 3003

CMD ["yarn", "preview"]

