#!/usr/bin/env bash
# Checks that media is served through CloudFront and the S3 bucket is not
# publicly readable or writable. Anonymous requests only; needs curl.
#
#   ./scripts/verify-media-cdn.sh            # expects the bucket locked down
#   ./scripts/verify-media-cdn.sh --transition   # direct S3 reads still allowed
set -uo pipefail

CDN="https://d35rqdw1pzzbg5.cloudfront.net"
S3="https://ldragonphotographymedia.s3.amazonaws.com"
SITE="https://www.l-dragon.photography"
KEY="${KEY:-public/ldragon-full-black.png}"
EXPECT_DIRECT_READ=403
[[ "${1:-}" == "--transition" ]] && EXPECT_DIRECT_READ=200

fails=0
check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then echo "PASS  $name ($actual)"; else echo "FAIL  $name: expected $expected, got $actual"; fails=$((fails + 1)); fi
}
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
header() { curl -s -D - -o /dev/null "${@:2}" | tr -d '\r' | awk -v h="$1" 'tolower($0) ~ "^"h":" { sub(/^[^:]+: */, ""); print; exit }'; }

check "CloudFront serves the object" 200 "$(status "$CDN/$KEY")"
check "CloudFront redirects http to https" 301 "$(status "http://${CDN#https://}/$KEY")"
check "CloudFront sends CORS for lightbox downloads" '*' "$(header access-control-allow-origin -H "Origin: $SITE" "$CDN/$KEY")"
check "CloudFront never exposes a bucket listing" 403 "$(status "$CDN/")"
check "Direct S3 anonymous read" "$EXPECT_DIRECT_READ" "$(status "$S3/$KEY")"
check "Direct S3 anonymous listing" 403 "$(status "$S3/?list-type=2&max-keys=1")"
check "Direct S3 anonymous PUT" 403 "$(status -X PUT --data 'x' "$S3/verify-media-cdn-probe.txt")"
check "Direct S3 anonymous DELETE" 403 "$(status -X DELETE "$S3/verify-media-cdn-probe-does-not-exist.txt")"
check "Upload CORS preflight from the site" "$SITE" "$(header access-control-allow-origin -X OPTIONS -H "Origin: $SITE" -H 'Access-Control-Request-Method: PUT' -H 'Access-Control-Request-Headers: content-type' "$S3/tmp/probe.jpg")"
check "Upload CORS preflight from another origin is refused" 403 "$(status -X OPTIONS -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: PUT' "$S3/tmp/probe.jpg")"

echo
[[ $fails -eq 0 ]] && echo "All checks passed." || echo "$fails check(s) failed."
exit $((fails > 0))
