#!/usr/bin/env bash
# deploy.sh -- builds the image in ACR (no local Docker needed), creates the
# Web App on the shared App Service plan if it does not exist yet, points it
# at the new image, applies the Azure OpenAI app settings and restarts it.
# Azure target (tenant, service principal, ACR, resource group, plan) is read
# from jev/.env, the same deploy target the jev app uses; the app's own
# runtime settings come from hello-world/.env. Runs with no `az` CLI, see
# lib.sh's header for why.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

DEPLOY_ENV="$APP_DIR/../jev/.env"
set -a
# shellcheck source=/dev/null
source "$DEPLOY_ENV"
# shellcheck source=/dev/null
source "$APP_DIR/.env"
set +a

WEBAPP_NAME="${HELLO_APP_NAME:-webmaznazone1dev03}"
WEBAPP_RG="$APP_RESOURCE_GROUP"
IMAGE="hello-world"
TAG="$(date +%Y%m%d%H%M%S)"

get_arm_token

echo "== Building $IMAGE:$TAG in ACR $ACR_NAME =="
acr_build "$IMAGE" "$TAG" "$APP_DIR"

ACR_LOGIN_SERVER="$(get_acr_login_server)"
mapfile -t ACR_CREDS < <(get_acr_admin_credentials)

echo "== Creating/updating Web App $WEBAPP_NAME in $WEBAPP_RG =="
# Same plan and region as the sibling web app (webmaznazone1dev02).
SIBLING="$(arm_get "$(webapp_path "$WEBAPP_RG" "$APP_NAME")?api-version=$ARM_API_VERSION")"
PLAN_ID="$(python3 -c "import json,sys; print(json.load(sys.stdin)['properties']['serverFarmId'])" <<<"$SIBLING")"
LOCATION="$(python3 -c "import json,sys; print(json.load(sys.stdin)['location'])" <<<"$SIBLING")"
create_webapp "$WEBAPP_RG" "$WEBAPP_NAME" "$PLAN_ID" "$LOCATION" "$ACR_LOGIN_SERVER/$IMAGE:$TAG"

SETTINGS_JSON="$(
  DOCKER_REGISTRY_SERVER_URL="https://$ACR_LOGIN_SERVER" \
  DOCKER_REGISTRY_SERVER_USERNAME="${ACR_CREDS[0]}" \
  DOCKER_REGISTRY_SERVER_PASSWORD="${ACR_CREDS[1]}" \
  WEBSITES_PORT=8430 \
  python3 -c "
import json, os
keys = ['AZURE_AI_FOUNDRY_ENDPOINT', 'AZURE_AI_FOUNDRY_API_KEY', 'AZURE_AI_FOUNDRY_CHAT_DEPLOYMENT',
        'DOCKER_REGISTRY_SERVER_URL', 'DOCKER_REGISTRY_SERVER_USERNAME', 'DOCKER_REGISTRY_SERVER_PASSWORD',
        'WEBSITES_PORT']
print(json.dumps({k: os.environ.get(k, '') for k in keys}))
"
)"
set_webapp_appsettings "$WEBAPP_RG" "$WEBAPP_NAME" "$SETTINGS_JSON"
restart_webapp "$WEBAPP_RG" "$WEBAPP_NAME"

echo "Deployed: https://$(get_webapp_hostname "$WEBAPP_RG" "$WEBAPP_NAME")"
