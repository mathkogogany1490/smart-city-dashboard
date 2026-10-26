# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build

WORKDIR /build/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# 빈 값이면 브라우저가 Nginx와 같은 주소로 /api, /ws 를 호출합니다.
ENV VITE_API_BASE_URL=
ENV VITE_WS_URL=

RUN npm run build

FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /build/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1/nginx-health >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
