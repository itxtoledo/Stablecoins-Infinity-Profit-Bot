FROM node:8
# Create app directory
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD [ "npm", "start" ]
