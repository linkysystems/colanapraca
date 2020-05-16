FROM wejs/wejs:v1.1.5

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN echo ${NODE_ENV}

RUN npm set audit false

COPY package.json /usr/src/app/package.json
RUN npm install

COPY . /usr/src/app

CMD ["npm", "start"]