FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
ENV NODE_ENV=production
CMD ["npm", "start"]
