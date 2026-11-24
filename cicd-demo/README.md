# cicd-demo

A small Node.js API (zero npm dependencies) for practising CI/CD with Docker.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | App name, version, environment |
| GET | `/health` | Health check (used by Docker and smoke test) |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task, body: `{"title": "..."}` |

## Run locally
```bash
npm run ci        # lint + tests
npm start         # http://localhost:3000
```

## Run with Docker
```bash
docker build -t cicd-demo:local .
docker run --rm -p 3000:3000 cicd-demo:local
# or
docker compose up --build
./scripts/smoke-test.sh http://localhost:3000
```

## What your pipeline can do with this
| Stage | Command |
|---|---|
| Install | `npm ci` |
| Lint | `npm run lint` |
| Test | `npm test` |
| Build image | `docker build -t <registry>/cicd-demo:<git-sha> .` |
| Scan image (optional) | `trivy image <registry>/cicd-demo:<git-sha>` |
| Push image | `docker push <registry>/cicd-demo:<git-sha>` |
| Deploy | pull the tag on your server / platform and restart |
| Verify | `./scripts/smoke-test.sh https://your-app-url` |

Tag images with the git commit SHA (not only `latest`) so every deploy can be rolled back.
