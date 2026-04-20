FROM emscripten/emsdk:3.1.46

# Install system dependencies required for OnlyOffice WASM build
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    cmake \
    make \
    git \
    nodejs \
    npm \
    ninja-build \
    pkg-config \
    libtool \
    autoconf \
    automake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy build script into the image
COPY build.sh /workspace/build.sh

# Make build script executable
RUN chmod +x /workspace/build.sh

CMD ["/bin/bash"]
