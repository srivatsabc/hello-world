#!/usr/bin/env bash
# lib.sh — Azure REST helpers, sourced by deploy.sh. No `az` CLI calls at
# all: the az binary hangs indefinitely in this environment (confirmed on
# other projects, even a verbose debug run of az account show produces
# zero output before timing out, while raw curl to the same Azure
# endpoints responds in under a second), so deployment goes straight to
# the ARM/ACR/token REST APIs instead. Pure config (resource names, IDs)
# stays in .env, not here. Identical helper set to ai-learning/deploy/
# lib.sh, copied so this project's deploy has no cross-project path
# dependency.
ARM_API_VERSION="2023-12-01"
ACR_API_VERSION="2023-11-01-preview"

# Sets ARM_TOKEN from the DEPLOY_APP_CLIENT_ID/SECRET service principal.
get_arm_token() {
  local resp
  resp="$(curl -sf -X POST "https://login.microsoftonline.com/$AZURE_TENANT_ID/oauth2/v2.0/token" \
    -d "grant_type=client_credentials" \
    -d "client_id=$DEPLOY_APP_CLIENT_ID" \
    -d "client_secret=$DEPLOY_APP_CLIENT_SECRET" \
    -d "scope=https://management.azure.com/.default")"
  ARM_TOKEN="$(python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])" <<<"$resp")"
}

# arm_get <path-after-management.azure.com>  -> prints JSON body
arm_get() {
  curl -sf "https://management.azure.com$1" -H "Authorization: Bearer $ARM_TOKEN"
}

# arm_post <path> [json-body]  -> prints JSON body (if any)
arm_post() {
  local path=$1 body="${2:-}"
  # Azure's ARM gateway 411s a POST with no body at all (no Content-Length) —
  # always send at least "{}" rather than omitting -d.
  [[ -n "$body" ]] || body='{}'
  curl -sf -X POST "https://management.azure.com$path" \
    -H "Authorization: Bearer $ARM_TOKEN" -H "Content-Type: application/json" \
    -d "$body"
}

# arm_put <path> <json-body>  -> prints JSON body
arm_put() {
  curl -sf -X PUT "https://management.azure.com$1" \
    -H "Authorization: Bearer $ARM_TOKEN" -H "Content-Type: application/json" \
    -d "$2"
}

webapp_path() {
  echo "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$1/providers/Microsoft.Web/sites/$2"
}

get_webapp_hostname() {
  arm_get "$(webapp_path "$1" "$2")?api-version=$ARM_API_VERSION" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['properties']['defaultHostName'])"
}

get_acr_admin_credentials() {
  # Prints "username\npassword" — ACR_RESOURCE_GROUP/ACR_NAME must have
  # adminUserEnabled=true.
  arm_post "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$ACR_RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME/listCredentials?api-version=$ACR_API_VERSION" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['username']); print(d['passwords'][0]['value'])"
}

get_acr_login_server() {
  arm_get "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$ACR_RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME?api-version=$ACR_API_VERSION" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['properties']['loginServer'])"
}

# set_webapp_container <rg> <app> <image-full-ref> <registry-url> <registry-user> <registry-pass>
set_webapp_container() {
  local rg=$1 app=$2 image=$3 registry_url=$4 registry_user=$5 registry_pass=$6
  arm_put "$(webapp_path "$rg" "$app")/config/web?api-version=$ARM_API_VERSION" \
    "$(python3 -c "
import json
print(json.dumps({'properties': {'linuxFxVersion': 'DOCKER|' + '$image'}}))
")" >/dev/null

  # DOCKER_REGISTRY_SERVER_* app settings are how App Service authenticates
  # its own image pulls — set alongside the rest in set_webapp_appsettings.
  export _REGISTRY_URL="$registry_url" _REGISTRY_USER="$registry_user" _REGISTRY_PASS="$registry_pass"
}

