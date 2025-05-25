
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

### Testing Sqlite stuff locally
ex:
sqlite3 prompts-dev.db "SELECT p.* FROM prompts p LEFT JOIN metadata m ON p.id = m.id LIMIT -1 OFFSET 0;"

sqlite3 prompts-dev.db "SELECT content FROM prompts WHERE id='id-value' ORDER DESC limit 1"