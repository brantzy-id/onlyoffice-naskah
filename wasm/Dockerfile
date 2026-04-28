FROM node:20-alpine

RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat \
    dos2unix

WORKDIR /workspace

COPY build.sh /workspace/build.sh
RUN dos2unix /workspace/build.sh && chmod +x /workspace/build.sh

CMD ["/bin/sh"]