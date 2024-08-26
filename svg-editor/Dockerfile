# Production stage
FROM nginx:1.16.1-alpine as production-stage
COPY dist/editor/ /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]