# postgres 

FROM postgres:latest

ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB
ARG POSTGRES_PORT

ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_PORT=${POSTGRES_PORT}

# install postgres extensions
RUN apt-get update && apt-get install -y postgresql-contrib
COPY schemas/trading_sim_schema.sql /docker-entrypoint-initdb.d/

EXPOSE ${POSTGRES_PORT}


