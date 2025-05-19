
### Deploying with Docker

Build 
`docker build -t prompt-server .`

Volumes
 `docker volume create prompt-db`

Run 
```
docker run -p 8080:8080 \
  -v prompt-db:/data \
  -e STAGE=prod \
  prompt-server
```

Debugging 
`docker exec -it <container-id> /bin/bash`



Helpful commands

- list images
`docker image list`



Current Docker build times-
- May 18: 53.5 seconds