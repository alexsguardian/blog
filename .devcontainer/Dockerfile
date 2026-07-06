FROM mcr.microsoft.com/devcontainers/typescript-node:latest

USER root
RUN apt update && apt upgrade -y


# Uncomment for ARM:
RUN wget https://github.com/ltex-plus/ltex-ls-plus/releases/download/18.5.1/ltex-ls-plus-18.5.1-linux-aarch64.tar.gz && \
  mkdir /ltex && tar -xf ltex-ls-plus-18.5.1-linux-aarch64.tar.gz -C /ltex && \
   mv /ltex/ltex-ls-plus-18.5.1 /ltex/ltex-ls-plus && \
   chown -R node:node /ltex && \
   rm ltex-ls-plus-18.5.1-linux-aarch64.tar.gz

RUN wget https://download.oracle.com/java/25/latest/jdk-25_linux-aarch64_bin.tar.gz && \
  tar -xzf jdk-25_linux-aarch64_bin.tar.gz -C /opt && \
  mv /opt/jdk-25* /opt/jdk-25 && \
  update-alternatives --install /usr/bin/java java /opt/jdk-25/bin/java 1 && \
  update-alternatives --install /usr/bin/javac javac /opt/jdk-25/bin/javac 1 && \
  rm jdk-25_linux-aarch64_bin.tar.gz

RUN wget https://github.com/alexandzors/caddy/releases/download/v2.11.4/caddy_arm64 && \
  chown root:root caddy_arm64 && \
  chmod +x caddy_arm64 && \
  mv caddy_arm64 /usr/bin/caddy

# Uncomment for x64:
# RUN wget https://github.com/ltex-plus/ltex-ls-plus/releases/download/18.5.1/ltex-ls-plus-18.5.1-linux-x64.tar.gz && \
#   mkdir /ltex && \
#   tar -xf ltex-ls-plus-18.5.1-linux-x64.tar.gz -C /ltex && \
#   mv /ltex/ltex-ls-plus-18.5.1 /ltex/ltex-ls-plus && \
#   chown -R node:node /ltex && \
#   rm ltex-ls-plus-18.5.1-linux-x64.tar.gz

# RUN wget https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.deb && \
#   dpkg -i jdk-25_linux-x64_bin.deb && \
#   rm jdk-25_linux-x64_bin.deb

# RUN wget https://github.com/alexandzors/caddy/releases/download/v2.11.4/caddy && \
#   chown root:root caddy && \
#   chmod +x caddy && \
#   mv caddy /usr/bin/

USER node