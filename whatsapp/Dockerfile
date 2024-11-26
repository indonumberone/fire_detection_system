FROM node:18-alpine

WORKDIR /home/nodejs/app

COPY package*.json ./

RUN npm install --production && npm cache clean --force

COPY . .

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs && chown -R nodejs:nodejs /home/nodejs

USER nodejs

EXPOSE 3030

CMD ["npm", "start"]