# set_webapp_appsettings <rg> <app> <json-object-of-new-settings>
# Merges into whatever app settings already exist (matches `az webapp config
# appsettings set` semantics) rather than replacing the whole set, since the
# raw ARM PUT for this endpoint is otherwise a full overwrite.
set_webapp_appsettings() {
  local rg=$1 app=$2 new_settings_json=$3
  local current
  current="$(arm_post "$(webapp_path "$rg" "$app")/config/appsettings/list?api-version=$ARM_API_VERSION")"
  local merged
  merged="$(python3 -c "
import json, sys
current = json.loads(sys.argv[1]).get('properties', {})
new = json.loads(sys.argv[2])
current.update(new)
print(json.dumps({'properties': current}))
" "$current" "$new_settings_json")"
  arm_put "$(webapp_path "$rg" "$app")/config/appsettings?api-version=$ARM_API_VERSION" "$merged" >/dev/null
}

restart_webapp() {
  arm_post "$(webapp_path "$1" "$2")/restart?api-version=$ARM_API_VERSION" >/dev/null
}

# create_webapp <rg> <app> <plan-resource-id> <location> <image-ref>
# Creates (or updates) a Linux container Web App with a system-assigned
# identity on an existing App Service plan.
create_webapp() {
  local rg=$1 app=$2 plan=$3 location=$4 image=$5
  arm_put "$(webapp_path "$rg" "$app")?api-version=$ARM_API_VERSION" \
    "$(python3 -c "
import json, sys
print(json.dumps({
  'location': sys.argv[2], 'kind': 'app,linux,container',
  'identity': {'type': 'SystemAssigned'},
  'properties': {'serverFarmId': sys.argv[1], 'httpsOnly': True,
                 'siteConfig': {'linuxFxVersion': 'DOCKER|' + sys.argv[3], 'alwaysOn': True}},
}))" "$plan" "$location" "$image")" >/dev/null
}

# acr_build <image-name> <tag> <context-dir>
# Tars the context, uploads it to ACR, runs an ACR Task docker build that
# pushes <image>:<tag> and <image>:latest, and waits for it to finish.
acr_build() {
  local image=$1 tag=$2 ctx=$3
  local base="/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$ACR_RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME"
  local v="api-version=2019-06-01-preview"
  local tarball up upload_url rel run_id status
  tarball="$(mktemp --suffix=.tar.gz)"
  tar -czf "$tarball" --exclude-from="$ctx/.dockerignore" -C "$ctx" .
  up="$(arm_post "$base/listBuildSourceUploadUrl?$v")"
  upload_url="$(python3 -c "import json,sys; print(json.load(sys.stdin)['uploadUrl'])" <<<"$up")"
  rel="$(python3 -c "import json,sys; print(json.load(sys.stdin)['relativePath'])" <<<"$up")"
  curl -sf -X PUT "$upload_url" -H "x-ms-blob-type: BlockBlob" --data-binary "@$tarball" >/dev/null
  rm -f "$tarball"
  run_id="$(arm_post "$base/scheduleRun?$v" "$(python3 -c "
import json, sys
print(json.dumps({'type': 'DockerBuildRequest',
  'imageNames': [sys.argv[1] + ':' + sys.argv[2], sys.argv[1] + ':latest'],
  'sourceLocation': sys.argv[3], 'dockerFilePath': 'Dockerfile',
  'platform': {'os': 'Linux', 'architecture': 'amd64'}, 'isPushEnabled': True, 'timeout': 3600}))" "$image" "$tag" "$rel")" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['properties']['runId'])")"
  echo "[acr] build run $run_id started"
  for _ in $(seq 1 120); do
    status="$(arm_get "$base/runs/$run_id?$v" | python3 -c "import json,sys; print(json.load(sys.stdin)['properties']['status'])")"
    echo "[acr] status: $status"
    case "$status" in
      Succeeded) return 0 ;;
      Failed|Error|Canceled|Timeout) echo "ACR build $status (run $run_id)" >&2; return 1 ;;
    esac
    sleep 10
  done
  echo "ACR build timed out waiting (run $run_id)" >&2
  return 1
}
