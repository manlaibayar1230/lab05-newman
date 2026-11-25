#!/usr/bin/env bash
# Тодорхойлолтоос гадуурх оролтоор API-г судлах (exploratory). Гаралт: results/defects.txt
cd "$(dirname "$0")/.."
B=http://localhost:3000; H='Content-Type: application/json'
req() { echo "\$ curl -X $1 $2 -d '$3'"; curl -s -m 3 -X "$1" "$B$2" -H "$H" -d "$3" -w "  [HTTP %{http_code}]" || echo "  [холболт тасарсан / хариугүй: curl exit $?]"; echo; }
node server.js > /dev/null 2>&1 & SRV=$!; sleep 1
echo "### D1: Нэг оюутан нэг хичээлд давхар бүртгүүлэх"
req PUT /students/D1S '{"status":"active","coursesTaken":["CS201"]}'
req PUT /courses/D1C '{"prerequisites":["CS201"]}'
req POST /registrations '{"studentID":"D1S","courseID":"D1C"}'
req POST /registrations '{"studentID":"D1S","courseID":"D1C"}'
echo
echo "### D2: coursesTaken массив биш, мөр (string) байх — includes() дэд мөрөөр таарна"
req PUT /students/D2S '{"status":"active","coursesTaken":"CS2019"}'
req PUT /courses/D2C '{"prerequisites":["CS201"]}'
req POST /registrations '{"studentID":"D2S","courseID":"D2C"}'
echo
echo "### D3: status хоосон мөр \"\" -> анхдагч \"active\" болж хувирна"
req PUT /students/D3S '{"status":"","coursesTaken":[]}'
req PUT /courses/D3C '{"prerequisites":[]}'
req POST /registrations '{"studentID":"D3S","courseID":"D3C"}'
echo
echo "### D4: Бие нь JSON null — сервер унах эсэх"
req POST /registrations 'null'
sleep 1
echo "--- дараагийн хүсэлт (сервер амьд эсэх):"
req GET /registrations ''
kill $SRV 2>/dev/null; wait $SRV 2>/dev/null
